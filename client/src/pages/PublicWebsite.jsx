import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  MapPin,
  Menu,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gymHero from '../assets/gym-hero.jpg'
import { api } from '../lib/api'
import { useGymSettings } from '../hooks/useGymSettings'
import './PublicWebsite.css'

const programs = [
  { number: '01', title: 'Strength', icon: Dumbbell, text: 'Build raw strength with progressive programming, free weights and expert form coaching.' },
  { number: '02', title: 'Conditioning', icon: Zap, text: 'Move faster, breathe better and unlock athletic endurance through high-energy sessions.' },
  { number: '03', title: 'Transformation', icon: Target, text: 'A goal-led plan combining training, progress reviews and consistent trainer accountability.' },
]

const plans = [
  { name: 'Monthly', price: '1,499', tag: 'Start strong', featured: false },
  { name: 'Quarterly', price: '3,999', tag: 'Most popular', featured: true },
  { name: 'Annual', price: '12,999', tag: 'Maximum value', featured: false },
]

const trainers = [
  { initials: 'AV', name: 'Aman Verma', role: 'Strength & Performance', stat: '8+ years coaching' },
  { initials: 'NR', name: 'Nisha Rao', role: 'Fat Loss & Conditioning', stat: '200+ transformations' },
  { initials: 'RS', name: 'Riya Sharma', role: 'Mobility & Functional Fitness', stat: 'Certified specialist' },
]

