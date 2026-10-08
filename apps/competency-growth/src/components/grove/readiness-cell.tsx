import { cn } from "cn"

export function ReadinessCell({
  percent,
  onClick,
  selected,
}: {
  percent: number | null
  onClick?: () => void
  selected?: boolean
}) {
  if (percent === null) {
    return (
      <span
        className="inline-flex size-9 items-center justify-center rounded-md text-[11px] text-muted-foreground"
        aria-label="No benchmark or no learners for this skill"
      >
        —
      </span>
    )
  }

  const shade =
    percent >= 80
      ? "bg-heat-5 text-white"
      : percent >= 60
        ? "bg-heat-4 text-white"
        : percent >= 40
          ? "bg-heat-3 text-forest-deep"
          : percent >= 20
            ? "bg-heat-2 text-forest-deep"
            : "bg-heat-1 text-forest-deep"

  const Tag = onClick ? "button" : "span"
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums",
        shade,
        selected && "ring-2 ring-step ring-offset-1",
        onClick && "cursor-pointer hover:opacity-90",
      )}
      aria-label={onClick ? `${percent}% at target — show people` : `${percent}% at target`}
    >
      {percent}%
    </Tag>
  )
}
