import Link from "next/link";

export default function Home() {
  return (
    <div className="container py-5 page-enter" style={{ position: "relative", zIndex: 1 }}>
      <div className="mx-auto text-center" style={{ maxWidth: "550px", paddingTop: "6vh" }}>
        {/* Logo */}
        <div style={{
          fontSize: "4rem",
          marginBottom: "1rem",
          animation: "pageSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          🎁
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "0.6rem",
          lineHeight: 1.1,
        }}>
          மொய் ரசீது
        </h1>

        <p style={{
          fontSize: "1.1rem",
          color: "var(--text-secondary)",
          fontWeight: 400,
          marginBottom: "0.5rem",
        }}>
          Moi Receipt App
        </p>

        <p style={{
          fontSize: "0.88rem",
          color: "var(--text-muted)",
          maxWidth: "380px",
          margin: "0 auto 2.5rem",
          lineHeight: 1.6,
        }}>
          தமிழ்நாட்டு பாரம்பரிய மொய் பதிவு & ரசீது உருவாக்கி.
          <br />
          Tamil Nadu customary gift registry & receipt generator.
        </p>

        {/* CTA Button */}
        <Link href="/add-moi" className="btn-premium" style={{
          display: "inline-flex",
          width: "auto",
          padding: "0.9rem 2.5rem",
          fontSize: "1rem",
          textDecoration: "none",
          borderRadius: "100px",
        }}>
          <span>📝</span> மொய் சேர் — Add Moi
        </Link>

        {/* Features grid */}
        <div className="row g-3 mt-5">
          {[
            { icon: "⌨️", title: "Tanglish → Tamil", desc: "தானாக மொழிமாற்றம்" },
            { icon: "🔍", title: "Smart Search", desc: "தேடல் Dropdown" },
            { icon: "🧾", title: "Instant Receipt", desc: "ரசீது உருவாக்கம்" },
            { icon: "🖨️", title: "Print Ready", desc: "அச்சிடல் தயார்" },
          ].map((feat, idx) => (
            <div className="col-6" key={idx}>
              <div className="glass-card p-3 text-center" style={{
                animation: `fieldFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + idx * 0.1}s both`,
              }}>
                <div style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>{feat.icon}</div>
                <p style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)", margin: 0 }}>
                  {feat.title}
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0, marginTop: "0.15rem" }}>
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
