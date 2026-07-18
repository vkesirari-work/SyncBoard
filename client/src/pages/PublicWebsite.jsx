import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  KeyRound,
  MapPin,
  MessageCircle,
  Menu,
  Navigation,
  Phone,
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
import SirariLogo from '../components/branding/SirariLogo'
import { api } from '../lib/api'
import { useGymSettings } from '../hooks/useGymSettings'
import './PublicWebsite.css'

const programs = [
  { number: '01', title: 'Strength', icon: Dumbbell, text: 'Build raw strength with progressive programming, free weights and expert form coaching.' },
  { number: '02', title: 'Conditioning', icon: Zap, text: 'Move faster, breathe better and unlock athletic endurance through high-energy sessions.' },
  { number: '03', title: 'Transformation', icon: Target, text: 'A goal-led plan combining training, progress reviews and consistent trainer accountability.' },
]

const plans = [
  { name: '1 Month', price: '999', tag: 'Start strong', featured: false },
  { name: '3 Months', price: '2,399', tag: 'Most popular', featured: true },
  { name: '6 Months', price: '4,499', tag: 'Build momentum', featured: false },
  { name: 'Annual', price: '7,999', tag: 'Best value', featured: false },
]

const launchFeatures = [
  { number: '01', icon: Dumbbell, title: 'Modern equipment', text: 'A thoughtfully planned strength and cardio floor for everyday progress.' },
  { number: '02', icon: Users, title: 'Supportive coaching', text: 'Friendly guidance for beginners and structured support for serious goals.' },
  { number: '03', icon: Sparkles, title: 'Feel-good energy', text: 'A clean, welcoming space where showing up feels like the best part of your day.' },
]

