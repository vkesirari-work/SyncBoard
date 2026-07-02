import { X } from 'lucide-react'
import { useState } from 'react'

const initialForm = {
  title: '',
  owner: 'Vikram',
  priority: 'Medium',
  columnId: 'todo',
}

function TaskModal({ columns, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Task title is required')
      return
    }

    onCreate(form.columnId, {
      title: form.title.trim(),
      owner: form.owner.trim() || 'Unassigned',
      priority: form.priority,
    })
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">New work item</p>
            <h2 id="task-modal-title">Create task</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Task title
            <input
              autoFocus
              name="title"
              onChange={updateField}
              placeholder="Write task title"
              value={form.title}
            />
          </label>

          <div className="form-grid">
            <label>
              Owner
              <input name="owner" onChange={updateField} value={form.owner} />
            </label>

            <label>
              Priority
              <select name="priority" onChange={updateField} value={form.priority}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
          </div>

          <label>
            Status
            <select name="columnId" onChange={updateField} value={form.columnId}>
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" type="submit">
              Create task
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default TaskModal
