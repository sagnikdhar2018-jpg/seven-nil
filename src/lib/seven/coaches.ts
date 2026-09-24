import type { FormationId, StyleId } from "./types";

export type CoachPlay =
  | "possession"
  | "quick-counter"
  | "long-ball-counter"
  | "long-ball"
  | "counter"
  | "overload"
  | "out-wide";

export type CoachStats = {
  possession: number;
  quickCounter: number;
  longBall: number;
  overload: number;
  pressing: number;
  compactness: number;
};

export type Coach = {
  id: string;
  name: string;
  known: string;
  years: string;
  formation: FormationId;
  play: CoachPlay;
  stats: CoachStats;
};

export const PLAY_LABEL: Record<CoachPlay, string> = {
  possession: "Possession game",
  "quick-counter": "Quick counter",
  "long-ball-counter": "Long ball counter",
  "long-ball": "Long ball",
  counter: "Counter",
  overload: "Overload",
  "out-wide": "Out wide",
};

const RAW: [string, string, string, FormationId, CoachPlay, number, number, number, number, number, number][] = [
  ["Pep Guardiola", "Barcelona, Manchester City", "2008–", "4-3-3", "possession", 96, 62, 48, 78, 88, 80],
  ["José Mourinho", "Porto, Inter, Chelsea", "2003–", "4-2-3-1", "counter", 58, 84, 55, 52, 70, 90],
  ["Alex Ferguson", "Manchester United", "1986–2013", "4-4-2", "quick-counter", 64, 88, 60, 74, 82, 72],
  ["Arrigo Sacchi", "AC Milan", "1987–1991", "4-4-2", "overload", 78, 70, 44, 90, 94, 86],
  ["Rinus Michels", "Ajax, Netherlands", "1965–1974", "4-3-3", "possession", 94, 66, 46, 80, 86, 78],
  ["Johan Cruyff", "Barcelona", "1988–1996", "3-4-3", "possession", 95, 64, 42, 82, 84, 74],
  ["Carlo Ancelotti", "Milan, Madrid", "2001–", "4-3-3", "possession", 82, 72, 58, 66, 68, 76],
  ["Jürgen Klopp", "Dortmund, Liverpool", "2008–2024", "4-3-3", "overload", 70, 86, 48, 94, 96, 72],
  ["Diego Simeone", "Atlético Madrid", "2011–", "4-4-2", "counter", 48, 78, 62, 44, 74, 96],
  ["Arsène Wenger", "Arsenal", "1996–2018", "4-2-3-1", "possession", 90, 60, 50, 70, 72, 70],
  ["Fabio Capello", "Milan, Madrid, England", "1991–2012", "4-4-2", "counter", 62, 74, 56, 50, 66, 88],
  ["Marcello Lippi", "Juventus, Italy 2006", "1994–2006", "4-4-2", "counter", 66, 76, 58, 60, 70, 84],
  ["Vicente del Bosque", "Madrid, Spain 2010", "1999–2016", "4-2-3-1", "possession", 92, 58, 46, 64, 66, 82],
  ["Luis Aragonés", "Spain 2008", "2004–2008", "4-4-2", "possession", 88, 64, 48, 68, 74, 76],
  ["Joachim Löw", "Germany 2014", "2006–2021", "4-2-3-1", "possession", 90, 68, 50, 76, 80, 78],
  ["Didier Deschamps", "France", "2012–", "4-2-3-1", "counter", 60, 80, 58, 54, 68, 88],
  ["Lionel Scaloni", "Argentina 2022", "2018–", "4-3-3", "quick-counter", 74, 88, 52, 72, 78, 80],
  ["Luiz Felipe Scolari", "Brazil 2002", "2001–2002", "3-5-2", "counter", 58, 76, 64, 60, 72, 82],
  ["Carlos Alberto Parreira", "Brazil 1994", "1991–1994", "4-4-2", "counter", 64, 72, 60, 52, 64, 86],
  ["Mário Zagallo", "Brazil 1970", "1970", "4-2-4", "out-wide", 70, 74, 56, 84, 70, 66],
  ["Telê Santana", "Brazil 1982", "1980–1982", "4-2-2-2", "possession", 92, 66, 44, 78, 76, 68],
  ["Aimé Jacquet", "France 1998", "1994–1998", "4-3-1-2", "counter", 66, 74, 54, 58, 68, 86],
  ["César Luis Menotti", "Argentina 1978", "1974–1982", "4-3-3", "possession", 90, 62, 48, 72, 70, 70],
  ["Carlos Bilardo", "Argentina 1986", "1983–1990", "3-5-2", "counter", 52, 82, 60, 48, 66, 92],
  ["Helenio Herrera", "Inter", "1960–1968", "5-3-2", "counter", 46, 80, 66, 40, 62, 97],
  ["Nereo Rocco", "AC Milan", "1961–1973", "5-3-2", "counter", 48, 76, 64, 42, 60, 94],
  ["Valeriy Lobanovskyi", "Dynamo Kyiv, USSR", "1973–1990", "4-4-2", "overload", 80, 78, 50, 88, 92, 84],
  ["Ernst Happel", "Netherlands 1978", "1974–1978", "4-3-3", "possession", 86, 70, 50, 74, 80, 76],
  ["Béla Guttmann", "Benfica", "1959–1962", "4-2-4", "out-wide", 72, 76, 58, 86, 74, 64],
  ["Bill Shankly", "Liverpool", "1959–1974", "4-4-2", "quick-counter", 66, 86, 56, 72, 84, 74],
  ["Bob Paisley", "Liverpool", "1974–1983", "4-4-2", "quick-counter", 68, 84, 58, 70, 78, 78],
  ["Brian Clough", "Nottingham Forest", "1975–1993", "4-4-2", "counter", 64, 82, 54, 60, 72, 84],
  ["Jock Stein", "Celtic", "1965–1978", "4-2-4", "out-wide", 74, 78, 52, 84, 80, 68],
  ["Matt Busby", "Manchester United", "1945–1969", "4-2-4", "out-wide", 76, 74, 50, 82, 76, 66],
  ["Alf Ramsey", "England 1966", "1963–1974", "4-4-2", "counter", 60, 78, 62, 48, 64, 88],
  ["Helmut Schön", "West Germany 1974", "1964–1978", "4-3-3", "possession", 84, 70, 52, 72, 76, 76],
  ["Franz Beckenbauer", "West Germany 1990", "1984–1990", "5-3-2", "counter", 62, 74, 58, 50, 64, 90],
  ["Ottmar Hitzfeld", "Dortmund, Bayern", "1991–2008", "4-4-2", "quick-counter", 72, 82, 54, 68, 76, 80],
  ["Jupp Heynckes", "Bayern 2013", "2011–2013", "4-2-3-1", "possession", 86, 70, 50, 74, 80, 78],
  ["Louis van Gaal", "Ajax, Bayern, Netherlands", "1991–2014", "4-3-3", "possession", 93, 60, 44, 70, 74, 82],
  ["Frank Rijkaard", "Barcelona", "2003–2008", "4-3-3", "possession", 90, 62, 46, 68, 72, 76],
  ["Luis Enrique", "Barcelona", "2014–2017", "4-3-3", "overload", 84, 74, 48, 88, 90, 70],
  ["Xavi Hernández", "Barcelona", "2021–2024", "4-3-3", "possession", 95, 58, 42, 72, 74, 78],
  ["Hansi Flick", "Bayern 2020", "2019–2021", "4-2-3-1", "overload", 80, 82, 48, 92, 94, 72],
  ["Thomas Tuchel", "Chelsea 2021", "2021", "3-4-2-1", "counter", 70, 80, 52, 64, 74, 86],
  ["Antonio Conte", "Juventus, Inter, Chelsea", "2011–", "3-5-2", "quick-counter", 58, 90, 56, 66, 84, 88],
  ["Massimiliano Allegri", "Juventus", "2014–", "3-5-2", "counter", 60, 78, 58, 48, 62, 92],
  ["Luciano Spalletti", "Napoli, Italy", "2021–", "4-3-3", "possession", 88, 72, 48, 74, 78, 76],
  ["Roberto Mancini", "Inter, Italy 2020", "2014–2023", "3-5-2", "possession", 84, 70, 50, 68, 72, 80],
  ["Gian Piero Gasperini", "Atalanta", "2016–", "3-4-2-1", "overload", 74, 80, 46, 94, 92, 66],
  ["Maurizio Sarri", "Napoli", "2015–2018", "4-3-3", "possession", 94, 60, 44, 70, 72, 74],
  ["Claudio Ranieri", "Leicester 2016", "2015–2016", "4-4-2", "counter", 52, 84, 60, 46, 68, 90],
  ["Rafael Benítez", "Valencia, Liverpool", "2001–2010", "4-2-3-1", "counter", 64, 82, 56, 54, 70, 86],
  ["Unai Emery", "Sevilla, Villarreal", "2013–", "4-2-3-1", "quick-counter", 70, 84, 54, 66, 76, 80],
  ["Mikel Arteta", "Arsenal", "2019–", "4-3-3", "possession", 88, 68, 46, 76, 80, 78],
  ["Erik ten Hag", "Ajax", "2017–2022", "4-2-3-1", "possession", 86, 70, 48, 74, 82, 76],
  ["Zinedine Zidane", "Real Madrid", "2016–2021", "4-3-3", "quick-counter", 72, 88, 54, 70, 74, 78],
  ["Manuel Pellegrini", "Villarreal, Manchester City", "2004–2016", "4-4-2", "possession", 82, 66, 56, 64, 68, 74],
  ["Marcelo Bielsa", "Chile, Leeds, Argentina", "1990–", "3-4-3", "overload", 78, 74, 44, 92, 96, 64],
  ["Jorge Sampaoli", "Chile 2015, Sevilla", "2012–", "3-4-3", "overload", 76, 76, 46, 90, 94, 62],
  ["Óscar Tabárez", "Uruguay", "2006–2021", "4-4-2", "counter", 62, 74, 60, 52, 66, 88],
  ["José Pekerman", "Colombia", "2012–2018", "4-2-3-1", "possession", 80, 68, 52, 64, 70, 78],
  ["Marcelo Gallardo", "River Plate", "2014–2022", "4-3-3", "quick-counter", 76, 86, 50, 80, 84, 70],
  ["Carlos Bianchi", "Boca Juniors", "1998–2004", "4-3-1-2", "counter", 58, 80, 62, 56, 68, 86],
  ["Alejandro Sabella", "Argentina 2014", "2011–2014", "4-4-2", "counter", 60, 78, 58, 50, 66, 88],
  ["Gerardo Martino", "Barcelona, Argentina", "2013–2016", "4-3-3", "possession", 84, 68, 48, 72, 74, 72],
  ["Fernando Santos", "Portugal 2016", "2014–2022", "4-4-2", "counter", 54, 80, 62, 46, 64, 92],
  ["Giovanni Trapattoni", "Juventus, Italy", "1976–2004", "5-3-2", "long-ball-counter", 50, 78, 74, 42, 60, 94],
  ["Enzo Bearzot", "Italy 1982", "1975–1986", "4-4-2", "counter", 64, 76, 58, 56, 66, 86],
  ["Azeglio Vicini", "Italy 1990", "1986–1991", "5-3-2", "counter", 58, 74, 60, 48, 62, 90],
  ["Dino Zoff", "Italy 2000", "1998–2000", "4-4-2", "counter", 60, 74, 58, 50, 64, 88],
  ["Cesare Prandelli", "Italy", "2010–2014", "4-3-1-2", "possession", 78, 68, 52, 62, 70, 78],
  ["Gareth Southgate", "England", "2016–2024", "3-5-2", "counter", 66, 76, 56, 54, 68, 86],
  ["Sven-Göran Eriksson", "Lazio, England", "1997–2006", "4-4-2", "possession", 80, 66, 56, 58, 64, 80],
  ["Bobby Robson", "Ipswich, England, Sporting", "1969–2004", "4-4-2", "quick-counter", 70, 82, 54, 68, 76, 76],
  ["Terry Venables", "England 1996", "1994–1996", "4-3-1-2", "possession", 82, 70, 50, 66, 72, 76],
  ["Glenn Hoddle", "England", "1996–1999", "3-5-2", "possession", 80, 66, 52, 60, 66, 78],
  ["Otto Rehhagel", "Greece 2004", "2001–2010", "5-4-1", "counter", 44, 76, 68, 38, 58, 97],
  ["Lars Lagerbäck", "Sweden, Iceland", "2000–2016", "4-4-2", "long-ball-counter", 52, 74, 76, 44, 60, 88],
  ["Morten Olsen", "Denmark", "2000–2015", "4-3-3", "possession", 84, 66, 48, 68, 72, 74],
  ["Kasper Hjulmand", "Denmark", "2020–2024", "3-4-3", "quick-counter", 74, 84, 50, 78, 82, 72],
  ["Roberto Martínez", "Belgium", "2016–2022", "3-4-2-1", "possession", 86, 68, 48, 70, 72, 74],
  ["Marc Wilmots", "Belgium 2014", "2012–2016", "4-2-3-1", "quick-counter", 70, 84, 52, 72, 78, 72],
  ["Guy Thys", "Belgium 1986", "1976–1989", "4-4-2", "counter", 62, 76, 58, 58, 68, 80],
  ["Raymond Goethals", "Marseille", "1990–1993", "5-3-2", "counter", 54, 76, 64, 46, 62, 90],
  ["Michel Hidalgo", "France 1984", "1976–1984", "4-3-3", "possession", 86, 68, 48, 74, 74, 70],
  ["Roger Lemerre", "France 2000", "1998–2002", "4-2-3-1", "possession", 82, 70, 52, 66, 72, 78],
  ["Laurent Blanc", "France", "2010–2012", "4-3-3", "possession", 80, 68, 50, 64, 70, 78],
  ["Bert van Marwijk", "Netherlands 2010", "2008–2012", "4-2-3-1", "quick-counter", 68, 86, 54, 70, 78, 78],
  ["Guus Hiddink", "PSV, South Korea, Chelsea", "1987–2010", "4-4-2", "quick-counter", 66, 86, 56, 68, 76, 76],
  ["Dick Advocaat", "PSV, Zenit, Rangers", "1994–", "4-3-3", "quick-counter", 68, 84, 54, 70, 76, 74],
  ["Ralf Rangnick", "Leipzig, Austria", "2012–", "4-2-2-2", "overload", 72, 80, 46, 92, 95, 70],
  ["Julian Nagelsmann", "Leipzig, Bayern", "2016–", "3-4-2-1", "possession", 86, 74, 48, 80, 84, 74],
  ["Xabi Alonso", "Bayer Leverkusen", "2022–", "3-4-2-1", "possession", 88, 72, 46, 78, 80, 76],
  ["Oliver Glasner", "Frankfurt, Crystal Palace", "2021–", "3-4-2-1", "quick-counter", 70, 88, 50, 76, 84, 76],
  ["Niko Kovač", "Eintracht Frankfurt", "2016–2018", "4-2-3-1", "counter", 62, 82, 58, 58, 72, 84],
  ["Jupp Derwall", "West Germany 1980", "1978–1984", "4-2-4", "out-wide", 74, 72, 54, 82, 74, 68],
  ["Berti Vogts", "Germany 1996", "1990–1998", "5-3-2", "counter", 56, 74, 62, 48, 66, 90],
  ["Jürgen Klinsmann", "Germany 2006, USA", "2004–2016", "4-2-3-1", "overload", 74, 78, 50, 84, 88, 66],
  ["Javier Clemente", "Athletic, Spain", "1981–1998", "4-4-2", "long-ball", 48, 66, 88, 52, 70, 82],
  ["Javier Irureta", "Deportivo La Coruña", "1998–2005", "4-2-3-1", "possession", 84, 66, 52, 64, 68, 76],
  ["Ernesto Valverde", "Athletic, Barcelona", "2013–", "4-4-2", "possession", 82, 68, 54, 62, 72, 80],
  ["Quique Setién", "Barcelona", "2020", "4-3-3", "possession", 93, 56, 42, 66, 68, 72],
  ["Luis de la Fuente", "Spain 2024", "2022–", "4-3-3", "possession", 88, 70, 48, 74, 78, 76],
  ["Julen Lopetegui", "Spain, Wolves", "2018–", "4-3-3", "possession", 84, 66, 50, 66, 70, 78],
  ["Mircea Lucescu", "Shakhtar Donetsk", "2004–2016", "4-1-4-1", "quick-counter", 66, 86, 54, 68, 78, 80],
  ["Stanislav Cherchesov", "Russia 2018", "2016–2021", "5-3-2", "counter", 50, 76, 66, 42, 62, 94],
  ["Stephen Keshi", "Nigeria 2013", "2011–2014", "4-2-3-1", "counter", 58, 78, 60, 54, 68, 84],
  ["Hervé Renard", "Zambia, Morocco, Saudi Arabia", "2011–", "4-4-2", "counter", 56, 78, 62, 50, 66, 86],
  ["Walid Regragui", "Morocco 2022", "2022–", "4-1-4-1", "counter", 54, 82, 58, 52, 72, 92],
  ["Vahid Halilhodžić", "Algeria, Japan, Morocco", "2011–2022", "4-2-3-1", "counter", 56, 80, 62, 50, 68, 88],
  ["Djamel Belmadi", "Algeria 2019", "2018–2024", "4-2-3-1", "quick-counter", 68, 84, 54, 66, 76, 78],
  ["Aliou Cissé", "Senegal", "2015–2024", "4-3-3", "counter", 60, 80, 56, 58, 72, 84],
  ["Bruno Metsu", "Senegal 2002", "2000–2002", "4-4-2", "counter", 58, 78, 60, 56, 70, 84],
  ["Milovan Rajevac", "Ghana 2010", "2008–2010", "4-4-2", "long-ball-counter", 46, 74, 78, 40, 58, 94],
  ["Pitso Mosimane", "Mamelodi Sundowns, Al Ahly", "2012–", "4-2-3-1", "quick-counter", 70, 84, 52, 72, 80, 76],
  ["Philippe Troussier", "Japan, South Africa", "1998–2004", "3-5-2", "possession", 80, 68, 50, 70, 74, 72],
  ["Takeshi Okada", "Japan", "2007–2010", "4-2-3-1", "counter", 64, 78, 58, 56, 68, 84],
  ["Akira Nishino", "Japan 2018", "2018", "4-2-3-1", "quick-counter", 68, 84, 54, 66, 76, 76],
  ["Hajime Moriyasu", "Japan", "2018–", "4-2-3-1", "quick-counter", 72, 88, 50, 74, 82, 74],
  ["Zico", "Japan", "2002–2006", "4-3-3", "possession", 86, 70, 48, 76, 76, 68],
  ["Park Hang-seo", "Vietnam", "2017–2022", "3-5-2", "counter", 54, 80, 60, 52, 70, 90],
  ["Ange Postecoglou", "Australia, Celtic, Spurs", "2013–", "4-3-3", "out-wide", 80, 74, 46, 88, 84, 64],
  ["Graham Arnold", "Australia", "2018–2024", "4-2-3-1", "counter", 62, 76, 60, 54, 68, 82],
  ["Bora Milutinović", "Mexico, USA, Nigeria, China", "1983–2002", "4-4-2", "counter", 58, 76, 62, 52, 66, 86],
  ["Javier Aguirre", "Mexico", "2001–", "4-4-2", "counter", 56, 78, 64, 50, 68, 86],
  ["Miguel Herrera", "Mexico", "2013–2015", "5-3-2", "long-ball-counter", 48, 76, 76, 46, 66, 90],
  ["Juan Carlos Osorio", "Mexico", "2015–2018", "4-3-3", "possession", 78, 70, 52, 68, 74, 72],
  ["Manuel Lapuente", "Mexico 1998", "1997–2000", "5-3-2", "counter", 54, 74, 64, 48, 62, 88],
  ["Bruce Arena", "United States", "1998–2017", "4-4-2", "counter", 60, 76, 62, 54, 68, 82],
  ["Bob Bradley", "United States", "2006–2011", "4-4-2", "counter", 58, 74, 64, 52, 66, 84],
  ["Gregg Berhalter", "United States", "2018–", "4-3-3", "possession", 80, 68, 50, 66, 72, 74],
  ["Reinaldo Rueda", "Honduras, Chile, Colombia", "2007–2022", "4-4-2", "counter", 58, 74, 62, 50, 64, 86],
  ["Francisco Maturana", "Colombia 1990", "1987–1994", "4-4-2", "possession", 82, 68, 52, 66, 72, 72],
  ["Gustavo Alfaro", "Ecuador", "2020–2023", "4-4-2", "counter", 54, 78, 64, 48, 66, 90],
  ["Hernán Darío Gómez", "Colombia, Ecuador, Panama", "1995–2018", "4-4-2", "counter", 56, 74, 64, 50, 64, 86],
  ["Néstor Lorenzo", "Colombia", "2022–", "4-2-3-1", "possession", 80, 72, 52, 66, 74, 76],
  ["Daniel Passarella", "Argentina", "1994–1998", "4-4-2", "counter", 58, 76, 62, 52, 68, 86],
  ["Diego Maradona", "Argentina 2010", "2008–2010", "4-3-3", "out-wide", 70, 74, 56, 84, 72, 58],
  ["Vittorio Pozzo", "Italy 1934 and 1938", "1929–1948", "3-5-2", "long-ball", 52, 64, 84, 58, 66, 80],
  ["Ferruccio Valcareggi", "Italy 1970", "1966–1974", "5-3-2", "counter", 50, 74, 66, 44, 60, 92],
  ["Cesare Maldini", "Italy 1998", "1996–1998", "4-4-2", "counter", 56, 72, 62, 46, 60, 90],
  ["Tite", "Brazil", "2016–2022", "4-1-4-1", "possession", 82, 70, 52, 62, 72, 84],
  ["Dunga", "Brazil", "2006–2010", "4-2-3-1", "counter", 54, 80, 60, 48, 66, 90],
  ["Carlos Queiroz", "Portugal, Iran, Colombia", "2008–2022", "4-2-3-1", "counter", 62, 78, 58, 52, 68, 88],
  ["Fernando Diniz", "Fluminense", "2023", "4-2-3-1", "possession", 94, 58, 40, 70, 68, 66],
  ["André Villas-Boas", "Porto 2011", "2010–2011", "4-3-3", "overload", 76, 80, 48, 86, 88, 70],
  ["Jorge Jesus", "Benfica", "2009–2020", "4-4-2", "out-wide", 72, 76, 56, 82, 78, 68],
  ["Alberto Zaccheroni", "Milan, Japan", "1998–2014", "3-4-3", "counter", 64, 78, 58, 66, 72, 80],
  ["Sepp Herberger", "West Germany 1954", "1936–1964", "4-2-4", "long-ball", 48, 66, 86, 60, 68, 74],
  ["Felix Magath", "Bayern, Wolfsburg", "2004–2009", "4-4-2", "quick-counter", 62, 84, 60, 64, 80, 78],
  ["Edin Terzić", "Borussia Dortmund", "2022–2024", "4-2-3-1", "quick-counter", 70, 86, 52, 74, 82, 72],
  ["Stuart Baxter", "South Africa", "2017–2019", "4-2-3-1", "counter", 58, 74, 62, 50, 64, 86],
  ["Clive Barker", "South Africa 1996", "1994–1997", "4-4-2", "long-ball-counter", 52, 72, 76, 48, 64, 84],
  ["Huh Jung-moo", "South Korea", "2008–2010", "4-4-2", "counter", 58, 76, 62, 54, 68, 82],
  ["Hong Myung-bo", "South Korea 2014", "2013–2014", "4-2-3-1", "counter", 60, 78, 58, 56, 70, 84],
  ["Pim Verbeek", "Australia 2010", "2007–2010", "4-2-3-1", "long-ball-counter", 48, 72, 78, 42, 58, 92],
];

