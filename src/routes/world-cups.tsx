import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { SITE_URL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/world-cups")({
  component: WorldCupsPage,
  head: () =>
    pageHead({
      title: "World Cups in the Seven Nil draft",
      description:
        "Which national tournaments Seven Nil uses, from Brazil 1958 and 1970 to Argentina 2022, and what each squad is for in the draft.",
      path: "/world-cups",
      schemas: [
        {
          "@type": "Article",
          headline: "World Cups in the Seven Nil draft",
          datePublished: "2026-10-01",
          dateModified: "2026-10-01",
          author: { "@id": `${SITE_URL}/#maker` },
          publisher: { "@id": `${SITE_URL}/#org` },
          mainEntityOfPage: `${SITE_URL}/world-cups`,
        },
      ],
    }),
});

function WorldCupsPage() {
  return (
    <LegalShell title="World Cups in the draft" kicker="Nations and tournament years">
      <p>
        World Cup mode never draws a club. Each roll is one country and one tournament year, almost always a World
        Cup or a European Championship that people still argue about. The card is the players who made that summer
        matter, plus enough of the rest of the squad that a draft can find a full-back and a goalkeeper, not only the
        famous forward.
      </p>
      <p>
        This page is a reading list for those years. It is not a full history of the competition, and it is not
        affiliated with FIFA. Scores and lineups in the game are a simulation on top of these squads.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">The early Brazil sides</h2>
      <p>
        Brazil 1958 is the first side in the archive that made the yellow shirt the default picture of the World Cup.
        Pelé is already the centre of it, with Garrincha wide and Didi organising. Brazil 1970 is the other pole:
        Carlos Alberto, Gérson, Rivelino, Jairzinho, Tostão, and Pelé in the same eleven. Those two years are in the
        draft because a single pick from either of them changes what your attack can be. They are not copies of each
        other. 1958 is a younger Pelé. 1970 is the finished team.
      </p>
      <p>
        Brazil 1982 is the side people still call the best never to win it. Zico, Sócrates, Falcão, and Éder make the
        midfield the point of the card. Brazil 1994 is the champion side that won by being harder to play through:
        Romário and Bebeto up front, Dunga behind them. Brazil 1998 is the finalist side with Ronaldo and Rivaldo,
        rated for that tournament rather than for what Ronaldo became later. Brazil 2002 is the champion side again:
        Ronaldo at the peak of that cup, Rivaldo and Ronaldinho around him, Cafu and Roberto Carlos on the flanks.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Argentina</h2>
      <p>
        Argentina 1978 is the host champion, built around Kempes and a midfield that did not need a single genius.
        Argentina 1986 is the opposite shape: Maradona at 97, and a team that becomes a different side the moment he
        is on your card. Argentina 2014 is the finalist side of Messi, Di María, and Mascherano, still short of the
        trophy. Argentina 2022 is the one that finished it, with Martínez in goal, Enzo Fernández and Mac Allister in
        the middle, and Álvarez as the forward who could start or arrive.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Europe's champions</h2>
      <p>
        England 1966 is the World Cup side: Moore, Charlton, Hurst, Peters. England 1990 is the semi-final side people
        remember for Gascoigne and Lineker, not for a trophy. England 2018 and 2022 are the modern tournaments, with
        Kane as the reference striker and a defence that was the real strength in 2018.
      </p>
      <p>
        Germany 1974 is Beckenbauer, Müller, Maier, and Breitner. The game stores that side as Germany. Germany 1990
        is the late West German champion side, Matthäus at the front of it. Germany 2014 is Neuer, Lahm, Kroos,
        Müller, and a bench that could change a semi-final. The 2002 side is the finalist team, Ballack and Kahn,
        rated for a tournament they reached rather than for a decade of club football.
      </p>
      <p>
        Italy 1982 is Rossi's World Cup after a quiet start. Italy 1994 and 2006 are the Baggio final and the
        Cannavaro final, which ask completely different things of a draft. Italy 2021 is the European Championship
        side: Donnarumma, Chiellini, Barella, Jorginho, Chiesa. Spain 2008 is the Euros side that started the run.
        Spain 2010 is the World Cup. Spain 2012 is the third tournament, Iniesta and Xavi still the centre, the striker
        less certain. France 1984 is Platini's Euros. France 1998 is Zidane's World Cup, with Thuram, Blanc,
        and Deschamps around him, and a younger Henry. France 2006, 2018, and 2022 are three different generations of
        the same shirt.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Sides that bent a bracket</h2>
      <p>
        Netherlands 1974 is Cruyff's finalist side. Netherlands 1988 is the European champion side with Gullit,
        van Basten, and Rijkaard. Netherlands 1998 is Bergkamp, Davids, Overmars, and a young Kluivert. Croatia 1998
        is Šuker's semi-final team. Croatia 2018 and 2022 are Modrić's two deep runs, which the draft treats
        as different squads because the players around him changed.
      </p>
      <p>
        Denmark 1992 is the side that arrived as replacements and won the Euros. Greece 2004 is the other shock
        champion: Zagorakis, Charisteas, and a defence that did not need a star forward. Bulgaria 1994 is Stoichkov
        and a quarter-final. Romania 1994 is Hagi. Nigeria 1994 is Yekini, Okocha, and Amuneke. Cameroon 1990 is Milla
        coming off the bench into a quarter-final. Senegal 2002 and Senegal 2022 are twenty years apart: Bouba Diop's
        side, then Mané and Koulibaly.
      </p>
      <p>
        Morocco 2022 is the first African semi-finalist, and the card is built that way: a defence and a midfield,
        not a collection of forwards. Japan 2022, Korea 2002, the United States in 2022, Mexico in 1986, and Costa
        Rica in 2014 are in the archive for the same reason. A draft that only contains champions becomes a highlight
        reel. A draft that also contains these sides has to solve a left-back from a team that actually had one.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How to use a year when it appears</h2>
      <p>
        If the dice give you a champion attack and you already have two forwards, take the scarce role. Full-backs and
        holding midfielders from 1970, 1998, and 2014 are worth more to an empty formation than a third gold name. If
        the dice give you Greece 2004 or Costa Rica 2014, the value is the goalkeeper and the defenders. Forcing a
        glamour pick out of a defensive side is how a draft ends with no spine.
      </p>
      <p>
        Another cup keeps the country and changes the year. That is the redraw to use when you liked the nation and
        hated the tournament. It still costs one of the five chances. The rating method is on{" "}
        <a className="underline" href="/ratings">
          How a rating is set
        </a>
        . Club years are a separate pool, described in{" "}
        <a className="underline" href="/club-seasons">
          Club seasons
        </a>
        .
      </p>
    </LegalShell>
  );
}
