"use client";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" style={{ colorScheme: "light dark" }}>
      <body
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "15vh 24px",
          textAlign: "center",
          background: "Canvas",
          color: "CanvasText",
        }}
      >
        <h1>We couldn’t load Aawasly.</h1>
        <p>Please try again in a moment.</p>
        <button
          onClick={reset}
          style={{ padding: "12px 24px", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
