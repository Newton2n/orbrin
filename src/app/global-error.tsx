"use client";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0b0d12",
          color: "#f5f7fb",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div>
            <p style={{ opacity: 0.7 }}>Orbrin</p>
            <h1>Something went wrong</h1>
            <p style={{ opacity: 0.7 }}>
              Please try again or return to a safe page.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={reset}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: 0,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a href="/" style={{ padding: "10px 16px", color: "inherit" }}>
                Home
              </a>
              <a
                href="/login"
                style={{ padding: "10px 16px", color: "inherit" }}
              >
                Sign in
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
