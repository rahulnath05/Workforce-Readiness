export function MomentumChart() {
  const points = [22, 28, 26, 34, 31, 40, 46, 44, 52, 58, 63, 70]
  const width = 320
  const height = 112
  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width
    const y = height - (point / 100) * height
    return [x, y] as const
  })
  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ")
  const area = `${line} L${width},${height} L0,${height} Z`
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full text-forest" role="img" aria-label="Completions over 8 weeks">
      <path d={area} fill="currentColor" opacity="0.12" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={coords.at(-1)?.[0]} cy={coords.at(-1)?.[1]} r="4" fill="currentColor" />
    </svg>
  )
}
