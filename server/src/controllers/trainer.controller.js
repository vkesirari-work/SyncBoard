import { Trainer } from '../models/trainer.model.js'

export async function listTrainers(_request, response, next) {
  try {
    const trainers = await Trainer.find()
      .populate('assignedMembers', 'name phone status')
      .sort({ createdAt: -1 })
    response.json({ trainers })
  } catch (error) {
    next(error)
  }
}

export async function createTrainer(request, response, next) {
  try {
    const trainer = await Trainer.create(request.body)
    await trainer.populate('assignedMembers', 'name phone status')
    request.app.get('io')?.emit('trainer:created', trainer)
    response.status(201).json({ trainer })
  } catch (error) {
    next(error)
  }
}

export async function updateTrainer(request, response, next) {
  try {
    const trainer = await Trainer.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    }).populate('assignedMembers', 'name phone status')
    if (!trainer) return response.status(404).json({ message: 'Trainer not found' })
    request.app.get('io')?.emit('trainer:updated', trainer)
    response.json({ trainer })
  } catch (error) {
    next(error)
  }
}

export async function deleteTrainer(request, response, next) {
  try {
    const trainer = await Trainer.findById(request.params.id)
    if (!trainer) return response.status(404).json({ message: 'Trainer not found' })
    if (trainer.assignedMembers.length) {
      return response.status(409).json({
        message: 'Trainer has assigned members and cannot be deleted. Remove assignments or mark the trainer inactive.',
      })
    }
    await trainer.deleteOne()
    request.app.get('io')?.emit('trainer:deleted', { id: trainer.id })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
