export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{
        fontFamily: "var(--font-serif)",
        fontSize: 32,
        fontStyle: "italic",
        fontWeight: 600,
        color: "var(--color-ink)",
        margin: 0,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          fontStyle: "italic",
          color: "var(--color-ink3)",
          margin: "4px 0 0",
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
