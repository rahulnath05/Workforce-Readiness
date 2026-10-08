import { cn } from "cn"

export function ReadinessCell({
  percent,
  onClick,
  selected,
  size = "sm",
  emphasizeGap,
}: {
  percent: number | null
  onClick?: () => void
  selected?: boolean
  size?: "sm" | "md"
  emphasizeGap?: boolean
}) {
  const dim = size === "md" ? "size-10 text-xs" : "size-9 text-[11px]"

  if (percent === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md text-muted-foreground",
          dim,
        )}
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

  const isHot = emphasizeGap && percent < 50

  const Tag = onClick ? "button" : "span"
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold tabular-nums transition-transform",
        dim,
        shade,
        selected && "ring-2 ring-step ring-offset-1",
        onClick && "cursor-pointer hover:scale-105 hover:shadow-sm",
        isHot && "ring-2 ring-[var(--grove-attention)]/60 shadow-[0_0_0_1px_var(--grove-attention-soft)]",
      )}
      aria-label={onClick ? `${percent}% at target — show people` : `${percent}% at target`}
    >
      {percent}%
    </Tag>
  )
}