function PublicWebsite() {
  const gymSettings = useGymSettings()
  const siteRef = useRef(null)
  const progressRef = useRef(null)
  const heroRef = useRef(null)
  const [lead, setLead] = useState({ name: '', phone: '', fitnessGoal: '' })
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const contactDigits = gymSettings.phone.replace(/\D/g, '')
  const whatsappNumber = contactDigits.length === 10 ? `91${contactDigits}` : contactDigits
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Sirari Fitness! Please add me to the 2027 founding membership list.')}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gymSettings.address)}`

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
        heroRef.current.style.setProperty('--hero-progress', Math.min(1, window.scrollY / (window.innerHeight * .75)).toFixed(3))
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
      setSubmitState({ status: 'success', message: 'You’re on the founding list. We’ll share opening updates with you.' })
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
        <Link className="sf-logo" to="/" aria-label="Sirari Fitness home"><SirariLogo title={gymSettings.gymName} size={40} /></Link>
        <button className="sf-menu-button" type="button" aria-label="Toggle navigation" onClick={() => setIsMenuOpen((open) => !open)}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={isMenuOpen ? 'open' : ''} aria-label="Gym website navigation">
          <a href="#programs" onClick={closeMenu}>Programs</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#membership" onClick={closeMenu}>Membership</a>
          <a href="#launch" onClick={closeMenu}>Opening 2027</a>
          <Link className="sf-mobile-dashboard-link" to="/login" onClick={closeMenu}><KeyRound size={16} /> Dashboard login</Link>
        </nav>
        <div className="sf-nav-actions">
          <Link className="sf-dashboard-login" to="/login"><KeyRound size={15} /> Dashboard login</Link>
          <a className="sf-nav-cta" href="#contact">Join founding list <ArrowDownRight size={17} /></a>
        </div>
      </header>

      <div className="sf-launch-ribbon" aria-label="Opening announcement">
        <div><span>OPENING 2027</span><Sparkles size={12} /><span>FOUNDING MEMBERSHIPS NOW OPEN</span><Sparkles size={12} /><span>KHATIMA’S NEW FITNESS HOME</span></div>
      </div>

      <section className="sf-hero" ref={heroRef} style={{ '--hero-image': `url(${gymHero})` }}>
        <div className="sf-hero-noise" />
        <div className="sf-kinetic" aria-hidden="true"><span /><span /><span /></div>
        <div className="sf-hero-copy">
          <div className="sf-label"><span /> Khatima · Opening 2027</div>
          <h1 className="sf-hero-title"><span>YOUR</span> <span>STRONGEST</span> <em className="sf-gold-foil">ERA.</em></h1>
          <p>A fresh, feel-good fitness space is coming to Sirari Complex—built for confidence, consistency and stronger everyday living.</p>
          <div className="sf-hero-actions">
            <a className="sf-button lime sf-magnetic" href="#contact">Get opening updates <ArrowRight size={18} /></a>
            <a className="sf-play" href="#membership"><span><CalendarDays size={16} /></span> View founding plans</a>
          </div>
        </div>
        <div className="sf-hero-side">
          <span>OPENING 2027</span>
          <div />
          <a href="#contact">BE THERE FROM DAY ONE</a>
        </div>
        <div className="sf-hero-proof">
          <div className="sf-opening-chip"><Sparkles size={16} /> Founding memberships</div>
          <p><strong>2027</strong> Sirari Complex, Khatima</p>
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
          <p>From your first rep to your strongest season, our 2027 training experience is being planned around real, measurable progress.</p>
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
          <p className="sf-story-lead">We’re creating a focused training environment where modern equipment, genuine coaching and a warm local community work together.</p>
          <div className="sf-story-points">
            <div><ShieldCheck /><span><strong>Expert guidance</strong>Real coaches. Clear progress. Zero guesswork.</span></div>
            <div><Flame /><span><strong>Feel-good space</strong>Modern equipment and an atmosphere that moves you.</span></div>
            <div><Users /><span><strong>Stronger together</strong>A community that notices when you show up.</span></div>
          </div>
          <a className="sf-text-link" href="#contact">Meet your strongest self <ArrowRight /></a>
        </div>
      </section>

      <section className="sf-numbers sf-reveal sf-stagger" aria-label="Gym statistics">
        <div><strong>2027</strong><p>Grand opening</p></div>
        <div><strong>4<span>AM</span></strong><p>Doors open</p></div>
        <div><strong>11<span>PM</span></strong><p>Last workout</p></div>
        <div><strong>SUN</strong><p>Weekly rest day</p></div>
      </section>

      <section className="sf-section sf-pricing" id="membership">
        <div className="sf-section-head light sf-reveal">
          <div><p className="sf-kicker">Membership</p><h2>INVEST IN<br /><em>YOURSELF.</em></h2></div>
          <p>Simple founding plans for 2027. No confusing fine print—just a clear way to start your strongest chapter.</p>
        </div>
        <div className="sf-price-grid sf-reveal sf-stagger">
          {plans.map((plan) => (
            <article className={`sf-price-card sf-tilt ${plan.featured ? 'featured' : ''}`} key={plan.name}>
              {plan.featured && <span className="sf-popular">Recommended</span>}
              <p>{plan.tag}</p><h3>{plan.name}</h3>
              <div className="sf-price"><sup>₹</sup><strong className="sf-gold-foil">{plan.price}</strong><span>/ plan</span></div>
              <ul><li><Check /> Full gym access</li><li><Check /> Fitness assessment</li><li><Check /> Trainer floor support</li><li><Check /> Progress review</li></ul>
              <a href="#contact">Choose plan <ChevronRight size={18} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="sf-section sf-coaches" id="launch">
        <div className="sf-section-head sf-reveal">
          <div><p className="sf-kicker">Arriving in Khatima</p><h2>MADE FOR<br /><em>YOUR MOMENT.</em></h2></div>
          <p>No fake promises before our doors open—just a clear vision for a friendly, modern gym that grows with its community.</p>
        </div>
        <div className="sf-coach-grid sf-reveal sf-stagger">
          {launchFeatures.map((feature) => (
            <article className="sf-coach-card sf-launch-card sf-tilt" key={feature.title}>
              <div className="sf-coach-visual"><feature.icon size={52} /><small>{feature.number}</small></div>
              <div><p>Opening experience</p><h3>{feature.title}</h3><span>{feature.text}</span></div>
              <a href="#contact" aria-label={`Learn about ${feature.title}`}><ArrowDownRight /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="sf-contact" id="contact">
        <div className="sf-contact-copy sf-reveal sf-reveal-left">
          <p className="sf-kicker">Founding list now open</p>
          <h2>START WITH<br /><em>US IN 2027.</em></h2>
          <p>Tell us your goal and get opening updates, launch-day news and first access to founding memberships.</p>
          <div className="sf-contact-details">
            <span><MapPin /> {gymSettings.gymName}, {gymSettings.address}</span>
            <span><Clock3 /> {gymSettings.openingHours}</span>
            <span><Phone /> {gymSettings.phone}</span>
          </div>
        </div>
        <form className="sf-lead-form sf-reveal" onSubmit={submitLead}>
          <div className="sf-form-number">FOUNDING LIST / 2027</div>
          <label><span>Your name</span><input name="name" placeholder="Enter full name" value={lead.name} onChange={updateLead} autoComplete="name" required /></label>
          <label><span>Phone number</span><input name="phone" type="tel" placeholder="Enter mobile number" value={lead.phone} onChange={updateLead} autoComplete="tel" required /></label>
          <label><span>Primary goal</span><select name="fitnessGoal" value={lead.fitnessGoal} onChange={updateLead} required><option value="" disabled>Select your goal</option><option value="fat_loss">Fat loss</option><option value="muscle_gain">Muscle gain</option><option value="general_fitness">General fitness</option><option value="personal_training">Personal training</option></select></label>
          {submitState.message && <p className={`sf-form-message ${submitState.status}`} role={submitState.status === 'error' ? 'alert' : 'status'}>{submitState.message}</p>}
          <button className="sf-magnetic" type="submit" disabled={submitState.status === 'submitting'}>{submitState.status === 'submitting' ? 'Sending…' : 'Join founding list'} <ArrowRight /></button>
        </form>
      </section>

      <section className="sf-location" aria-label="Visit Sirari Fitness">
        <div className="sf-location-orbit" aria-hidden="true"><span /><span /><MapPin /></div>
        <div className="sf-location-copy sf-reveal">
          <p className="sf-kicker">Find your future gym</p>
          <h2>SIRARI COMPLEX.<br /><em>SEE YOU IN 2027.</em></h2>
          <p>{gymSettings.address}. Save the location now and be ready from day one.</p>
          <div className="sf-location-actions">
            <a href={mapsUrl} target="_blank" rel="noreferrer"><Navigation size={17} /> Get directions</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp us</a>
            {gymSettings.instagramUrl && <a href={gymSettings.instagramUrl} target="_blank" rel="noreferrer"><Camera size={17} /> Follow opening</a>}
          </div>
        </div>
        <div className="sf-location-card sf-reveal">
          <span>UTTARAKHAND · INDIA</span>
          <strong>KHATIMA</strong>
          <p>Sirari Complex<br />Charubeta · Chanda Mod</p>
          <a href={mapsUrl} target="_blank" rel="noreferrer" aria-label="Open Sirari Fitness location in Google Maps"><ArrowDownRight /></a>
        </div>
      </section>

      <footer className="sf-footer">
        <div className="sf-footer-brand"><Link className="sf-logo" to="/"><SirariLogo title={gymSettings.gymName} size={42} /></Link><p>{gymSettings.tagline}</p></div>
        <p className="sf-footer-opening"><strong>Opening 2027</strong><span>{gymSettings.address}</span></p>
        <p className="sf-copyright">© 2027 {gymSettings.gymName}. Stronger starts here.</p>
      </footer>
      <a className="sf-whatsapp-float" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with Sirari Fitness on WhatsApp"><MessageCircle size={20} /><span>WhatsApp</span></a>
      <div className="sf-mobile-cta" aria-label="Quick actions"><a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a><a href="#contact">Join founding list <ArrowRight size={16} /></a></div>
    </main>
  )
}

export default PublicWebsite
