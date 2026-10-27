export default function AuthField({ id, label, message, children }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      {children}
      <small className="auth-field-message" aria-live="polite" aria-hidden={!message}>
        {message || ''}
      </small>
    </div>
  )
}
