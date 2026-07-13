import { ArrowRight, Clock3, CreditCard, Radio, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { activity, projects } from '../lib/mockData'

const stats = [
  { label: 'Active members', value: '181', icon: Users },
  { label: 'Today check-ins', value: '46', icon: Radio },
  { label: 'Monthly revenue', value: '2.4L', icon: CreditCard },
  { label: 'Renewals due', value: '12', icon: Clock3 },
]

function Dashboard() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gym overview</p>
          <h1>Manage members, payments, and daily gym operations.</h1>
        </div>
        <Link className="primary-button" to="/projects/main-floor">
          <span>Open member board</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <stat.icon size={20} />
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Operations</p>
              <h2>Gym areas</h2>
            </div>
          </div>

          <div className="project-table">
            {projects.map((project) => (
              <Link className="project-row" key={project.id} to={`/projects/${project.id}`}>
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.members} members</span>
                </div>
                <span className="status-pill">{project.status}</span>
                <div className="progress-track" aria-label={`${project.completion}% capacity`}>
                  <span style={{ width: `${project.completion}%` }} />
                </div>
                <span>{project.due}</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Activity</p>
              <h2>Recent gym updates</h2>
            </div>
          </div>
          <div className="activity-list">
            {activity.map((item) => (
              <div className="activity-item" key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Dashboard