export const COACHES: Coach[] = RAW.map(([name, known, years, formation, play, possession, quickCounter, longBall, overload, pressing, compactness]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  name,
  known,
  years,
  formation,
  play,
  stats: { possession, quickCounter, longBall, overload, pressing, compactness },
}));

export function drawCoaches(count: number, exclude: string[] = []): Coach[] {
  const blocked = new Set(exclude);
  const bag = COACHES.filter((coach) => !blocked.has(coach.id));
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = bag[i]!;
    bag[i] = bag[j]!;
    bag[j] = swap;
  }
  const picked: Coach[] = [];
  const styles = new Set<string>();
  for (const coach of bag) {
    if (picked.length >= count) break;
    if (styles.has(coach.play)) continue;
    picked.push(coach);
    styles.add(coach.play);
  }
  for (const coach of bag) {
    if (picked.length >= count) break;
    if (!picked.includes(coach)) picked.push(coach);
  }
  return picked;
}

export function coachById(id: string | null | undefined): Coach | undefined {
  if (!id) return undefined;
  return COACHES.find((coach) => coach.id === id);
}

export function styleForCoach(play: CoachPlay): StyleId {
  if (play === "possession") return "balanced";
  if (play === "quick-counter" || play === "long-ball-counter" || play === "counter") return "counter";
  if (play === "long-ball" || play === "out-wide") return "attacking";
  return "press";
}

export function coachBoost(coach: Coach): { att: number; def: number } {
  const s = coach.stats;
  const att =
    (s.overload - 70) * 0.04 +
    (s.quickCounter - 70) * 0.025 +
    (s.possession - 70) * 0.012 +
    (coach.play === "long-ball" ? 0.7 : 0);
  const def =
    (s.compactness - 70) * 0.045 +
    (s.pressing > 82 ? -0.5 : 0.25) +
    (coach.play === "counter" || coach.play === "long-ball-counter" ? 0.6 : 0);
  const clip = (n: number) => Math.max(-2.4, Math.min(3, n));
  return { att: clip(att), def: clip(def) };
}
