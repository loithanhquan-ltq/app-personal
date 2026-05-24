export function ChipView({
  label,
  accent = false,
  small = false,
}: {
  label: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: small ? "2px 7px" : "3px 9px",
      borderRadius: 9999,
      fontFamily: "var(--font-sans)",
      fontSize: small ? 10 : 11,
      fontWeight: 500,
      letterSpacing: "0.02em",
      background: accent ? "rgba(164, 74, 42, 0.10)" : "rgba(0,0,0,0.05)",
      color: accent ? "var(--color-accent)" : "var(--color-ink2)",
      border: accent ? "0.5px solid rgba(164,74,42,0.2)" : "0.5px solid var(--color-rule)",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}
