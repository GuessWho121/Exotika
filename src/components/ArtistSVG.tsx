export function ArtistSVG() {
  return (
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      className="mx-auto mb-6 h-32 w-32 rounded-full border-4 border-[#FFDE59] shadow-md"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="64" cy="64" r="64" fill="#F4D03F" />
      
      {/* Face */}
      <ellipse cx="64" cy="58" rx="28" ry="32" fill="#D4A574" />
      
      {/* Hair */}
      <path
        d="M36 45 Q64 25 92 45 Q95 35 92 50 Q88 55 85 60 Q82 65 78 68 L50 68 Q46 65 43 60 Q40 55 36 50 Q33 35 36 45 Z"
        fill="#2C1810"
      />
      
      {/* Hair strands */}
      <path d="M45 35 Q50 30 55 35 Q52 40 45 35" fill="#1A0F08" />
      <path d="M65 32 Q70 27 75 32 Q72 37 65 32" fill="#1A0F08" />
      <path d="M80 38 Q85 33 90 38 Q87 43 80 38" fill="#1A0F08" />
      
      {/* Eyes */}
      <ellipse cx="56" cy="52" rx="3" ry="4" fill="#2C1810" />
      <ellipse cx="72" cy="52" rx="3" ry="4" fill="#2C1810" />
      <ellipse cx="56" cy="51" rx="1" ry="1" fill="white" />
      <ellipse cx="72" cy="51" rx="1" ry="1" fill="white" />
      
      {/* Eyebrows */}
      <path d="M52 47 Q56 45 60 47" stroke="#2C1810" strokeWidth="2" fill="none" />
      <path d="M68 47 Q72 45 76 47" stroke="#2C1810" strokeWidth="2" fill="none" />
      
      {/* Nose */}
      <ellipse cx="64" cy="58" rx="2" ry="3" fill="#C49464" />
      
      {/* Mouth */}
      <path d="M60 65 Q64 68 68 65" stroke="#A0522D" strokeWidth="2" fill="none" />
      
      {/* Sunglasses frame */}
      <rect x="48" y="48" width="32" height="12" rx="6" fill="none" stroke="#8B4513" strokeWidth="2" />
      <line x1="64" y1="50" x2="64" y2="58" stroke="#8B4513" strokeWidth="1" />
      
      {/* Sunglasses lenses */}
      <ellipse cx="56" cy="54" rx="6" ry="4" fill="#4A4A4A" opacity="0.7" />
      <ellipse cx="72" cy="54" rx="6" ry="4" fill="#4A4A4A" opacity="0.7" />
      
      {/* Scarf/clothing */}
      <path
        d="M40 75 Q64 70 88 75 Q90 85 85 95 Q80 100 75 95 Q70 90 64 92 Q58 90 53 95 Q48 100 43 95 Q38 85 40 75 Z"
        fill="#4A90E2"
      />
      
      {/* Scarf pattern */}
      <circle cx="50" cy="82" r="2" fill="white" opacity="0.8" />
      <circle cx="64" cy="85" r="2" fill="white" opacity="0.8" />
      <circle cx="78" cy="82" r="2" fill="white" opacity="0.8" />
      
      {/* Jacket/blazer */}
      <path
        d="M35 90 Q64 85 93 90 Q95 100 90 110 Q85 115 80 110 L48 110 Q43 115 38 110 Q33 100 35 90 Z"
        fill="#2C3E50"
      />
      
      {/* Jacket buttons */}
      <circle cx="60" cy="100" r="1.5" fill="#FFDE59" />
      <circle cx="68" cy="100" r="1.5" fill="#FFDE59" />
      
      {/* Background decorative elements */}
      <circle cx="20" cy="30" r="3" fill="#FFDE59" opacity="0.6" />
      <circle cx="108" cy="25" r="2" fill="#FFDE59" opacity="0.6" />
      <circle cx="15" cy="100" r="2.5" fill="#FFDE59" opacity="0.6" />
      <circle cx="113" cy="95" r="2" fill="#FFDE59" opacity="0.6" />
      
      {/* Artistic brush strokes */}
      <path d="M10 50 Q20 45 30 50" stroke="#FFDE59" strokeWidth="3" fill="none" opacity="0.5" />
      <path d="M98 70 Q108 65 118 70" stroke="#FFDE59" strokeWidth="3" fill="none" opacity="0.5" />
    </svg>
  )
}
