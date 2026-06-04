/* eslint-disable @next/next/no-img-element */
// sky scene footer — clouds + grass + BRUIN FUN ghost text
export default function Footer() {
  return (
    // gradient: white at top fading into a proper sky blue
    <footer className="relative w-full h-[980px] overflow-hidden bg-gradient-to-b from-white via-[#87ceeb] to-[#4ab3e0]">

      {/* far left cloud */}
      <div className="absolute mix-blend-overlay" style={{ right: '76%', top: '9%', width: '37%' }}>
        <img src="/footer/cloud.png" alt="" className="w-full" />
      </div>

      {/* left-center cloud */}
      <div className="absolute mix-blend-overlay" style={{ right: '56%', top: '17%', width: '42%' }}>
        <img src="/footer/cloud.png" alt="" className="w-full" />
      </div>

      {/* center cloud */}
      <div className="absolute mix-blend-overlay" style={{ right: '46%', top: '10%', width: '31%' }}>
        <img src="/footer/cloud2.png" alt="" className="w-full" />
      </div>

      {/* right cloud */}
      <div className="absolute mix-blend-overlay" style={{ right: '1%', top: '18%', width: '42%' }}>
        <img src="/footer/cloud2.png" alt="" className="w-full" />
      </div>

      {/* far right cloud, screen blend to lighten the edge */}
      <div className="absolute mix-blend-screen" style={{ right: '-16%', top: '2%', width: '43%' }}>
        <img src="/footer/cloud.png" alt="" className="w-full" />
      </div>

      {/* BRUIN FUN ghost text, overlay makes it look carved into the sky */}
      <div className="absolute mix-blend-overlay opacity-80" style={{ right: '23%', top: '60%', width: '55%' }}>
        <img src="/footer/bruinfun.png" alt="Bruin Fun" className="w-full" />
      </div>
    </footer>
  )
}
