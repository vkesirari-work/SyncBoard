import { X } from 'lucide-react'
import { useState } from 'react'

const initialForm = {
  title: '',
  owner: 'Vikram',
  priority: 'Medium',
  columnId: 'new',
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
      setError('Member note is required')
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
            <p className="eyebrow">Member update</p>
            <h2 id="task-modal-title">Add member note</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Member note
            <input
              autoFocus
              name="title"
              onChange={updateField}
              placeholder="Add member, payment, or attendance note"
              value={form.title}
            />
          </label>

          <div className="form-grid">
            <label>
              Staff owner
              <input name="owner" onChange={updateField} value={form.owner} />
            </label>

            <label>
              Urgency
              <select name="priority" onChange={updateField} value={form.priority}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
          </div>

          <label>
            Member status
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
              Add note
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default TaskModal
