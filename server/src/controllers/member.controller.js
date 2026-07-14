import { Member } from '../models/member.model.js'

export async function listMembers(request, response, next) {
  try {
    const filter = request.query.status ? { status: request.query.status } : {}
    const members = await Member.find(filter).populate('plan').sort({ createdAt: -1 })
    response.json({ members })
  } catch (error) {
    next(error)
  }
}

export async function getMember(request, response, next) {
  try {
    const member = await Member.findById(request.params.id).populate('plan')
    if (!member) return response.status(404).json({ message: 'Member not found' })
    response.json({ member })
  } catch (error) {
    next(error)
  }
}

export async function createMember(request, response, next) {
  try {
    const member = await Member.create(request.body)
    await member.populate('plan')
    request.app.get('io')?.emit('member:created', member)
    response.status(201).json({ member })
  } catch (error) {
    next(error)
  }
}

export async function updateMember(request, response, next) {
  try {
    const member = await Member.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    }).populate('plan')

    if (!member) return response.status(404).json({ message: 'Member not found' })
    request.app.get('io')?.emit('member:updated', member)
    response.json({ member })
  } catch (error) {
    next(error)
  }
}

export async function deleteMember(request, response, next) {
  try {
    const member = await Member.findByIdAndDelete(request.params.id)
    if (!member) return response.status(404).json({ message: 'Member not found' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
