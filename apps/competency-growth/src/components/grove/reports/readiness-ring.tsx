import { cn } from "@/lib/utils"

export function ReadinessRing({
  percent,
  size = 56,
  stroke = 5,
  className,
  theme = "light",
}: {
  percent: number
  size?: number
  stroke?: number
  className?: string
  theme?: "light" | "dark"
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  const tone =
    percent >= 75 ? "stroke-forest" : percent >= 50 ? "stroke-step" : "stroke-[var(--grove-attention)]"
  const onDark = theme === "dark"

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`${percent}% readiness`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className={onDark ? "stroke-white/20" : "stroke-current text-muted/30"}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className={onDark ? "stroke-[var(--grove-data-teal-2)]" : tone}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className={cn("text-[11px] font-semibold", onDark ? "fill-white" : "fill-foreground")}
      >
        {percent}%
      </text>
    </svg>
  )
}
