import { beforeEach, describe, expect, it, vi } from 'vitest'
import { boardColumns } from '../lib/mockData'
import { useBoardStore } from './useBoardStore'

describe('useBoardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({ columns: structuredClone(boardColumns) })
  })

  it('adds a task to the requested column with generated defaults', () => {
    vi.spyOn(Date, 'now').mockReturnValue(12345)
    useBoardStore.getState().addTask('new', { title: 'Tour follow-up', owner: 'Vikram' })

    expect(useBoardStore.getState().columns[0].tasks[0]).toMatchObject({
      id: 'task-12345', title: 'Tour follow-up', owner: 'Vikram', comments: 0,
    })
  })

  it('moves a task right and left between adjacent columns', () => {
    useBoardStore.getState().moveTask('task-1', 1)
    expect(useBoardStore.getState().columns[0].tasks.some(({ id }) => id === 'task-1')).toBe(false)
    expect(useBoardStore.getState().columns[1].tasks[0].id).toBe('task-1')

    useBoardStore.getState().moveTask('task-1', -1)
    expect(useBoardStore.getState().columns[0].tasks[0].id).toBe('task-1')
  })

  it('ignores unknown tasks and moves outside board boundaries', () => {
    const original = useBoardStore.getState().columns
    useBoardStore.getState().moveTask('missing-task', 1)
    useBoardStore.getState().moveTask('task-1', -1)
    useBoardStore.getState().moveTask('task-6', 1)
    expect(useBoardStore.getState().columns).toEqual(original)
  })
})
