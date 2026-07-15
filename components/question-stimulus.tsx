import type { DataStimulus } from "@/lib/diagnostic";

export function QuestionStimulus({ stimulus }: { stimulus: DataStimulus }) {
  if (stimulus.kind === "table") {
    return <figure className="data-stimulus"><figcaption>{stimulus.title}</figcaption><table><thead><tr><th>Region</th>{stimulus.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{stimulus.rows.map((row) => <tr key={row.label}><th>{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${stimulus.columns[index]}`}>{value}</td>)}</tr>)}</tbody></table></figure>;
  }
  const maximum = Math.max(...stimulus.values);
  const points = stimulus.values.map((value, index) => ({ x: 48 + index * (300 / Math.max(1, stimulus.values.length - 1)), y: 150 - (value / maximum) * 110, value, label: stimulus.labels[index] }));
  return <figure className="data-stimulus"><figcaption>{stimulus.title}{stimulus.unit ? ` · ${stimulus.unit}` : ""}</figcaption><svg viewBox="0 0 400 190" role="img" aria-label={`${stimulus.title}: ${points.map((point) => `${point.label} ${point.value}`).join(", ")}`}><line className="chart-axis" x1="36" x2="370" y1="150" y2="150" />{stimulus.kind === "bar" ? points.map((point) => <g key={point.label}><rect className="chart-bar" x={point.x - 22} y={point.y} width="44" height={150 - point.y} rx="4" /><text x={point.x} y={point.y - 8}>{point.value}</text><text className="chart-label" x={point.x} y="174">{point.label}</text></g>) : <><polyline className="chart-line" points={points.map((point) => `${point.x},${point.y}`).join(" ")} />{points.map((point) => <g key={point.label}><circle className="chart-point" cx={point.x} cy={point.y} r="5" /><text x={point.x} y={point.y - 10}>{point.value}</text><text className="chart-label" x={point.x} y="174">{point.label}</text></g>)}</>}</svg></figure>;
}
