import { readFile } from 'node:fs/promises'
import mongoose from 'mongoose'
import { connectDatabase } from '../src/config/database.js'
import { env } from '../src/config/env.js'
import { Attendance } from '../src/models/attendance.model.js'
import { Lead } from '../src/models/lead.model.js'
import { Member } from '../src/models/member.model.js'
import { Payment } from '../src/models/payment.model.js'
import { Plan } from '../src/models/plan.model.js'
import { Trainer } from '../src/models/trainer.model.js'

if (!process.argv.includes('--confirm')) {
  console.error('Import cancelled. Run with --confirm to upload demo data to MongoDB Atlas.')
  process.exit(1)
}

const dataDirectory = new URL('../demo-data/', import.meta.url)
const collections = [
  ['plans', Plan],
  ['members', Member],
  ['trainers', Trainer],
  ['leads', Lead],
  ['payments', Payment],
  ['attendance', Attendance],
]

function reviveExtendedJson(value) {
  if (Array.isArray(value)) return value.map(reviveExtendedJson)
  if (!value || typeof value !== 'object') return value
  if (typeof value.$oid === 'string') return new mongoose.Types.ObjectId(value.$oid)
  if (typeof value.$date === 'string') return new Date(value.$date)
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, reviveExtendedJson(item)]))
}

try {
  await connectDatabase(env.mongodbUri)

  const counts = await Promise.all(collections.map(([, model]) => model.countDocuments()))
  const existingCount = counts.reduce((total, count) => total + count, 0)
  if (existingCount > 0) {
    throw new Error(`Dashboard already contains ${existingCount} records. Use Clear test data first, then run the import again.`)
  }

  console.log('Uploading demo data to MongoDB Atlas…')
  for (const [fileName, model] of collections) {
    const source = await readFile(new URL(`${fileName}.json`, dataDirectory), 'utf8')
    const documents = reviveExtendedJson(JSON.parse(source))
    await model.collection.insertMany(documents, { ordered: true })
    console.log(`${fileName}: ${documents.length} imported`)
  }

  console.log('Demo import complete. Login accounts were preserved. Refresh the dashboard.')
} catch (error) {
  console.error(`Could not import demo data: ${error.message}`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
