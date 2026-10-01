import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/seven/legal-shell";
import { SITE_URL, pageHead } from "@/lib/seven/site";

export const Route = createFileRoute("/club-seasons")({
  component: ClubSeasonsPage,
  head: () =>
    pageHead({
      title: "Club seasons in Seven Nil — top five leagues since 1980",
      description:
        "The club draft uses title seasons and famous runs from England, Spain, Italy, Germany, and France, starting in 1980. World Cup squads never appear here.",
      path: "/club-seasons",
      schemas: [
        {
          "@type": "Article",
          headline: "Club seasons in the Seven Nil draft",
          datePublished: "2026-10-01",
          dateModified: "2026-10-01",
          author: { "@id": `${SITE_URL}/#maker` },
          publisher: { "@id": `${SITE_URL}/#org` },
          mainEntityOfPage: `${SITE_URL}/club-seasons`,
        },
      ],
    }),
});

function ClubSeasonsPage() {
  return (
    <LegalShell title="Club seasons from 1980" kicker="England, Spain, Italy, Germany, France">
      <p>
        Club mode is a separate draft. It never pulls a national team. Each roll is one club and one season from the
        top five leagues, starting in 1980. The leagues are the English First Division and then the Premier League,
        La Liga, Serie A, the Bundesliga, and the French first division, later Ligue 1. A European night in the
        simulation is the campaign those clubs play. It is not a licence to use UEFA's competition.
      </p>
      <p>
        The pool prefers seasons people can still name: a title, a cup that rewrote a club, or a side that was the
        best version of itself. Filler squads from mid-table years are left out on purpose. The archive is finite so
        a roll still means something.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">England</h2>
      <p>
        Nottingham Forest 1980 is the European Cup side at the end of Clough's first great run: Shilton,
        Burns, Robertson, Francis. Liverpool 1984 and Liverpool 1988 are the league sides around Hansen, Rush,
        Dalglish, and then Barnes and Aldridge. Liverpool 2005 is the Istanbul squad, rated for that season: Gerrard
        high, the rest of the side human. Liverpool 2019 is the league side with van Dijk and Salah, a different
        card from 2005 even though the club is the same.
      </p>
      <p>
        Manchester United 1994 is Cantona's first title, with Hughes, Kanchelskis, and Giggs. United 1999 and
        2008 are the two later peaks, treble and then Ronaldo and Rooney. Arsenal 1989 is the Anfield title side.
        Arsenal 1998 and Arsenal 2004 are Bergkamp and Henry, then the unbeaten season. Chelsea 2005, 2012, 2017, and
        2021 are four different managers' best league or European years. Leicester 2016 is the title side, Vardy
        and Kanté, kept because a draft of only superclubs would never produce it. Manchester City 2012 is the Agüero
        season. City 2019 and 2023 are the later dominant sides, not the same eleven.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Spain</h2>
      <p>
        Real Madrid 1987 is the Quinta season with Butragueño and Hugo Sánchez. Real Madrid 2002 is Zidane's
        first Champions League year at the club. Real Madrid 2012 is Mourinho's league side. The 2014, 2015,
        2016, and 2017 cards are the Ronaldo, Bale, Benzema, and Modrić years kept apart, because a peak is not one
        blurred season. Real Madrid 2022 is the later European side, Benzema at the centre.
      </p>
      <p>
        Barcelona 1992 is the first Dream Team European Cup. Barcelona 2006 is Ronaldinho and Eto'o, with a young
        Messi still a squad player on that card. Barcelona 2009 and 2011 are the Guardiola league sides. Barcelona
        2015 is the treble. Barcelona 2019 is the last Messi league title of that run, Suárez still beside him.
        Atlético 2014 and 2016 are the Simeone sides, Godín and Griezmann, rated as defensive champions rather than as
        a copy of Madrid. Valencia 2004, Deportivo 2000, and Sevilla's mid-2000s side are there so La Liga is not
        only two clubs.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Italy</h2>
      <p>
        Juventus 1985 is Platini, Rossi, and Scirea. Milan 1989 and 1994 are the Dutch-and-Baresi sides. Milan 2003
        is Kaká and Shevchenko. Milan 2007 is the later European side. Milan 2022 is the recent league side with
        Leão and Tonali, which should not be scored like 1989. Inter 1989 is Matthäus and Klinsmann. Inter 2010 is
        Mourinho's treble. Inter 2021 is the Conte league side, Lukaku and Barella. Napoli 1987 and 1990 are
        Maradona. Napoli 2023 is the later title, a different city team. Roma 1983 is Falcão and Pruzzo. Roma 2001 is
        Totti, Batistuta, and Samuel.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">Germany and France</h2>
      <p>
        Bayern 2001, 2013, 2016, and 2020 are four shapes of the same club: Élber and Effenberg, then the treble with
        Robben and Ribéry, then the 2016 side with Neuer and Lewandowski still in Munich, then the 2020 side. Dortmund
        1997 is the Champions League side. Dortmund 2011 and 2013 are Lewandowski with Kagawa and then with Götze.
        Leverkusen 2024 is the unbeaten league side. Hamburg 1983, Werder 2004, Stuttgart 2007, and Kaiserslautern
        1998 stop the pool being only Bayern.
      </p>
      <p>
        Marseille 1993 is the European Cup side. Monaco 1988 is Hoddle and Hateley. Monaco 2017 is Mbappé's
        breakout league year. Lyon's title years are represented so the 2000s in France are not only Paris. PSG
        1994 and PSG 2021 are the old champion side and the later one, kept separate. Lille 2021 is the title side
        that was not Paris.
      </p>
      <h2 className="mt-4 font-display text-2xl tracking-wide">How a club roll should be read</h2>
      <p>
        Same club, another year, is a different squad. Real Madrid 2014 does not contain the 2017 bench, and Barcelona
        2006 does not contain the 2015 front three at their later numbers. If you wanted the peak attacker and the dice
        gave you an earlier season, Another season spends a redraw and stays on that club. Another club leaves.
      </p>
      <p>
        Friends club rooms use this pool only. A World Cup friends room cannot see these cards, and a club room cannot
        see national teams. The rating rule is the same as in{" "}
        <a className="underline" href="/ratings">
          How a rating is set
        </a>
        : that season, then chemistry, then the manager. National years are on{" "}
        <a className="underline" href="/world-cups">
          World Cups in the draft
        </a>
        .
      </p>
    </LegalShell>
  );
}
