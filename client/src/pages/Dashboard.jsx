import { ArrowRight, Clock3, MessageSquare, Radio, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { activity, projects } from '../lib/mockData'

const stats = [
  { label: 'Active projects', value: '03', icon: Radio },
  { label: 'Online members', value: '12', icon: Users },
  { label: 'Open comments', value: '23', icon: MessageSquare },
  { label: 'Due this week', value: '07', icon: Clock3 },
]

function Dashboard() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h1>Plan, discuss, and ship in realtime.</h1>
        </div>
        <Link className="primary-button" to="/projects/syncboard-web">
          <span>Open board</span>
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
              <p className="eyebrow">Projects</p>
              <h2>Current work</h2>
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
                <div className="progress-track" aria-label={`${project.completion}% complete`}>
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
              <p className="eyebrow">Live feed</p>
              <h2>Recent activity</h2>
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
