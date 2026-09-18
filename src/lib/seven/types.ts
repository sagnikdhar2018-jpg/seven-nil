export type Pos =
  | "GK"
  | "RB"
  | "CB"
  | "LB"
  | "RWB"
  | "LWB"
  | "DM"
  | "CM"
  | "AM"
  | "RM"
  | "LM"
  | "RW"
  | "LW"
  | "ST";

export type FormationId =
  | "4-3-3"
  | "4-4-2"
  | "4-2-3-1"
  | "4-2-4"
  | "3-5-2"
  | "5-3-2"
  | "4-5-1"
  | "3-4-3";

export type StyleId = "defensive" | "balanced" | "attacking";
export type ModeId = "classic" | "almanac";
export type Phase = "setup" | "picking" | "ready" | "simulating" | "result";
export type PoolId = "world" | "club";

export type Player = {
  id: string;
  name: string;
  nation: string;
  year: number;
  num: number;
  pos: Pos[];
  ovr: number;
};

export type Squad = {
  id: string;
  nation: string;
  year: number;
  league?: string;
  players: Player[];
};

export type Slot = {
  id: string;
  pos: Pos;
  x: number;
  y: number;
  player: Player | null;
};

export type DrawnSquad = {
  squad: Squad;
  remaining: Player[];
};

export type Match = {
  round: string;
  opponent: string;
  gf: number;
  ga: number;
  result: "W" | "D" | "L";
};

export type Campaign = {
  matches: Match[];
  played: number;
  gf: number;
  ga: number;
  pts: number;
  won: number;
  drawn: number;
  lost: number;
  champion: boolean;
  unbeaten: boolean;
  cleanSheetRun: boolean;
  sevenNilMatch: boolean;
  dream: boolean;
  exit: string;
  attack: number;
  midfield: number;
  defence: number;
};
