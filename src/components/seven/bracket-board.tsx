import type { MatchGoal, TeamRatings } from "@/lib/seven/types";
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

function columns(games: BracketTie[]) {
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

function pairsOf(games: BracketTie[]) {
  const pairs: BracketTie[][] = [];
  for (let i = 0; i < games.length; i += 2) pairs.push(games.slice(i, i + 2));
  return pairs;
}

export function BracketBoard({
  games,
  liveIndex,
}: {
  games: BracketTie[];
  liveIndex: number;
}) {
  const cols = columns(games);
  let liveSeen = 0;

  return (
    <div className="bracket-scroll">
      <div className="bracket">
        {cols.map((col, colIndex) => (
          <div key={col.name} className="bracket-col">
            <h3>{ROUND_LABEL[col.name] ?? col.name}</h3>
            <div className="bracket-ties">
              {pairsOf(col.games).map((pair, index) => (
                <div
                  key={`${col.name}-${index}`}
                  className={cn("tie-pair", pair.length === 1 && "is-single", colIndex < cols.length - 1 && "has-link")}
                >
                  {pair.map((game) => {
                    let state: "done" | "live" | "wait" = "done";
                    if (!game.instant) {
                      if (liveSeen < liveIndex) state = "done";
                      else if (liveSeen === liveIndex) state = "live";
                      else state = "wait";
                      liveSeen += 1;
                    }
                    const homeWin = state === "done" && game.winner === game.home;
                    const awayWin = state === "done" && game.winner === game.away;
                    return (
                      <div
                        key={`${game.round}-${game.home}-${game.away}`}
                        className={cn("tie", state === "done" && "is-done", state === "live" && "is-live", state === "wait" && "is-wait")}
                      >
                        <div className={cn("tie-team", homeWin && "is-win")}>
                          <span className="truncate">{game.home}</span>
                          <span className="font-numeral tabular-nums">{state === "done" ? game.gf : state === "live" ? "•" : ""}</span>
                        </div>
                        <div className={cn("tie-team", awayWin && "is-win")}>
                          <span className="truncate">{game.away}</span>
                          <span className="font-numeral tabular-nums">{state === "done" ? game.ga : ""}</span>
                        </div>
                      </div>
                    );
                  })}
                  {colIndex < cols.length - 1 ? <div className="tie-link" aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
