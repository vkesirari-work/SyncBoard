import { create } from 'zustand'
import { boardColumns } from '../lib/mockData'

const columnOrder = boardColumns.map((column) => column.id)

function createTaskId() {
  return `task-${Date.now()}`
}

export const useBoardStore = create((set) => ({
  columns: boardColumns,
  addTask: (columnId, task) =>
    set((state) => ({
      columns: state.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: [
                {
                  id: createTaskId(),
                  comments: 0,
                  ...task,
                },
                ...column.tasks,
              ],
            }
          : column,
      ),
    })),
  moveTask: (taskId, direction) =>
    set((state) => {
      const sourceIndex = state.columns.findIndex((column) =>
        column.tasks.some((task) => task.id === taskId),
      )

      if (sourceIndex === -1) {
        return state
      }

      const targetIndex = sourceIndex + direction

      if (targetIndex < 0 || targetIndex >= columnOrder.length) {
        return state
      }

      const sourceColumn = state.columns[sourceIndex]
      const task = sourceColumn.tasks.find((item) => item.id === taskId)

      return {
        columns: state.columns.map((column, index) => {
          if (index === sourceIndex) {
            return {
              ...column,
              tasks: column.tasks.filter((item) => item.id !== taskId),
            }
          }

          if (index === targetIndex) {
            return {
              ...column,
              tasks: [task, ...column.tasks],
            }
          }

          return column
        }),
      }
    }),
}))
