export default function DotPattern({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(rgba(107, 114, 128, 0.2) 1px, transparent 1px)",
        backgroundSize: "6px 6px",
      }}
    >
      {/* Optional: Add a subtle vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
      <div className="relative">{children}</div>
    </div>
  );
}
