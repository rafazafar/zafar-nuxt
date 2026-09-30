---
title: "Was ich in sieben Jahren über Skalierung gelernt habe"
description: "Klare Modulgrenzen, beobachtete Datenbanklast und Systeme, die das Team langfristig warten kann."
date: 2025-12-15
image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800"
minRead: 2
tags:
  - Architektur
  - Systemdesign
  - Skalierung
  - Erfahrungen
---

Früh in meiner Laufbahn habe ich wochenlang Microservices für ein Produkt entworfen, das noch keinen Product-Market-Fit hatte. Heute würde ich diese Zeit zuerst in das Problem der Nutzer stecken.

In sieben Jahren mit Recruiting-Plattformen, Fintech-Produkten und Reise-Apps habe ich Systeme von Hunderten auf Hunderttausende Nutzer wachsen sehen. Dabei wurde mir immer deutlicher, wie teuer unnötige Komplexität später wird.

## Einfach anfangen, Grenzen bewusst ziehen

Ich beginne gern mit einem Monolithen und klar abgegrenzten Modulen. So kann das Team am Produkt arbeiten, ohne sofort mehrere Dienste betreiben zu müssen. Wenn ein Modul später einen eigenen Dienst braucht, erleichtert die Grenze die Trennung.

Für Wachstum zu planen heißt nicht, jede spätere Komponente schon heute zu bauen.

## Die Datenbank früh beobachten

In meinen Projekten wurde die Datenbank wiederholt zum Engpass. Zusätzliche Anwendungsinstanzen waren oft leichter bereitzustellen als zusätzliche Datenbankkapazität.

Reporting-Abfragen sollten die Hauptanwendung nicht ausbremsen. Wenn Analytics zum Produkt gehört, plane ich Leserepliken früh ein. Für viele leselastige Anwendungen hat sich bei mir ein Cache mit TTL und Aktualisierung im Hintergrund bewährt. Redis allein beantwortet noch nicht, wann Daten veralten dürfen.

Auch Verbindungspools brauchen Überwachung. Ich habe Produktionsausfälle erlebt, weil keine Verbindungen mehr frei waren.

<figure class="concept concept--split">
<div class="concept-title">Datenbanklast getrennt betrachten</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0"/></svg><strong>Reporting</strong><span>Leserepliken für Analytics.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18 M12 7v5l4 2"/></svg><strong>Wiederholte Abfragen</strong><span>Cache mit Ablaufregeln.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17v4 M9 12v9 M15 7v14 M21 2v19"/></svg><strong>Verbindungen</strong><span>Pool und Grenzen beobachten.</span></li>
</ol>
<figcaption>Jede Maßnahme löst ein anderes Problem. Entscheidend ist die tatsächliche Last.</figcaption>
</figure>

## Prüfen, welche Arbeit warten kann

Starke Konsistenz hat Kosten. Ich frage deshalb bei jeder Operation, ob ihr Ergebnis sofort überall verfügbar sein muss.

Bei Seekers wechselten wir von synchronen API-Aufrufen zu einer ereignisgesteuerten Architektur mit Message Queues. Unsere Antwortzeiten sanken um 40%, und die Zuverlässigkeit stieg. Das war das Ergebnis für unsere Last und unsere Anwendung, keine allgemeine Zusage für jede Queue.

## Die Entscheidung für das Team nachvollziehbar machen

ADRs halten fest, warum wir eine Architektur gewählt haben. Nach sechs Monaten hilft mir diese Begründung oft mehr als die Erinnerung an das damalige Gespräch.

Ich beziehe das Team früh ein. Gerade weniger erfahrene Entwickler sehen manchmal eine einfache Lösung, die andere übersehen. Dokumentation und Runbooks helfen neuen Kollegen, sich im System zurechtzufinden.

Vor einem größeren Start möchte ich drei Ebenen beobachten: Geschäftsergebnisse wie Anmeldungen und Umsatz, Anwendungsverhalten wie Antwortzeiten und Fehlerraten sowie CPU, Speicher und Datenträger-I/O. Ein gesunder Server allein sagt noch nicht, ob Nutzer ihre Aufgabe erledigen können.

Die Systeme, auf die ich am liebsten zurückblicke, haben ihre Aufgabe zuverlässig erfüllt. Das Team konnte sie auch nach meinem Weggang verstehen und warten. Daran messe ich einen guten Entwurf.
