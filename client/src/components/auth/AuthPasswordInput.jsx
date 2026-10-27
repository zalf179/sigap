import { useState } from 'react'

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5.1 0 8.8 4.4 10 7-.4.9-1.2 2-2.3 3M6.2 6.2C3.9 7.6 2.5 9.7 2 12c1.2 2.6 4.9 7 10 7 1 0 2-.2 2.9-.5" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
  )
}

export default function AuthPasswordInput({ id, autoComplete, value, onChange, required, placeholder }) {
  const [visible, setVisible] = useState(false)
  const label = visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'

  return (
    <div className="auth-password-control">
      <input
        className="auth-control"
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
      <button
        className="auth-password-toggle"
        type="button"
        aria-label={label}
        aria-controls={id}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        <EyeIcon hidden={visible} />
      </button>
    </div>
  )
}