function PublicWebsite() {
  const gymSettings = useGymSettings()
  const siteRef = useRef(null)
  const progressRef = useRef(null)
  const heroRef = useRef(null)
  const [lead, setLead] = useState({ name: '', phone: '', fitnessGoal: '' })
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const site = siteRef.current
    const revealItems = site?.querySelectorAll('.sf-reveal') || []
    const tiltItems = site?.querySelectorAll('.sf-tilt') || []
    const magneticItems = site?.querySelectorAll('.sf-magnetic') || []
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' })
    revealItems.forEach((item) => observer.observe(item))

    let frame
    const updateScrollEffects = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight
      const progress = maximum > 0 ? window.scrollY / maximum : 0
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
      if (heroRef.current && window.scrollY < window.innerHeight * 1.2) {
        heroRef.current.style.setProperty('--hero-shift', `${window.scrollY * 0.09}px`)
      }
      frame = null
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollEffects)
    }
    const onPointerMove = (event) => {
      site?.style.setProperty('--pointer-x', `${event.clientX}px`)
      site?.style.setProperty('--pointer-y', `${event.clientY}px`)
    }
    const tiltMove = (event) => {
      if (!window.matchMedia('(pointer: fine)').matches) return
      const card = event.currentTarget
      const bounds = card.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width - .5
      const y = (event.clientY - bounds.top) / bounds.height - .5
      card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-6px)`
      card.style.setProperty('--shine-x', `${(x + .5) * 100}%`)
      card.style.setProperty('--shine-y', `${(y + .5) * 100}%`)
    }
    const tiltLeave = (event) => { event.currentTarget.style.transform = '' }
    const magneticMove = (event) => {
      if (!window.matchMedia('(pointer: fine)').matches) return
      const button = event.currentTarget
      const bounds = button.getBoundingClientRect()
      button.style.transform = `translate(${(event.clientX - bounds.left - bounds.width / 2) * .13}px, ${(event.clientY - bounds.top - bounds.height / 2) * .18}px)`
    }
    const magneticLeave = (event) => { event.currentTarget.style.transform = '' }
    updateScrollEffects()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    tiltItems.forEach((item) => { item.addEventListener('pointermove', tiltMove); item.addEventListener('pointerleave', tiltLeave) })
    magneticItems.forEach((item) => { item.addEventListener('pointermove', magneticMove); item.addEventListener('pointerleave', magneticLeave) })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      tiltItems.forEach((item) => { item.removeEventListener('pointermove', tiltMove); item.removeEventListener('pointerleave', tiltLeave) })
      magneticItems.forEach((item) => { item.removeEventListener('pointermove', magneticMove); item.removeEventListener('pointerleave', magneticLeave) })
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  function updateLead(event) {
    setLead((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submitLead(event) {
    event.preventDefault()
    setSubmitState({ status: 'submitting', message: '' })
    try {
      await api.post('/leads', lead)
      setLead({ name: '', phone: '', fitnessGoal: '' })
      setSubmitState({ status: 'success', message: 'You’re in. Our team will call you shortly.' })
    } catch (error) {
      setSubmitState({ status: 'error', message: error.response?.data?.message || 'Could not send your request. Please try again.' })
    }
  }

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <main className="sf-site" ref={siteRef}>
      <div className="sf-scroll-progress" ref={progressRef} />
      <header className="sf-nav">
        <Link className="sf-logo" to="/" aria-label="Sirari Fitness home">
          <span><Dumbbell size={18} /></span>
          <strong>{gymSettings.gymName.toUpperCase()}</strong>
        </Link>
        <button className="sf-menu-button" type="button" aria-label="Toggle navigation" onClick={() => setIsMenuOpen((open) => !open)}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={isMenuOpen ? 'open' : ''} aria-label="Gym website navigation">
          <a href="#programs" onClick={closeMenu}>Programs</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#membership" onClick={closeMenu}>Membership</a>
          <a href="#coaches" onClick={closeMenu}>Coaches</a>
        </nav>
        <a className="sf-nav-cta" href="#contact">Start training <ArrowDownRight size={17} /></a>
      </header>

      <section className="sf-hero" ref={heroRef} style={{ '--hero-image': `url(${gymHero})` }}>
        <div className="sf-hero-noise" />
        <div className="sf-kinetic" aria-hidden="true"><span /><span /><span /></div>
        <div className="sf-hero-copy">
          <div className="sf-label"><span /> Built for more</div>
          <h1>BREAK YOUR <em>LIMITS.</em></h1>
          <p>Not another workout. A stronger standard for your body, mindset and everyday performance.</p>
          <div className="sf-hero-actions">
            <a className="sf-button lime sf-magnetic" href="#contact">Book free trial <ArrowRight size={18} /></a>
            <a className="sf-play" href="#about"><span><Play size={16} fill="currentColor" /></span> Explore the gym</a>
          </div>
        </div>
        <div className="sf-hero-side">
          <span>EST. 2026</span>
          <div />
          <a href="#contact">JOIN THE MOVEMENT</a>
        </div>
        <div className="sf-hero-proof">
          <div className="sf-proof-faces"><span>AV</span><span>NR</span><span>RS</span></div>
          <p><strong>180+</strong> people train stronger with us</p>
        </div>
        <a className="sf-scroll" href="#programs"><ArrowDownRight size={21} /> Scroll to discover</a>
      </section>

      <div className="sf-marquee" aria-label="Sirari Fitness benefits">
        <div>
          {[0, 1].map((loop) => <span key={loop}>STRENGTH <Sparkles /> CONDITIONING <Sparkles /> COACHING <Sparkles /> COMMUNITY <Sparkles /> TRANSFORMATION <Sparkles /> </span>)}
        </div>
      </div>

      <section className="sf-section sf-programs" id="programs">
        <div className="sf-section-head sf-reveal">
          <div><p className="sf-kicker">Choose your discipline</p><h2>TRAIN WITH<br /><em>PURPOSE.</em></h2></div>
          <p>From your first rep to your strongest season, every Sirari program is built around measurable progress.</p>
        </div>
        <div className="sf-program-grid sf-reveal sf-stagger">
          {programs.map((program) => (
            <article className="sf-program-card sf-tilt" key={program.title}>
              <div className="sf-program-top"><span>{program.number}</span><program.icon size={25} /></div>
              <div><h3>{program.title}</h3><p>{program.text}</p></div>
              <a href="#contact" aria-label={`Start ${program.title}`}>Explore program <ArrowRight size={17} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="sf-story" id="about">
        <div className="sf-story-image sf-reveal sf-reveal-left" style={{ backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(5,7,6,.8)), url(${gymHero})` }}>
          <div className="sf-image-stamp"><strong>NO</strong><span>EXCUSES</span></div>
          <div className="sf-image-caption"><span>01</span><p>A space designed to make hard work feel inevitable.</p></div>
        </div>
        <div className="sf-story-copy sf-reveal">
          <p className="sf-kicker">This is Sirari</p>
          <h2>MORE THAN A GYM.<br /><em>YOUR EDGE.</em></h2>
          <p className="sf-story-lead">We created a focused training environment where great equipment, genuine coaching and a driven community work together.</p>
          <div className="sf-story-points">
            <div><ShieldCheck /><span><strong>Expert guidance</strong>Real coaches. Clear progress. Zero guesswork.</span></div>
            <div><Flame /><span><strong>High-energy space</strong>Premium equipment and an atmosphere that moves you.</span></div>
            <div><Users /><span><strong>Stronger together</strong>A community that notices when you show up.</span></div>
          </div>
          <a className="sf-text-link" href="#contact">Meet your strongest self <ArrowRight /></a>
        </div>
      </section>

      <section className="sf-numbers sf-reveal sf-stagger" aria-label="Gym statistics">
        <div><strong>180<span>+</span></strong><p>Active members</p></div>
        <div><strong>06</strong><p>Expert coaches</p></div>
        <div><strong>18<span>h</span></strong><p>Open every day</p></div>
        <div><strong>4.9<span>/5</span></strong><p>Member rating</p></div>
      </section>

      <section className="sf-section sf-pricing" id="membership">
        <div className="sf-section-head light sf-reveal">
          <div><p className="sf-kicker">Membership</p><h2>INVEST IN<br /><em>YOURSELF.</em></h2></div>
          <p>Simple memberships. Serious facilities. No confusing fine print—just everything you need to train consistently.</p>
        </div>
        <div className="sf-price-grid sf-reveal sf-stagger">
          {plans.map((plan) => (
            <article className={`sf-price-card sf-tilt ${plan.featured ? 'featured' : ''}`} key={plan.name}>
              {plan.featured && <span className="sf-popular">Recommended</span>}
              <p>{plan.tag}</p><h3>{plan.name}</h3>
              <div className="sf-price"><sup>₹</sup><strong>{plan.price}</strong><span>/ plan</span></div>
              <ul><li><Check /> Full gym access</li><li><Check /> Fitness assessment</li><li><Check /> Trainer floor support</li><li><Check /> Progress review</li></ul>
              <a href="#contact">Choose plan <ChevronRight size={18} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="sf-section sf-coaches" id="coaches">
        <div className="sf-section-head sf-reveal">
          <div><p className="sf-kicker">Your coaching team</p><h2>BUILT BY THE<br /><em>BEST.</em></h2></div>
          <p>Approachable when you need support. Relentless when you need a push. Meet the people behind your progress.</p>
        </div>
        <div className="sf-coach-grid sf-reveal sf-stagger">
          {trainers.map((trainer, index) => (
            <article className="sf-coach-card sf-tilt" key={trainer.name}>
              <div className="sf-coach-visual"><span>{trainer.initials}</span><small>0{index + 1}</small></div>
              <div><p>{trainer.role}</p><h3>{trainer.name}</h3><span>{trainer.stat}</span></div>
              <a href="#contact" aria-label={`Train with ${trainer.name}`}><ArrowDownRight /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="sf-contact" id="contact">
        <div className="sf-contact-copy sf-reveal sf-reveal-left">
          <p className="sf-kicker">Your first workout is on us</p>
          <h2>READY TO<br /><em>SHOW UP?</em></h2>
          <p>Tell us your goal. A Sirari coach will call you to schedule a free trial and gym tour.</p>
          <div className="sf-contact-details">
            <span><MapPin /> {gymSettings.gymName}, {gymSettings.address}</span>
            <span><Clock3 /> {gymSettings.openingHours}</span>
            <span><Phone /> {gymSettings.phone}</span>
          </div>
        </div>
        <form className="sf-lead-form sf-reveal" onSubmit={submitLead}>
          <div className="sf-form-number">FREE TRIAL / 01</div>
          <label><span>Your name</span><input name="name" placeholder="Enter full name" value={lead.name} onChange={updateLead} autoComplete="name" required /></label>
          <label><span>Phone number</span><input name="phone" type="tel" placeholder="Enter mobile number" value={lead.phone} onChange={updateLead} autoComplete="tel" required /></label>
          <label><span>Primary goal</span><select name="fitnessGoal" value={lead.fitnessGoal} onChange={updateLead} required><option value="" disabled>Select your goal</option><option value="fat_loss">Fat loss</option><option value="muscle_gain">Muscle gain</option><option value="general_fitness">General fitness</option><option value="personal_training">Personal training</option></select></label>
          {submitState.message && <p className={`sf-form-message ${submitState.status}`} role={submitState.status === 'error' ? 'alert' : 'status'}>{submitState.message}</p>}
          <button className="sf-magnetic" type="submit" disabled={submitState.status === 'submitting'}>{submitState.status === 'submitting' ? 'Sending…' : 'Claim free trial'} <ArrowRight /></button>
        </form>
      </section>

      <footer className="sf-footer">
        <div><Link className="sf-logo" to="/"><span><Dumbbell size={18} /></span><strong>{gymSettings.gymName.toUpperCase()}</strong></Link><p>{gymSettings.tagline}</p></div>
        <div><strong>Explore</strong><a href="#programs">Programs</a><a href="#membership">Membership</a><a href="#coaches">Coaches</a></div>
        <div><strong>Connect</strong><a href={`tel:${gymSettings.phone.replace(/[^+\d]/g, '')}`}>Call the gym</a><a href="#contact">Book a trial</a>{gymSettings.instagramUrl ? <a href={gymSettings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a> : <a href="#contact">Instagram</a>}</div>
        <div><strong>Staff</strong><Link to="/login">Admin login</Link></div>
        <p className="sf-copyright">© 2026 {gymSettings.gymName}. Built for stronger days.</p>
      </footer>
    </main>
  )
}

export default PublicWebsite
