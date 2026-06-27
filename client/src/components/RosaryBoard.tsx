import { useMemo } from "react";

export type RosaryStep =
  | { type: "intro" }
  | { type: "credo" }
  | { type: "pai_nosso_initial" }
  | { type: "ave_maria_initial"; count: number }
  | { type: "mystery"; mysteryIndex: number }
  | { type: "pai_nosso"; mysteryIndex: number }
  | { type: "ave_maria"; mysteryIndex: number; count: number }
  | { type: "gloria"; mysteryIndex: number }
  | { type: "fatima"; mysteryIndex: number }
  | { type: "salve" }
  | { type: "complete" };

interface RosaryBoardProps {
  step: RosaryStep;
  onSelectStep: (step: RosaryStep) => void;
  mysteryImageUrl?: string;
}

type BeadKind = "crucifix" | "of" | "hm" | "medal";

interface Bead {
  id: string;
  kind: BeadKind;
  x: number;
  y: number;
  rank: number;
  step: RosaryStep;
  glyph?: string;
  ariaLabel: string;
}

const VIEW_W = 380;
const VIEW_H = 520;
const MARIAN_MEDAL_ICON_URL = "/audio/rosary/maria.ico";
const CENTER_X = 190;
const CENTER_Y = 172;
const LOOP_RADIUS_X = 170;
const LOOP_RADIUS_Y = 160;
const LOWER_DROP = 22;
const LOWER_NARROWING = 0.2;
const LOOP_BEAD_COUNT = 55; // 5 decades × (1 Pai Nosso + 10 Ave Marias)
const GAP_DEG = 54; // abertura na base do laço, onde fica a medalha

// Contas da haste pendente (do crucifixo até a medalha), de baixo para cima.
const TAIL = {
  crucifix: { x: CENTER_X, y: 486 },
  p1: { x: CENTER_X, y: 447 },
  hm1: { x: CENTER_X, y: 419 },
  hm2: { x: CENTER_X, y: 392 },
  hm3: { x: CENTER_X, y: 365 },
  medal: { x: CENTER_X, y: 338 },
};

function buildLoop(): { x: number; y: number; i: number }[] {
  const beads: { x: number; y: number; i: number }[] = [];
  const arc = 360 - GAP_DEG;
  const start = 90 + GAP_DEG / 2;
  const spacing = arc / (LOOP_BEAD_COUNT - 1);
  for (let i = 0; i < LOOP_BEAD_COUNT; i++) {
    const rad = ((start + i * spacing) * Math.PI) / 180;
    const lowerHalf = Math.max(0, Math.sin(rad));
    const xRadius = LOOP_RADIUS_X * (1 - LOWER_NARROWING * Math.pow(lowerHalf, 1.25));
    beads.push({
      i,
      x: CENTER_X + xRadius * Math.cos(rad),
      y: CENTER_Y + LOOP_RADIUS_Y * Math.sin(rad) + LOWER_DROP * Math.pow(lowerHalf, 2),
    });
  }
  return beads;
}

