import { ArrowLeft, ArrowRight, MessageSquare, Plus, Radio } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import TaskModal from '../components/ui/TaskModal'
import { projects } from '../lib/mockData'
import { useBoardStore } from '../store/useBoardStore'

function ProjectBoard() {
  const { projectId } = useParams()
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const project = projects.find((item) => item.id === projectId) || projects[0]
  const columns = useBoardStore((state) => state.columns)
  const addTask = useBoardStore((state) => state.addTask)
  const moveTask = useBoardStore((state) => state.moveTask)

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Member board</p>
          <h1>{project.name}</h1>
          <div className="inline-meta">
            <span>
              <Radio size={15} />
              Live gym desk enabled
            </span>
            <span>{project.members} members</span>
            <span>{project.due}</span>
          </div>
        </div>
        <button className="primary-button" type="button" onClick={() => setIsTaskModalOpen(true)}>
          <Plus size={18} />
          <span>Add member note</span>
        </button>
      </div>

      <div className="board-grid">
        {columns.map((column, columnIndex) => (
          <section className="board-column" key={column.id}>
            <div className="column-header">
              <h2>{column.title}</h2>
              <span>{column.tasks.length}</span>
            </div>

            <div className="task-list">
              {column.tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-card-top">
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <div className="task-move-actions">
                      <button
                        className="icon-button small"
                        type="button"
                        aria-label="Move member left"
                        disabled={columnIndex === 0}
                        onClick={() => moveTask(task.id, -1)}
                      >
                        <ArrowLeft size={15} />
                      </button>
                      <button
                        className="icon-button small"
                        type="button"
                        aria-label="Move member right"
                        disabled={columnIndex === columns.length - 1}
                        onClick={() => moveTask(task.id, 1)}
                      >
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                  <h3>{task.title}</h3>
                  <div className="task-meta">
                    <span>{task.owner}</span>
                    <span>
                      <MessageSquare size={14} />
                      {task.comments}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {isTaskModalOpen ? (
        <TaskModal
          columns={columns}
          onClose={() => setIsTaskModalOpen(false)}
          onCreate={addTask}
        />
      ) : null}
    </section>
  )
}

export default ProjectBoard
