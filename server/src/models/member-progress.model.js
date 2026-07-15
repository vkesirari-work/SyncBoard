import mongoose from 'mongoose'

const measurementSchema = new mongoose.Schema({
  recordedAt: { type: Date, default: Date.now, required: true },
  weightKg: { type: Number, min: 20, max: 400 },
  heightCm: { type: Number, min: 80, max: 260 },
  bodyFatPercent: { type: Number, min: 1, max: 75 },
  chestCm: { type: Number, min: 20, max: 250 },
  waistCm: { type: Number, min: 20, max: 250 },
  hipsCm: { type: Number, min: 20, max: 250 },
  bicepsCm: { type: Number, min: 10, max: 100 },
  thighCm: { type: Number, min: 10, max: 150 },
  notes: { type: String, trim: true, maxlength: 1000, default: '' },
  recordedBy: { type: String, trim: true, default: '' },
}, { timestamps: true })

const exerciseSchema = new mongoose.Schema({
  day: { type: String, trim: true, maxlength: 30, default: '' },
  name: { type: String, trim: true, maxlength: 100, required: true },
  sets: { type: Number, min: 1, max: 20, default: 3 },
  reps: { type: String, trim: true, maxlength: 30, default: '10' },
  load: { type: String, trim: true, maxlength: 30, default: '' },
  notes: { type: String, trim: true, maxlength: 250, default: '' },
})

const photoSchema = new mongoose.Schema({
  image: { type: String, required: true, maxlength: 650_000 },
  label: { type: String, trim: true, maxlength: 80, default: 'Progress photo' },
  takenAt: { type: Date, default: Date.now },
  uploadedBy: { type: String, trim: true, default: '' },
}, { timestamps: true })

const memberProgressSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, unique: true, index: true },
  goal: { type: String, trim: true, maxlength: 500, default: '' },
  targetWeightKg: { type: Number, min: 20, max: 400 },
  targetBodyFatPercent: { type: Number, min: 1, max: 75 },
  measurements: { type: [measurementSchema], default: [] },
  workoutPlan: {
    title: { type: String, trim: true, maxlength: 100, default: '' },
    goal: { type: String, trim: true, maxlength: 300, default: '' },
    coachNotes: { type: String, trim: true, maxlength: 1500, default: '' },
    exercises: { type: [exerciseSchema], default: [] },
    updatedAt: Date,
    updatedBy: { type: String, trim: true, default: '' },
  },
  photos: { type: [photoSchema], default: [] },
}, { timestamps: true })

export const MemberProgress = mongoose.model('MemberProgress', memberProgressSchema)
