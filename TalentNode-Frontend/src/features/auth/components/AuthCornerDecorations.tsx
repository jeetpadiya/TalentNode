export const AuthCornerDecorations = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Background Dot Matrix Pattern with soft vignette */}
      <div 
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.25px, transparent 1.25px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 45%, transparent 80%)',
        }}
      />

      {/* ========================================================================= */}
      {/* TOP-RIGHT CORNER DESIGN                                                  */}
      {/* ========================================================================= */}

      {/* Top-Right Ambient Glows */}
      <div className="absolute -top-32 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl" />
      <div className="absolute top-16 right-20 h-72 w-72 rounded-full bg-gradient-to-l from-blue-400/15 to-transparent blur-2xl" />

      {/* Top-Right Geometric Lines & Circular Arcs */}
      <svg
        className="absolute top-0 right-0 h-[380px] w-[380px] sm:h-[450px] sm:w-[450px] text-indigo-300/40"
        viewBox="0 0 450 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="450" cy="0" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
        <circle cx="450" cy="0" r="200" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="450" cy="0" r="290" stroke="currentColor" strokeWidth="1" strokeDasharray="5 7" />
        <circle cx="450" cy="0" r="380" stroke="currentColor" strokeWidth="1" />
        <circle cx="450" cy="0" r="440" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
        {/* Precise coordinate grid lines */}
        <path d="M260 0 L260 190 L450 190" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeDasharray="4 4" />
        <path d="M170 0 L170 280 L450 280" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        {/* Decorative corner node points */}
        <circle cx="260" cy="190" r="3" fill="currentColor" opacity="0.8" />
        <circle cx="170" cy="280" r="3" fill="currentColor" opacity="0.6" />
      </svg>

      {/* ========================================================================= */}
      {/* BOTTOM-LEFT CORNER DESIGN                                                */}
      {/* ========================================================================= */}

      {/* Bottom-Left Ambient Glows */}
      <div className="absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-transparent blur-3xl" />
      <div className="absolute bottom-16 left-20 h-72 w-72 rounded-full bg-gradient-to-r from-indigo-500/15 to-transparent blur-2xl" />

      {/* Bottom-Left Geometric Lines & Stepped Grid */}
      <svg
        className="absolute bottom-0 left-0 h-[380px] w-[380px] sm:h-[450px] sm:w-[450px] text-blue-300/40"
        viewBox="0 0 450 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="0" cy="450" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
        <circle cx="0" cy="450" r="200" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="0" cy="450" r="290" stroke="currentColor" strokeWidth="1" strokeDasharray="5 7" />
        <circle cx="0" cy="450" r="380" stroke="currentColor" strokeWidth="1" />
        <circle cx="0" cy="450" r="440" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
        {/* Precise coordinate grid lines */}
        <path d="M0 260 L190 260 L190 450" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeDasharray="4 4" />
        <path d="M0 170 L280 170 L280 450" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        {/* Decorative corner node points */}
        <circle cx="190" cy="260" r="3" fill="currentColor" opacity="0.8" />
        <circle cx="280" cy="170" r="3" fill="currentColor" opacity="0.6" />
      </svg>
    </div>
  )
}

export default AuthCornerDecorations
