export function Avatar({
  initials,
  index = 0,
  size = 44,
}: {
  initials: string;
  index?: number;
  size?: number;
}) {
  const hue = (index * 53 + 20) % 360;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 30% 30%, hsl(${hue}, 35%, 90%), hsl(${hue}, 30%, 75%))`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-serif)",
      fontSize: size * 0.38,
      fontWeight: 600,
      color: `hsl(${hue}, 40%, 35%)`,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}
