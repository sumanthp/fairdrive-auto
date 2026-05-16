"use client";

interface Props {
  score: number;
  size?: number;
}

const GAUGE_ARC = 172.8;

export default function ScoreGauge({ score, size = 144 }: Props) {
  const filled = (score / 100) * GAUGE_ARC;
  const hue = Math.round(score * 1.2);
  const strokeColor = `hsl(${hue}, 72%, 52%)`;

  return (
    <div className="score-gauge" style={{ width: size, flex: `0 0 ${size}px` }}>
      <svg viewBox="0 0 120 70" aria-hidden="true">
        <path className="gauge-track" d="M10,65 A55,55,0,0,1,110,65" />
        <path
          className="gauge-fill"
          d="M10,65 A55,55,0,0,1,110,65"
          style={{
            strokeDasharray: `${filled} ${GAUGE_ARC}`,
            strokeDashoffset: 0,
            stroke: strokeColor,
          }}
        />
      </svg>
      <div className="score-number">{score}</div>
      <div className="score-label">FairScore</div>
    </div>
  );
}
