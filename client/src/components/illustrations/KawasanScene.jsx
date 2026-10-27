export default function KawasanScene({ highlight }) {
  const homes = [
    { x: 28, roof: '#78956C', wall: '#F4F2E9', block: 'Blok A' },
    { x: 178, roof: '#C78358', wall: '#E4EADC', block: 'Blok B' },
    { x: 328, roof: '#D9B858', wall: '#FFFEF9', block: 'Blok C' },
    { x: 478, roof: '#557B85', wall: '#E4EADC', block: 'Blok C' }
  ]

  return (
    <svg
      className="auth-scene"
      viewBox="0 0 640 292"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <g className="scene-houses">
        {homes.map((home, index) => (
          <g key={home.x}>
            <path d={`M${home.x} 132  ${home.x + 62} 84 ${home.x + 124} 132Z`} fill={home.roof} stroke="#AEBDA9" strokeWidth="2" />
            <rect x={home.x + 9} y="130" width="106" height="89" rx="2" fill={home.wall} stroke="#AEBDA9" strokeWidth="2" />
            <rect x={home.x + 18} y="139" width="89" height="17" rx="3" fill="#203A2C" />
            <text x={home.x + 62} y="151" textAnchor="middle" fill="#FFFEF9" className={`scene-block${highlight === 'rumah' && index === 1 ? ' scene-block-highlight' : ''}`}>{home.block}</text>
            <rect x={home.x + 23} y="168" width="24" height="25" rx="2" fill="#DCE8D7" stroke="#91A58C" strokeWidth="1.5" />
            <path d={`M${home.x + 35} 168v25m-12-13h24`} stroke="#91A58C" strokeWidth="1.5" />
            <rect x={home.x + 70} y="168" width="28" height="51" rx="2" fill="#557B85" stroke="#91A58C" strokeWidth="1.5" />
            <circle cx={home.x + 91} cy="195" r="1.6" fill="#E7BD59" />
            {highlight === 'rumah' && index === 1 && (
              <g className="scene-home-pin">
                <path d={`M${home.x + 62} 75v-22`} stroke="#E7BD59" strokeWidth="2" />
                <path d={`M${home.x + 62} 54h49l-8 9 8 9h-49z`} fill="#E7BD59" />
                <text x={home.x + 84} y="65" textAnchor="middle" fill="#203A2C" className="scene-pin-label">Rumah Anda</text>
              </g>
            )}
          </g>
        ))}
      </g>

      <g className="scene-plant">
        <path d="M618 223v-38m0 24c-15 0-22-7-23-19 14 0 22 6 23 19Zm0-11c0-13 7-20 20-21 0 13-7 20-20 21Z" fill="#47784E" stroke="#AFC19F" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M605 224h27" stroke="#D9B858" strokeWidth="3" strokeLinecap="round" />
      </g>

      <g className="scene-bins">
        {[157, 307, 457].map((x, index) => {
          const colors = ['#78956C', '#C78358', '#D9B858']
          return (
            <g key={x} transform={`translate(${x} 203)`}>
              <path d="M0 3h20l-2 20H2z" fill={colors[index]} stroke="#DCE1D3" strokeWidth="1.2" />
              <path d="M-2 2h24M6 0h8" stroke="#DCE1D3" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )
        })}
      </g>

      <path d="M0 226h640v66H0z" fill="#203A2C" />
      <path d="M0 226h640" stroke="#AEBDA9" strokeWidth="2" />
      <path d="M0 259h640" stroke="#D9B858" strokeWidth="2" strokeDasharray="22 18" opacity=".85" />

      <g className="scene-truck">
        <path d="M2 235h59v30H2z" fill="#FFFEF9" stroke="#AEBDA9" strokeWidth="1.5" />
        <path d="M61 243h17l14 13v9H61z" fill="#E7BD59" stroke="#AEBDA9" strokeWidth="1.5" />
        <path d="M68 246h8l8 8H68z" fill="#557B85" />
        <path d="M11 241h37v17H11z" fill="#E4EADC" />
        <text x="29" y="253" textAnchor="middle" fill="#315D3C" className="scene-truck-label">SIGAP</text>
        <circle cx="20" cy="267" r="6" fill="#23342B" stroke="#DCE1D3" strokeWidth="2" />
        <circle cx="72" cy="267" r="6" fill="#23342B" stroke="#DCE1D3" strokeWidth="2" />
      </g>
    </svg>
  )
}
