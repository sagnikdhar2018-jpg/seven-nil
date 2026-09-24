import type { MatchGoal, TeamRatings } from "@/lib/seven/types";
import { teamRank } from "@/lib/seven/rankings";
import { cn } from "@/lib/utils";

export type BracketTie = {
  round: string;
  home: string;
  away: string;
  gf: number;
  ga: number;
  winner?: string;
  goals?: MatchGoal[];
  pens?: { home: number; away: number };
  homeRatings?: TeamRatings;
  awayRatings?: TeamRatings;
  instant?: boolean;
};

const ROUND_LABEL: Record<string, string> = {
  "Round of 32": "Round of 32",
  "Round of 16": "Round of 16",
  "Quarter-final": "Quarter-finals",
  "Semi-final": "Semi-finals",
  Final: "Final",
};

const FLAGS: Record<string, string> = {
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  England: "🇬🇧",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Croatia: "🇭🇷",
  Uruguay: "🇺🇾",
  Mexico: "🇲🇽",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  Korea: "🇰🇷",
  Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  Nigeria: "🇳🇬",
  Ghana: "🇬🇭",
  Cameroon: "🇨🇲",
  "United States": "🇺🇸",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Switzerland: "🇨🇭",
  Denmark: "🇩🇰",
  Sweden: "🇸🇪",
  Poland: "🇵🇱",
  Colombia: "🇨🇴",
  Chile: "🇨🇱",
  Ecuador: "🇪🇨",
  Serbia: "🇷🇸",
  Turkey: "🇹🇷",
};

type Col = { name: string; games: BracketTie[] };

function columns(games: BracketTie[]): Col[] {
  const order: string[] = [];
  const map = new Map<string, BracketTie[]>();
  for (const game of games) {
    if (!map.has(game.round)) {
      order.push(game.round);
      map.set(game.round, []);
    }
    map.get(game.round)!.push(game);
  }
  return order.map((name) => ({ name, games: map.get(name)! }));
}

function wings(games: BracketTie[]) {
  const cols = columns(games);
  if (cols.length <= 1) return { left: [] as Col[], right: [] as Col[], final: cols[0]?.games ?? [] };
  const rounds = cols.slice(0, -1);
  const left = rounds.map((col) => ({
    name: col.name,
    games: col.games.slice(0, Math.ceil(col.games.length / 2)),
  }));
  const right = rounds
    .map((col) => ({
      name: col.name,
      games: col.games.slice(Math.ceil(col.games.length / 2)),
    }))
    .reverse();
  return { left, right, final: cols[cols.length - 1]!.games };
}

function markStates(games: BracketTie[], liveIndex: number) {
  const map = new Map<BracketTie, "done" | "live" | "wait">();
  let seen = 0;
  for (const game of games) {
    if (game.instant) {
      map.set(game, "done");
      continue;
    }
    map.set(game, seen < liveIndex ? "done" : seen === liveIndex ? "live" : "wait");
    seen += 1;
  }
  return map;
}

function pairsOf(games: BracketTie[]) {
  const pairs: BracketTie[][] = [];
  for (let i = 0; i < games.length; i += 2) pairs.push(games.slice(i, i + 2));
  return pairs;
}

function Tie({
  game,
  state,
}: {
  game: BracketTie;
  state: "done" | "live" | "wait";
}) {
  const homeWin = state === "done" && game.winner === game.home;
  const awayWin = state === "done" && game.winner === game.away;
  const score = (value: number, side: "home" | "away") => {
    if (state !== "done") return state === "live" && side === "home" ? "•" : "";
    return String(value);
  };
  return (
    <div className={cn("tie", state === "done" && "is-done", state === "live" && "is-live", state === "wait" && "is-wait")}>
      <Team name={game.home} score={score(game.gf, "home")} win={homeWin} />
      <Team name={game.away} score={score(game.ga, "away")} win={awayWin} />
      {state === "done" && game.pens ? (
        <p className="tie-pens">Pens {game.pens.home}–{game.pens.away}</p>
      ) : null}
    </div>
  );
}

function Team({ name, score, win }: { name: string; score: string; win: boolean }) {
  const flag = FLAGS[name];
  const rank = teamRank(name);
  return (
    <div className={cn("tie-team", win && "is-win")}>
      <span className="tie-name">
        {rank ? <span className="tie-rank">{rank}</span> : null}
        {flag ? <span className="tie-flag" aria-hidden="true">{flag}</span> : <span className="tie-pip" aria-hidden="true" />}
        <span className="truncate">{name}</span>
      </span>
      <span className="font-numeral tabular-nums">{score}</span>
    </div>
  );
}

function Joins({ games, side }: { games: number; side: "left" | "right" }) {
  const single = games <= 1;
  const count = single ? 1 : Math.ceil(games / 2);
  return (
    <div className={cn("wc-joins", side === "right" && "is-right", single && "is-single")} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="wc-elbow" />
      ))}
    </div>
  );
}

function Round({
  col,
  states,
}: {
  col: Col;
  states: Map<BracketTie, "done" | "live" | "wait">;
}) {
  return (
    <div className="wc-round">
      <h3>{ROUND_LABEL[col.name] ?? col.name}</h3>
      <div className="wc-pairs">
        {pairsOf(col.games).map((pair, index) => (
          <div key={`${col.name}-${index}`} className="wc-pair">
            {pair.map((game) => (
              <Tie key={`${game.home}-${game.away}`} game={game} state={states.get(game) ?? "done"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BracketBoard({
  games,
  liveIndex,
}: {
  games: BracketTie[];
  liveIndex: number;
}) {
  const { left, right, final } = wings(games);
  const states = markStates(games, liveIndex);
  const finalGame = final[0];

  return (
    <div className="bracket-scroll">
      <div className="wc">
        <div className="wc-wing">
          {left.map((col) => (
            <div key={col.name} className="wc-stage">
              <Round col={col} states={states} />
              <Joins games={col.games.length} side="left" />
            </div>
          ))}
        </div>
        <div className="wc-center">
          <h3>Final</h3>
          {finalGame ? (
            <Tie game={finalGame} state={states.get(finalGame) ?? "done"} />
          ) : (
            <p className="text-sm text-muted">Final</p>
          )}
        </div>
        <div className="wc-wing is-right">
          {right.map((col) => (
            <div key={col.name} className="wc-stage">
              <Joins games={col.games.length} side="right" />
              <Round col={col} states={states} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChampionPop({
  open,
  name,
  detail,
  onClose,
}: {
  open: boolean;
  name: string;
  detail?: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="champ-pop" role="dialog" aria-modal="true" aria-label="Champions">
      <div className="champ-card">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Champions</p>
        <h2 className="font-display text-5xl leading-none text-ink">{name}</h2>
        <p className="text-sm text-muted">{detail ?? "You won the cup."}</p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
