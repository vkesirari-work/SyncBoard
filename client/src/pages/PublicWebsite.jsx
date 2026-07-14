import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Dumbbell,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import gymHero from '../assets/gym-hero.png'

const plans = [
  { name: 'Monthly', price: '₹1,499', detail: 'Gym access, cardio, strength floor' },
  { name: 'Quarterly', price: '₹3,999', detail: 'Best for steady fat-loss progress' },
  { name: 'Annual', price: '₹12,999', detail: 'Priority support and free fitness review' },
]

const facilities = [
  { title: 'Strength floor', icon: Dumbbell, text: 'Free weights, machines, benches, racks, and guided lifting support.' },
  { title: 'Trainer guidance', icon: Users, text: 'Personal coaching for beginners, transformations, and strength goals.' },
  { title: 'Clean operations', icon: ShieldCheck, text: 'Managed batches, renewals, attendance, and member follow-ups.' },
]

const trainers = [
  { name: 'Aman Verma', role: 'Strength Coach', shift: 'Morning batch' },
  { name: 'Nisha Rao', role: 'Fat-loss Specialist', shift: 'Evening batch' },
  { name: 'Riya Sharma', role: 'Mobility Trainer', shift: 'Weekend batch' },
]

function PublicWebsite() {
  return (
    <main className="site-page">
      <header className="site-nav">
        <Link className="site-brand" to="/">
          <span>S</span>
          <strong>Sirari Fitness</strong>
        </Link>
        <nav aria-label="Gym website navigation">
          <a href="#plans">Plans</a>
          <a href="#facilities">Facilities</a>
          <a href="#trainers">Trainers</a>
          <a href="#contact">Contact</a>
        </nav>
        <Link className="site-login" to="/login">Admin login</Link>
      </header>

      <section className="site-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(9, 14, 24, 0.88), rgba(9, 14, 24, 0.44), rgba(9, 14, 24, 0.18)), url(${gymHero})` }}>
        <div className="site-hero-content">
          <p className="site-kicker">Sirari Fitness gym experience</p>
          <h1>Train stronger with guided fitness, clean facilities, and flexible plans.</h1>
          <p>
            Join Sirari Fitness for real progress: strength training, cardio, personal coaching,
            and simple membership support from trial day to renewal.
          </p>
          <div className="site-hero-actions">
            <a className="site-primary" href="#contact">
              Book free trial
              <ArrowRight size={18} />
            </a>
            <a className="site-secondary" href="#plans">View plans</a>
          </div>
          <div className="site-hero-stats" aria-label="Gym highlights">
            <span><strong>180+</strong> active members</span>
            <span><strong>06</strong> trainer-led batches</span>
            <span><strong>5am-11pm</strong> open daily</span>
          </div>
        </div>
      </section>

      <section className="site-band" id="facilities">
        <div className="site-section-heading">
          <p className="site-kicker">Facilities</p>
          <h2>Everything members need to show up consistently.</h2>
        </div>
        <div className="facility-grid">
          {facilities.map((item) => (
            <article className="facility-card" key={item.title}>
              <item.icon size={24} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-band alt" id="plans">
        <div className="site-section-heading compact-heading">
          <p className="site-kicker">Membership</p>
          <h2>Simple plans for every fitness stage.</h2>
        </div>
        <div className="plan-grid">
          {plans.map((plan) => (
            <article className="plan-card" key={plan.name}>
              <div>
                <p>{plan.name}</p>
                <strong>{plan.price}</strong>
                <span>{plan.detail}</span>
              </div>
              <CheckCircle2 size={22} />
            </article>
          ))}
        </div>
      </section>

      <section className="site-band split" id="trainers">
        <div className="trainer-copy">
          <p className="site-kicker">Coaching</p>
          <h2>Friendly trainers for beginners and serious lifters.</h2>
          <p>
            Members can choose guided batches, personal training, and progress check-ins.
            Your Sirari admin panel can later manage these leads, renewals, and attendance records.
          </p>
        </div>
        <div className="trainer-list">
          {trainers.map((trainer) => (
            <article className="trainer-row" key={trainer.name}>
              <div>
                <strong>{trainer.name}</strong>
                <span>{trainer.role}</span>
              </div>
              <em>{trainer.shift}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="site-band contact-band" id="contact">
        <div className="contact-details">
          <p className="site-kicker">Visit us</p>
          <h2>Start with a free trial workout.</h2>
          <p><MapPin size={18} /> Sirari Fitness, main market road</p>
          <p><Clock3 size={18} /> Open daily, 5:00 AM to 11:00 PM</p>
          <p><Phone size={18} /> +91 90000 00000</p>
        </div>
        <form className="lead-form">
          <label>
            Name
            <input placeholder="Your name" />
          </label>
          <label>
            Phone
            <input placeholder="Mobile number" />
          </label>
          <label>
            Fitness goal
            <select defaultValue="">
              <option value="" disabled>Choose goal</option>
              <option>Fat loss</option>
              <option>Muscle gain</option>
              <option>General fitness</option>
              <option>Personal training</option>
            </select>
          </label>
          <button className="site-primary full" type="button">
            Request callback
            <Sparkles size={18} />
          </button>
        </form>
      </section>
    </main>
  )
}

export default PublicWebsite
