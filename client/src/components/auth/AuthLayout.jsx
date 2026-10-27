import KawasanScene from '../illustrations/KawasanScene'

export default function AuthLayout({
  headline,
  paragraph,
  footerText,
  cardTitle,
  cardParagraph,
  register = false,
  highlight,
  children
}) {
  return (
    <div className={`auth-page${register ? ' auth-register' : ''}`}>
      <section className="auth-story" aria-label="Tentang SIGAP">
        <div className="auth-story-brand">
          <span className="brand-mark" aria-hidden="true"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M12 13c-4.7 0-7-2.3-7-7 4.7 0 7 2.3 7 7Z"/><path d="M12 10c0-3.8 2-5.8 6-6 0 4-2 6-6 6Z"/><path d="M5 20h14"/></svg></span>
          <span className="brand-copy"><span className="brand-name">SIGAP</span><span className="brand-caption">Rawat lingkungan bersama</span></span>
        </div>
        <div className="auth-story-copy">
          <h2>{headline}</h2>
          <p>{paragraph}</p>
        </div>
        <KawasanScene highlight={highlight} />
        <div className="auth-story-foot">{footerText}</div>
      </section>
      <div className="auth-panel-wrap">
        <section className="auth-panel">
          <h1>{cardTitle}</h1>
          <p>{cardParagraph}</p>
          {children}
        </section>
      </div>
    </div>
  )
}
