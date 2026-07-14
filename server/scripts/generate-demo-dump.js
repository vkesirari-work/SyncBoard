import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const outputDirectory = fileURLToPath(new URL('../demo-data/', import.meta.url))
const objectId = (number) => ({ $oid: number.toString(16).padStart(24, '0') })
const dateValue = (date) => ({ $date: date.toISOString() })

let seed = 20260714
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
function pick(items) { return items[Math.floor(random() * items.length)] }
function integer(min, max) { return Math.floor(random() * (max - min + 1)) + min }
function dateFromToday(days, hour = 10) {
  const date = new Date()
  date.setHours(hour, integer(0, 59), 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

const firstNames = ['Aarav', 'Aditi', 'Akash', 'Aman', 'Ananya', 'Arjun', 'Deepak', 'Diya', 'Gaurav', 'Harpreet', 'Ishaan', 'Karan', 'Kavya', 'Manpreet', 'Mehak', 'Mohit', 'Neha', 'Nikhil', 'Pooja', 'Pranav', 'Rahul', 'Riya', 'Rohit', 'Sakshi', 'Simran', 'Sneha', 'Tanvi', 'Varun', 'Vikram', 'Yash']
const lastNames = ['Arora', 'Bansal', 'Chauhan', 'Gill', 'Gupta', 'Jain', 'Kapoor', 'Kaur', 'Kumar', 'Malhotra', 'Mehta', 'Patel', 'Rana', 'Rao', 'Shah', 'Sharma', 'Singh', 'Soni', 'Verma', 'Yadav']
const goals = ['fat_loss', 'muscle_gain', 'general_fitness', 'personal_training']
const now = new Date()
const personName = (index) => `${pick(firstNames)} ${pick(lastNames)} ${index + 1}`

const plans = [
  ['Starter Monthly', 1, 1499, 'Full gym access and floor support'],
  ['Quarterly Pro', 3, 3999, 'Three-month transformation membership'],
  ['Half Year Strong', 6, 7499, 'Six months of consistent training'],
  ['Annual Unlimited', 12, 12999, 'Best-value annual membership'],
  ['Personal Training', 1, 6999, 'One-to-one coaching plan'],
].map(([name, durationMonths, price, description], index) => ({
  _id: objectId(index + 1), name, durationMonths, price, description, isActive: true,
  createdAt: dateValue(now), updatedAt: dateValue(now), __v: 0,
}))

const members = Array.from({ length: 600 }, (_, index) => {
  const planIndex = integer(0, plans.length - 1)
  const startOffset = integer(-330, -5)
  const endOffset = integer(-75, 220)
  const status = endOffset < 0 ? 'expired' : endOffset <= 14 ? 'expiring' : random() < .07 ? 'paused' : 'active'
  return {
    _id: objectId(1000 + index), name: personName(index),
    email: `member${String(index + 1).padStart(3, '0')}@siraridemo.in`,
    phone: `98${String(10000000 + index).slice(-8)}`, gender: pick(['male', 'female', 'other']),
    dateOfBirth: dateValue(dateFromToday(-integer(18 * 365, 55 * 365))),
    address: `${integer(1, 299)}, ${pick(['Main Market', 'Model Town', 'Green Avenue', 'Civil Lines', 'New Colony', 'Sector 12'])}`,
    plan: objectId(planIndex + 1), joinedAt: dateValue(dateFromToday(startOffset)),
    membershipStart: dateValue(dateFromToday(startOffset)), membershipEnd: dateValue(dateFromToday(endOffset)),
    status, notes: random() < .18 ? pick(['Prefers morning batch', 'Focus on mobility', 'Follow up for PT', 'Knee-friendly training', 'Weekend visits']) : '',
    createdAt: dateValue(dateFromToday(startOffset)), updatedAt: dateValue(now), __v: 0,
  }
})

const trainers = Array.from({ length: 40 }, (_, index) => ({
  _id: objectId(2000 + index), name: `${pick(firstNames)} ${pick(lastNames)} Coach ${index + 1}`,
  email: `trainer${index + 1}@siraridemo.in`, phone: `97${String(20000000 + index).slice(-8)}`,
  specialties: [...new Set([pick(['Strength', 'Fat loss', 'Mobility', 'Conditioning', 'Bodybuilding']), pick(['Nutrition', 'Functional fitness', 'Beginners', 'Powerlifting'])])],
  shift: pick(['morning', 'evening', 'full_day', 'flexible']),
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].filter(() => random() > .2),
  bio: 'Demo trainer profile for dashboard preview and workflow testing.', joinedAt: dateValue(dateFromToday(-integer(30, 900))), isActive: index < 36,
  assignedMembers: members.slice(index * 12, index * 12 + integer(8, 16)).map((member) => member._id),
  createdAt: dateValue(dateFromToday(-integer(30, 900))), updatedAt: dateValue(now), __v: 0,
}))

const leads = Array.from({ length: 600 }, (_, index) => {
  const createdAt = dateFromToday(-integer(0, 240))
  return {
    _id: objectId(3000 + index), name: personName(index + 700), phone: `96${String(30000000 + index).slice(-8)}`,
    email: random() > .25 ? `lead${index + 1}@example.in` : undefined, fitnessGoal: pick(goals),
    message: pick(['Interested in a free trial', 'Asked about morning batch', 'Wants personal training', 'Comparing quarterly plans', 'Referred by an existing member', 'Requested a callback']),
    source: pick(['website', 'instagram', 'walk_in', 'referral', 'google', 'admin']), status: pick(['new', 'new', 'contacted', 'contacted', 'converted', 'closed']),
    createdAt: dateValue(createdAt), updatedAt: dateValue(createdAt), __v: 0,
  }
})

const payments = Array.from({ length: 900 }, (_, index) => {
  const memberIndex = integer(0, members.length - 1)
  const planIndex = Number.parseInt(members[memberIndex].plan.$oid, 16) - 1
  const paidAt = dateFromToday(-integer(0, 400))
  const status = pick(['paid', 'paid', 'paid', 'paid', 'pending', 'failed', 'refunded'])
  return {
    _id: objectId(4000 + index), member: objectId(1000 + memberIndex), plan: objectId(planIndex + 1), amount: plans[planIndex].price,
    method: pick(['cash', 'upi', 'upi', 'card', 'bank_transfer']), status, paidAt: dateValue(paidAt),
    reference: `SFD-${paidAt.getFullYear()}-${String(index + 1).padStart(5, '0')}`, notes: status === 'refunded' ? 'Demo refund record' : '',
    createdAt: dateValue(paidAt), updatedAt: dateValue(paidAt), __v: 0,
  }
})

const attendance = Array.from({ length: 1800 }, (_, index) => {
  const memberIndex = integer(0, members.length - 1)
  const checkIn = dateFromToday(-integer(0, 150), integer(5, 20))
  const checkOut = new Date(checkIn.getTime() + integer(35, 125) * 60_000)
  return {
    _id: objectId(6000 + index), member: objectId(1000 + memberIndex), checkIn: dateValue(checkIn), checkOut: dateValue(checkOut),
    notes: random() < .04 ? 'Demo corrected visit' : '', createdAt: dateValue(checkIn), updatedAt: dateValue(checkOut), __v: 0,
  }
})
members.filter((member) => member.status === 'active').slice(0, 24).forEach((member, index) => attendance.push({
  _id: objectId(8000 + index), member: member._id, checkIn: dateValue(dateFromToday(0, 6 + (index % 12))), checkOut: null,
  notes: 'Currently inside (demo)', createdAt: dateValue(now), updatedAt: dateValue(now), __v: 0,
}))

const collections = { plans, members, trainers, leads, payments, attendance }
await mkdir(outputDirectory, { recursive: true })
await Promise.all(Object.entries(collections).map(([name, documents]) => writeFile(`${outputDirectory}${name}.json`, `${JSON.stringify(documents, null, 2)}\n`)))
console.log(`MongoDB Extended JSON demo dump created in ${outputDirectory}`)
Object.entries(collections).forEach(([name, documents]) => console.log(`${name}: ${documents.length}`))
