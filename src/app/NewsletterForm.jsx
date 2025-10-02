// src/app/NewsletterForm.jsx
'use client'

import { useState } from 'react'
// importuj module da bi koristio lokalne klase (opciono)
import styles from './page.module.css'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return setStatus({ ok: false, msg: 'Unesi email' })
    try {
      setStatus({ ok: null, msg: 'Slanje...' })
      await new Promise((r) => setTimeout(r, 700))
      setEmail('')
      setStatus({ ok: true, msg: 'Uspešno prijavljen!' })
    } catch {
      setStatus({ ok: false, msg: 'Greška prilikom prijave.' })
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Tvoj email"
        aria-label="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Prijavi se</button>

      {status?.msg && (
        <span
          role="status"
          className={
            status.ok === true ? styles.formStatusSuccess
            : status.ok === false ? styles.formStatusError
            : styles.formStatus
          }
          style={{ display: 'block', marginTop: 8 }} // optional inline spacing
        >
          {status.msg}
        </span>
      )}
    </form>
  )
}
