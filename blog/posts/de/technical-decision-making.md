---
title: "Technische Entscheidungen, mit denen das Team arbeiten kann"
description: "Fragen zu Zeit, Umkehrbarkeit und den Menschen, die das Ergebnis betreiben werden."
date: 2025-11-28
image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"
minRead: 2
tags:
  - Führung
  - Entscheidungsfindung
  - Engineering
  - Best Practices
---

Manche technische Entscheidung bereue ich erst lange nach der Einführung. Am Anfang war das Werkzeug interessant und das Beispiel überzeugend. Später musste das Team mit den Folgen arbeiten.

Mit zunehmender Erfahrung besteht ein größerer Teil meiner Arbeit aus solchen Entscheidungen. Ein paar feste Fragen helfen mir, Optionen gründlicher zu prüfen.

## Drei Zeitpunkte betrachten

Bei einer größeren Entscheidung denke ich an drei Monate, ein Jahr und drei Jahre.

<figure class="concept concept--horizon">
<div class="concept-title">Eine Entscheidung, drei Zeitpunkte</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18 M12 7v5l4 2"/></svg><strong>3 Monate</strong><span>Lernen und umstellen.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 3a3 3 0 1 0 0 6 3 3 0 1 0 0-6 M2 21v-4a6 6 0 0 1 12 0v4 M17 4a3 3 0 0 1 0 6 M17 13a5 5 0 0 1 5 5v3"/></svg><strong>1 Jahr</strong><span>Betreiben und im Team nutzen.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 7a9 9 0 0 0-16 3 M4 3v7h7 M4 17a9 9 0 0 0 16-3 M20 21v-7h-7"/></svg><strong>3 Jahre</strong><span>Skalierung, Schulden, Nutzen.</span></li>
</ol>
<figcaption>Neben der Einführung zählt auch der spätere Betrieb.</figcaption>
</figure>

Nach drei Monaten interessieren mich Lernaufwand und Umstellung. Nach einem Jahr frage ich nach Betrieb und Akzeptanz im Team. Nach drei Jahren geht es um Skalierung, technische Schulden und den Nutzen, der geblieben ist.

Diese Fragen haben mich schon davon abgehalten, eine neue Technologie nur deshalb zu wählen, weil ich sie ausprobieren wollte.

## Wie aufwendig wäre der Rückweg?

Jeff Bezos unterscheidet zwischen schwer umkehrbaren Entscheidungen vom Typ 1 und leicht umkehrbaren Entscheidungen vom Typ 2. Das finde ich auch in der Softwareentwicklung hilfreich.

Datenbankmigrationen, grundlegende Architekturentscheidungen und eine starke Bindung an einen Anbieter können schwer rückgängig zu machen sein. Eine austauschbare Bibliothek oder ein internes Werkzeug lässt sich oft leichter ersetzen. Bei einem UI-Framework hängt das stark davon ab, wie viel Code bereits darauf aufbaut.

Wenn React und Vue für ein neues Projekt gleichermaßen passen, bringt ein erster Versuch oft mehr als wochenlanges Vergleichen. Für einen späteren Austausch einer großen Anwendung gilt diese Annahme nicht automatisch.

## Mit den eigenen Bedingungen entscheiden

Ich habe selbst schon mit „Netflix macht das auch“ argumentiert. Doch eine Organisation mit Tausenden Entwicklern hat andere Möglichkeiten als ein Team von fünf Personen.

Prüfe deshalb die vorhandenen Kenntnisse, den Lernaufwand, die Dokumentation und die Chancen, später passende Mitarbeiter zu finden. Das Team muss die Entscheidung umsetzen und das Ergebnis betreiben können.

Recherche braucht außerdem ein Ende. Ich setze mir eine Frist und entscheide dann anhand der verfügbaren Informationen. Sonst wird der nächste Vergleich irgendwann zum Aufschub.

Eine schlechte Entscheidung lässt sich nicht immer vermeiden. Hilfreich ist, ihre Gründe zu verstehen und daraus etwas für die nächste Entscheidung mitzunehmen. So bleibt die Erfahrung auch für andere im Team nutzbar.
