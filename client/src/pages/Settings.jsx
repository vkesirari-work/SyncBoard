import { Building2, CheckCircle2, CreditCard, Save, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { defaultGymSettings } from '../hooks/useGymSettings'
import './Settings.css'
import SirariLogo from '../components/branding/SirariLogo'

function Settings() {
  const [form, setForm] = useState(defaultGymSettings)
  const [paymentStatus, setPaymentStatus] = useState({ configured: false, mode: 'test' })
  const [status, setStatus] = useState({ type: 'loading', message: '' })

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      setForm({ ...defaultGymSettings, ...data.settings })
      setPaymentStatus({ configured: data.paymentsConfigured, mode: data.paymentMode })
      setStatus({ type: 'ready', message: '' })
    }).catch((error) => setStatus({ type: 'error', message: error.response?.data?.message || 'Could not load gym settings.' }))
  }, [])

  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }

  async function saveSettings(event) {
    event.preventDefault()
    setStatus({ type: 'saving', message: '' })
    try {
      const { data } = await api.patch('/settings', form)
      setForm({ ...defaultGymSettings, ...data.settings })
      setStatus({ type: 'success', message: 'Gym settings saved and connected across the website.' })
      window.dispatchEvent(new Event('gym-settings:updated'))
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Could not save gym settings.' })
    }
  }

  return (
    <section className="page-stack settings-page">
      <div className="page-header"><div className="page-title-row"><div className="page-title-icon"><Building2 size={22} /></div><div><p className="eyebrow">Business profile</p><h1>Gym settings</h1><p className="page-description">Manage the details shown on your website and payment receipts.</p></div></div></div>
      <div className="settings-grid">
        <form className="panel settings-form" onSubmit={saveSettings}>
          <div className="settings-section-heading"><div><h2>Gym identity</h2><p>These details appear across the customer experience.</p></div><ShieldCheck size={20} /></div>
          <div className="form-grid equal"><label>Gym name<input name="gymName" value={form.gymName} onChange={updateField} required /></label><label>Tagline<input name="tagline" value={form.tagline} onChange={updateField} /></label></div>
          <div className="form-grid equal"><label>Phone number<input name="phone" value={form.phone} onChange={updateField} required /></label><label>Public email<input name="email" type="email" value={form.email} onChange={updateField} placeholder="hello@yourgym.com" /></label></div>
          <label>Address<textarea name="address" rows="3" value={form.address} onChange={updateField} required /></label>
          <div className="form-grid equal"><label>Opening hours<input name="openingHours" value={form.openingHours} onChange={updateField} /></label><label>GST number (optional)<input name="gstNumber" value={form.gstNumber} onChange={updateField} /></label></div>
          <label>Logo URL (optional)<input name="logoUrl" type="url" value={form.logoUrl} onChange={updateField} placeholder="https://.../logo.png" /></label>
          <label>Instagram URL (optional)<input name="instagramUrl" type="url" value={form.instagramUrl} onChange={updateField} placeholder="https://instagram.com/..." /></label>
          <label>Receipt footer<input name="receiptFooter" value={form.receiptFooter} onChange={updateField} /></label>
          {status.message && <p className={`dashboard-notice ${status.type === 'error' ? 'error' : 'success'}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.message}</p>}
          <div className="settings-actions"><button className="primary-button" type="submit" disabled={status.type === 'saving' || status.type === 'loading'}><Save size={17} /> {status.type === 'saving' ? 'Saving…' : 'Save settings'}</button></div>
        </form>
        <aside className="settings-side">
          <article className="panel settings-preview"><p className="eyebrow">Live preview</p>{form.logoUrl ? <img src={form.logoUrl} alt="Gym logo preview" /> : <SirariLogo compact size={58} title={form.gymName} />}<h2>{form.gymName}</h2><p>{form.tagline}</p><span>{form.address}</span><span>{form.phone}</span></article>
          <article className="panel payment-config-card"><div className="settings-section-heading"><div><h2>Online payments</h2><p>Razorpay server configuration</p></div><CreditCard size={20} /></div><div className={`config-status ${paymentStatus.configured ? 'connected' : ''}`}>{paymentStatus.configured ? <CheckCircle2 size={18} /> : <span />}<strong>{paymentStatus.configured ? 'Connected' : 'Not configured'}</strong></div>{paymentStatus.configured && <p>Currently running in <strong>{paymentStatus.mode.toUpperCase()} mode</strong>. Secret keys remain protected on the backend.</p>}</article>
        </aside>
      </div>
    </section>
  )
}

export default Settings
