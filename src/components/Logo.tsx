
interface LogoProps {
  className?: string
  size?: number | string
}

export function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="95" fill="#F4D03F" stroke="#8B4513" strokeWidth="4"/>
      <circle cx="100" cy="100" r="85" fill="none" stroke="#8B4513" strokeWidth="2.5"/>
      
      {/* Top curved text path */}
      <path id="logoTopCirclePath" d="M 32 100 A 68 68 0 0 1 168 100" fill="none"/>
      <text fontSize="12.5" fontWeight="900" fill="#8B4513" fontFamily="sans-serif" letterSpacing="1px">
        <textPath href="#logoTopCirclePath" startOffset="50%" textAnchor="middle">
          HANDMADE WITH LOVE
        </textPath>
      </text>
      
      {/* Center prominent text */}
      <text x="100" y="92" fontSize="22" fontWeight="900" fill="#8B4513" textAnchor="middle" fontFamily="Georgia, serif" letterSpacing="0.5px">
        EXOTIKA
      </text>
      <text x="100" y="118" fontSize="22" fontWeight="900" fill="#8B4513" textAnchor="middle" fontFamily="Georgia, serif" letterSpacing="0.5px">
        CREATION
      </text>
      
      {/* Decorative leaf/wing paths */}
      <path d="M 40 100 Q 35 95 30 100 Q 35 105 40 100" fill="#8B4513"/>
      <path d="M 45 95 Q 40 90 35 95 Q 40 100 45 95" fill="#8B4513"/>
      <path d="M 45 105 Q 40 110 35 105 Q 40 100 45 105" fill="#8B4513"/>
      <path d="M 160 100 Q 165 95 170 100 Q 165 105 160 100" fill="#8B4513"/>
      <path d="M 155 95 Q 160 90 165 95 Q 160 100 155 95" fill="#8B4513"/>
      <path d="M 155 105 Q 160 110 165 105 Q 160 100 155 105" fill="#8B4513"/>
      
      {/* Bottom smile curve */}
      <path d="M 60 135 Q 100 148 140 135" stroke="#8B4513" strokeWidth="3" fill="none"/>
    </svg>
  )
}
