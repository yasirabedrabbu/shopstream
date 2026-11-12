export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        padding: "2rem",
        background: "var(--bg)",
      }}
    >
      {/* Token test */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "2rem",
          maxWidth: "480px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--text)",
            fontSize: "1.5rem",
          }}
        >
          ShopStream
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            margin: 0,
          }}
        >
          Design system token check. Light/dark, Sora heading, Manrope body.
        </p>
        {/* Accent CTA */}
        <button
          style={{
            background: "var(--accent)",
            color: "var(--accent-text)",
            border: "none",
            borderRadius: "9999px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            minHeight: "44px",
            alignSelf: "flex-start",
          }}
        >
          Browse Products
        </button>
      </div>
    </main>
  );
}