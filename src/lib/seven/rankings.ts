const NATIONS: [string, number][] = [
  ["Brazil", 1],
  ["Germany", 2],
  ["Argentina", 3],
  ["Italy", 4],
  ["France", 5],
  ["Spain", 6],
  ["England", 7],
  ["Netherlands", 8],
  ["Uruguay", 9],
  ["Portugal", 10],
  ["Belgium", 11],
  ["Croatia", 12],
  ["Colombia", 13],
  ["Sweden", 14],
  ["Denmark", 15],
  ["Morocco", 16],
  ["Mexico", 17],
  ["Senegal", 18],
  ["Nigeria", 19],
  ["Chile", 20],
  ["Turkey", 21],
  ["Switzerland", 22],
  ["Poland", 23],
  ["Japan", 24],
  ["Korea", 25],
  ["Ghana", 26],
  ["Cameroon", 27],
  ["USA", 28],
  ["Australia", 29],
  ["Ecuador", 30],
  ["Serbia", 31],
];

const CLUBS: [string, number][] = [
  ["Real Madrid", 1],
  ["Barcelona", 2],
  ["Bayern Munich", 3],
  ["AC Milan", 4],
  ["Liverpool", 5],
  ["Manchester United", 6],
  ["Juventus", 7],
  ["Inter", 8],
  ["Ajax", 9],
  ["Chelsea", 10],
  ["Manchester City", 11],
  ["Arsenal", 12],
  ["Porto", 13],
  ["Benfica", 14],
  ["Atlético Madrid", 15],
  ["Borussia Dortmund", 16],
  ["PSG", 17],
  ["Marseille", 18],
  ["Lyon", 19],
  ["Celtic", 20],
  ["Sevilla", 21],
  ["Monaco", 22],
  ["Roma", 23],
  ["Bayer Leverkusen", 24],
  ["Napoli", 25],
];

const ALIASES: Record<string, string> = {
  bayern: "bayern munich",
  milan: "ac milan",
  united: "manchester united",
  city: "manchester city",
  dortmund: "borussia dortmund",
  atlético: "atlético madrid",
  atletico: "atlético madrid",
  "atletico madrid": "atlético madrid",
  leverkusen: "bayer leverkusen",
  "south korea": "korea",
  "united states": "usa",
};

function table(pool: "world" | "club") {
  return pool === "club" ? CLUBS : NATIONS;
}

export function teamRank(label: string, pool: "world" | "club" = "world"): number | null {
  const raw = label.replace(/\s+(19|20)\d{2}$/, "").trim().toLowerCase();
  if (!raw) return null;
  const key = ALIASES[raw] ?? raw;
  const hit = (rows: [string, number][]) => rows.find(([name]) => name.toLowerCase() === key)?.[1] ?? null;
  return hit(table(pool)) ?? hit(NATIONS) ?? hit(CLUBS);
}

export function rankedSides(pool: "world" | "club") {
  return table(pool).map(([name, rank]) => ({ name, rank }));
}

export function bracketSeeds(size: number) {
  let slots = [1, 2];
  while (slots.length < size) {
    const next: number[] = [];
    const mirror = slots.length * 2 + 1;
    for (const seed of slots) next.push(seed, mirror - seed);
    slots = next;
  }
  return slots.slice(0, size);
}
