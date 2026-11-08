export default function KawasanScene({ highlight: _highlight }) {
  return (
    <svg
      className="auth-scene"
      viewBox="0 0 640 360"
      width="100%"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="scene-line-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity=".3" />
          <stop offset="35%" stopColor="white" stopOpacity=".42" />
          <stop offset="72%" stopColor="white" stopOpacity=".86" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="scene-line-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill="url(#scene-line-fade)" />
        </mask>
      </defs>

      <g mask="url(#scene-line-mask)">
        <path
          d="M-80 182C15 150 85 155 190 176S355 208 448 172 610 124 720 138"
          stroke="#F5F1E5"
          opacity=".32"
        />
        <path
          d="M-80 242C10 218 90 217 190 237S357 267 448 231 610 188 720 200"
          stroke="#E7BD59"
          opacity=".5"
        />
        <path
          d="M-80 324C10 288 92 302 190 320S356 350 448 319 612 274 720 286"
          stroke="#F5F1E5"
          opacity=".36"
        />
        <path
          d="M-80 392C5 355 88 368 190 390S355 421 448 390 610 338 720 350"
          stroke="#F5F1E5"
          opacity=".28"
        />
      </g>
    </svg>
  )
}
