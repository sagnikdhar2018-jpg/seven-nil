export type AuctionSlot = "GK" | "DEF" | "MID" | "ATT";
export type ValueTier = "S" | "A" | "B" | "C";

export interface AuctionPlayer {
  id: string;
  name: string;
  position: AuctionSlot;
  overallRating: number;
  marketValueTier: ValueTier;
  nationality: string;
  club: string;
  funFactOrForm: string;
  imageUrl: string;
}

/** Portraits are drawn in the UI. Remote photos are left blank so a dead link never breaks a card. */
const p = (
  id: string,
  name: string,
  position: AuctionSlot,
  overallRating: number,
  marketValueTier: ValueTier,
  nationality: string,
  club: string,
  funFactOrForm: string,
): AuctionPlayer => ({ id, name, position, overallRating, marketValueTier, nationality, club, funFactOrForm, imageUrl: "" });

export const AUCTION_PLAYERS: AuctionPlayer[] = [
  p("courtois", "Courtois", "GK", 90, "S", "BE", "Real Madrid", "World-class shot stopper"),
  p("alisson", "Alisson", "GK", 89, "A", "BR", "Liverpool", "Claims crosses and starts attacks"),
  p("donnarumma", "Donnarumma", "GK", 88, "A", "IT", "PSG", "Huge reach, still improving with his feet"),
  p("mamardashvili", "Mamardashvili", "GK", 85, "B", "GE", "Liverpool", "Reflexes in the biggest games"),
  p("maignan", "Maignan", "GK", 87, "A", "FR", "AC Milan", "Commanding box, calm on the ball"),
  p("ederson", "Ederson", "GK", 86, "A", "BR", "Manchester City", "Plays out like a midfielder"),
  p("martinez-e", "E. Martínez", "GK", 87, "A", "AR", "Aston Villa", "Penalty specialist"),
  p("lammens", "Lammens", "GK", 78, "C", "BE", "Antwerp", "Young keeper, still raw"),
  p("sommer", "Sommer", "GK", 84, "B", "CH", "Inter", "Quiet and reliable"),
  p("raya", "Raya", "GK", 85, "B", "ES", "Arsenal", "Good with the ball at his feet"),

  p("van-dijk", "Van Dijk", "DEF", 90, "S", "NL", "Liverpool", "Wins the aerials and steps out"),
  p("saliba", "Saliba", "DEF", 88, "A", "FR", "Arsenal", "Reads the through ball early"),
  p("dias", "Rúben Dias", "DEF", 87, "A", "PT", "Manchester City", "Organises the whole back line"),
  p("hakimi", "Hakimi", "DEF", 87, "A", "MA", "PSG", "Gets up the wing and back"),
  p("rudiger", "Rüdiger", "DEF", 85, "B", "DE", "Real Madrid", "Aggressive, hard to play around"),
  p("gvardiol", "Gvardiol", "DEF", 85, "B", "HR", "Manchester City", "Comfortable in a back three or four"),
  p("araujo", "Araujo", "DEF", 84, "B", "UY", "Barcelona", "Recovery pace"),
  p("marquinhos", "Marquinhos", "DEF", 86, "A", "BR", "PSG", "Captain's timing"),
  p("theo", "T. Hernández", "DEF", 85, "B", "FR", "AC Milan", "Overlaps like a winger"),
  p("grimaldo", "Grimaldo", "DEF", 84, "B", "ES", "Leverkusen", "Delivers from the left"),

  p("bellingham", "Bellingham", "MID", 91, "S", "EN", "Real Madrid", "Arrives in the box and still tracks"),
  p("rodri", "Rodri", "MID", 91, "S", "ES", "Manchester City", "Sets the tempo"),
  p("pedri", "Pedri", "MID", 88, "A", "ES", "Barcelona", "Keeps the ball under pressure"),
  p("kimmich", "Kimmich", "MID", 88, "A", "DE", "Bayern", "Dictates from deep"),
  p("valverde", "Valverde", "MID", 88, "A", "UY", "Real Madrid", "Covers the whole pitch"),
  p("de-bruyne", "De Bruyne", "MID", 89, "A", "BE", "Napoli", "The pass that splits a block"),
  p("vitinha", "Vitinha", "MID", 87, "A", "PT", "PSG", "Turns out of the press"),
  p("barella", "Barella", "MID", 87, "A", "IT", "Inter", "Box-to-box engine"),
  p("musiala", "Musiala", "MID", 88, "A", "DE", "Bayern", "Glides past the first man"),
  p("rice", "Rice", "MID", 87, "A", "EN", "Arsenal", "Screens and steps into midfield"),
  p("wirtz", "Wirtz", "MID", 87, "A", "DE", "Liverpool", "Finds the half-space"),
  p("camavinga", "Camavinga", "MID", 84, "B", "FR", "Real Madrid", "Can cover almost any role"),
  p("cherki", "Cherki", "MID", 83, "B", "FR", "Manchester City", "Tries the difficult pass"),
  p("anderson", "E. Anderson", "MID", 80, "C", "EN", "Nottingham Forest", "Runs, tackles, keeps it simple"),
  p("modric", "Modrić", "MID", 86, "A", "HR", "Real Madrid", "Still slows the game down"),

  p("vinicius", "Vinícius Jr.", "ATT", 91, "S", "BR", "Real Madrid", "Beats his man on the outside"),
  p("mbappe", "Mbappé", "ATT", 92, "S", "FR", "Real Madrid", "The run in behind"),
  p("haaland", "Haaland", "ATT", 91, "S", "NO", "Manchester City", "Finishes the first chance"),
  p("yamal", "Yamal", "ATT", 89, "A", "ES", "Barcelona", "Cuts inside and crosses early"),
  p("messi", "Messi", "ATT", 88, "A", "AR", "Inter Miami", "Still finds the pocket"),
  p("salah", "Salah", "ATT", 89, "A", "EG", "Liverpool", "Goals from the right"),
  p("kane", "Kane", "ATT", 90, "S", "EN", "Bayern", "Drops in, then arrives"),
  p("dembele", "Dembélé", "ATT", 89, "A", "FR", "PSG", "Direct, and now he finishes"),
  p("lautaro", "Lautaro", "ATT", 88, "A", "AR", "Inter", "Link play and the shot"),
  p("saka", "Saka", "ATT", 87, "A", "EN", "Arsenal", "1v1 and the cut-back"),
  p("palmer", "Palmer", "ATT", 87, "A", "EN", "Chelsea", "Arrives from the right channel"),
  p("olise", "Olise", "ATT", 86, "A", "FR", "Bayern", "Carries it twenty yards"),
  p("gyokeres", "Gyökeres", "ATT", 85, "B", "SE", "Arsenal", "Runs the channels"),
  p("balogun", "Balogun", "ATT", 80, "C", "US", "Monaco", "Penalty-box striker"),
];