function buildBeads(): { beads: Bead[]; chainPath: string } {
  const loop = buildLoop();
  const beads: Bead[] = [];

  beads.push({
    id: "crucifix",
    kind: "crucifix",
    x: TAIL.crucifix.x,
    y: TAIL.crucifix.y,
    rank: 0,
    step: { type: "intro" },
    glyph: "✝",
    ariaLabel: "Oferecimento e Credo",
  });
  beads.push({
    id: "p1",
    kind: "of",
    x: TAIL.p1.x,
    y: TAIL.p1.y,
    rank: 1,
    step: { type: "pai_nosso_initial" },
    ariaLabel: "Pai Nosso inicial",
  });
  [TAIL.hm1, TAIL.hm2, TAIL.hm3].forEach((p, idx) => {
    const count = idx + 1;
    beads.push({
      id: `hm-initial-${count}`,
      kind: "hm",
      x: p.x,
      y: p.y,
      rank: 1 + count,
      step: { type: "ave_maria_initial", count },
      ariaLabel: `Ave Maria inicial ${count} de 3`,
    });
  });

  loop.forEach(({ x, y, i }) => {
    const decadeIndex = Math.floor(i / 11);
    const within = i % 11; // 0 = Pai Nosso, 1..10 = Ave Marias
    if (within === 0) {
      beads.push({
        id: `of-${decadeIndex}`,
        kind: "of",
        x,
        y,
        rank: 5 + i,
        step: { type: "mystery", mysteryIndex: decadeIndex },
        glyph: String(decadeIndex + 1),
        ariaLabel: `${decadeIndex + 1}º Mistério — anúncio e meditação`,
      });
    } else {
      beads.push({
        id: `hm-${decadeIndex}-${within}`,
        kind: "hm",
        x,
        y,
        rank: 5 + i,
        step: { type: "ave_maria", mysteryIndex: decadeIndex, count: within },
        ariaLabel: `${decadeIndex + 1}º Mistério — Ave Maria ${within} de 10`,
      });
    }
  });

  beads.push({
    id: "medal",
    kind: "medal",
    x: TAIL.medal.x,
    y: TAIL.medal.y,
    rank: 60,
    step: { type: "salve" },
    ariaLabel: "Salve Rainha",
  });

  // Cadeia: crucifixo → haste → medalha → laço → medalha.
  const tailPoints = [TAIL.crucifix, TAIL.p1, TAIL.hm1, TAIL.hm2, TAIL.hm3, TAIL.medal];
  let chainPath = `M ${tailPoints[0].x} ${tailPoints[0].y}`;
  for (let p = 1; p < tailPoints.length; p++) {
    chainPath += ` L ${tailPoints[p].x} ${tailPoints[p].y}`;
  }
  loop.forEach(({ x, y }) => {
    chainPath += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  chainPath += ` L ${TAIL.medal.x} ${TAIL.medal.y}`;

  return { beads, chainPath };
}

function stepToRank(step: RosaryStep): number {
  switch (step.type) {
    case "intro":
    case "credo":
      return 0;
    case "pai_nosso_initial":
      return 1;
    case "ave_maria_initial":
      return 1 + step.count;
    case "mystery":
    case "pai_nosso":
      return 5 + step.mysteryIndex * 11;
    case "ave_maria":
      return 5 + step.mysteryIndex * 11 + step.count;
    case "gloria":
    case "fatima":
      return 5 + step.mysteryIndex * 11 + 10;
    case "salve":
      return 60;
    case "complete":
      return 61;
    default:
      return 0;
  }
}

function coreLabel(step: RosaryStep): { kicker: string; title: string; progress?: string } {
  switch (step.type) {
    case "intro":
      return { kicker: "Início", title: "Oferecimento e Credo" };
    case "pai_nosso_initial":
      return { kicker: "Início", title: "Pai Nosso" };
    case "ave_maria_initial":
      return { kicker: "Início", title: "Ave Maria", progress: `${step.count} / 3` };
    case "mystery":
      return { kicker: `${step.mysteryIndex + 1}º Mistério`, title: "Anúncio" };
    case "pai_nosso":
      return { kicker: `${step.mysteryIndex + 1}º Mistério`, title: "Pai Nosso" };
    case "ave_maria":
      return { kicker: `${step.mysteryIndex + 1}º Mistério`, title: "Ave Maria", progress: `${step.count} / 10` };
    case "gloria":
      return { kicker: `${step.mysteryIndex + 1}º Mistério`, title: "Glória ao Pai" };
    case "fatima":
      return { kicker: `${step.mysteryIndex + 1}º Mistério`, title: "Ó meu Jesus" };
    case "salve":
      return { kicker: "Final", title: "Salve Rainha" };
    default:
      return { kicker: "", title: "" };
  }
}

export default function RosaryBoard({ step, onSelectStep, mysteryImageUrl }: RosaryBoardProps) {
  const { beads, chainPath } = useMemo(() => buildBeads(), []);
  const activeRank = stepToRank(step);
  const label = coreLabel(step);

  return (
    <div className="rosary-board" role="group" aria-label="Terço interativo">
      {mysteryImageUrl && (
        <div className="rosary-core-image" aria-hidden="true">
          <img src={mysteryImageUrl} alt="" loading="lazy" />
        </div>
      )}
      <svg
        className="rosary-chain"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path d={chainPath} className="rosary-chain-line" />
      </svg>

      {beads.map((bead) => {
        const state =
          bead.rank < activeRank ? "is-prayed" : bead.rank === activeRank ? "is-active" : "is-upcoming";
        return (
          <button
            key={bead.id}
            type="button"
            className={`rosary-node rosary-node--${bead.kind} ${state}`}
            style={{ left: `${(bead.x / VIEW_W) * 100}%`, top: `${(bead.y / VIEW_H) * 100}%` }}
            onClick={() => onSelectStep(bead.step)}
            aria-label={bead.ariaLabel}
            aria-current={bead.rank === activeRank ? "step" : undefined}
          >
            {bead.kind === "medal" && (
              <img className="rosary-node-icon rosary-node-icon--marian" src={MARIAN_MEDAL_ICON_URL} alt="" aria-hidden="true" />
            )}
            {bead.glyph && (
              <span
                className={bead.kind === "medal" ? "rosary-node-glyph rosary-node-glyph--marian" : "rosary-node-glyph"}
                aria-hidden="true"
              >
                {bead.glyph}
              </span>
            )}
          </button>
        );
      })}

      {!mysteryImageUrl && (
        <div className="rosary-core">
          <p className="rosary-core-kicker">{label.kicker}</p>
          <p className="rosary-core-title">{label.title}</p>
          {label.progress && <p className="rosary-core-progress">{label.progress}</p>}
        </div>
      )}
    </div>
  );
}
