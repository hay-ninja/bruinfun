// sky scene footer — clouds + grass + BRUIN FUN ghost text
export default function Footer() {
  return (
    // gradient: white at top fading into a proper sky blue
    <footer className="relative w-full h-[980px] overflow-hidden bg-gradient-to-b from-white via-[#87ceeb] to-[#4ab3e0]">

      {/* far left cloud */}
      <div className="absolute mix-blend-overlay" style={{ right: '76%', top: '6%', width: '37%' }}>
        <img src="/footer/cloud.png" alt="" className="w-full" />
      </div>

      {/* left-center cloud */}
      <div className="absolute mix-blend-overlay" style={{ right: '56%', top: '14%', width: '42%' }}>
        <img src="/footer/cloud.png" alt="" className="w-full" />
      </div>

      {/* center cloud */}
      <div className="absolute mix-blend-overlay" style={{ right: '46%', top: '7%', width: '31%' }}>
        <img src="/footer/cloud2.png" alt="" className="w-full" />
      </div>

      {/* right cloud */}
      <div className="absolute mix-blend-overlay" style={{ right: '1%', top: '15%', width: '42%' }}>
        <img src="/footer/cloud2.png" alt="" className="w-full" />
      </div>

      {/* far right cloud, screen blend to lighten the edge */}
      <div className="absolute mix-blend-screen" style={{ right: '-16%', top: '0%', width: '43%' }}>
        <img src="/footer/cloud.png" alt="" className="w-full" />
      </div>

      {/* BRUIN FUN ghost text, overlay makes it look carved into the sky */}
      <div className="absolute mix-blend-overlay opacity-80" style={{ right: '23%', top: '50%', width: '55%' }}>
        <img src="/footer/bruinfun.png" alt="Bruin Fun" className="w-full" />
      </div>

      {/* user's grass image, pinned to very bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '28%' }}>
        <img src="/footer/grass.jpg" alt="" className="w-full h-full object-cover object-bottom" />
      </div>
    </footer>
  )
}
