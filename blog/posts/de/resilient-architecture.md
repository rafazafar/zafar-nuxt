---
title: "Was passiert, wenn eine Abhängigkeit ausfällt?"
description: "Circuit Breaker, getrennte Ressourcen und geplante Fallbacks begrenzen die Folgen eines Ausfalls."
date: 2025-10-15
image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800"
minRead: 2
tags:
  - Resilienz
  - Zuverlässigkeit
  - Architektur
  - DevOps
---

Wenn ein Dienst ausfällt, interessiert mich zuerst, was ein Nutzer noch tun kann. Wartet die Anwendung unbegrenzt? Wiederholt sie den gleichen Fehler? Oder kann sie mit eingeschränkter Funktion weiterarbeiten?

Diese Fragen machen Zuverlässigkeit für mich konkret. Die folgenden Muster helfen, die Antworten im Voraus festzulegen.

## Aufrufe bei wiederholten Fehlern stoppen

Ein Circuit Breaker unterbricht Aufrufe an einen fehlerhaften Dienst vorübergehend. Lege die Schwelle anhand beobachteter Fehlerraten fest. Ein Half-Open-Zustand erlaubt später einzelne Versuche, um die Erholung zu prüfen.

Der Aufrufer braucht währenddessen einen Fallback oder eine sichtbare Fehlermeldung.

<figure class="concept concept--flow">
<div class="concept-title">Ein Circuit Breaker prüft die Erholung</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 17v4 M9 12v9 M15 7v14 M21 2v19"/></svg><strong>Closed</strong><span>Anfragen werden zugelassen.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4v16 M17 4v16"/></svg><strong>Open</strong><span>Nach der Fehlerschwelle stoppen.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 7a9 9 0 0 0-16 3 M4 3v7h7 M4 17a9 9 0 0 0 16-3 M20 21v-7h-7"/></svg><strong>Half-open</strong><span>Mit wenigen Aufrufen prüfen.</span></li>
</ol>
<figcaption>Nach dem Test: bei Erfolg schließen, bei Fehlern wieder öffnen. Währenddessen einen Fallback anbieten.</figcaption>
</figure>

## Ressourcen voneinander trennen

Bulkheads heißen nach den Schotten eines Schiffes. In einer Anwendung sollen sie verhindern, dass ein Fehler alle verfügbaren Ressourcen belegt.

Dazu eignen sich getrennte Thread-Pools für kritische und weniger kritische Aufgaben, isolierte Ressourcen für verschiedene Dienste und Limits pro Mandant oder Endpunkt.

## Warten und Wiederholen begrenzen

Jeder externe Aufruf braucht ein Zeitlimit. Für Wiederholungen helfen exponentielles Backoff und Jitter, damit Clients nicht gleichzeitig erneut anfragen.

Prüfe vor einem Retry, ob die Operation idempotent ist. Wiederhole Clientfehler nicht blind; der konkrete Fehler und der API-Vertrag müssen einen weiteren Versuch rechtfertigen.

## Den Fallback bewusst wählen

Ein Produktkatalog kann auch ohne Empfehlungen weiterarbeiten. Analytics können ältere Daten mit dem Zeitpunkt der letzten Aktualisierung zeigen. Fällt das Fraud-Scoring aus, können Bestellungen in eine manuelle Prüfung gehen, sofern dieser Ablauf vereinbart ist.

Solche Entscheidungen betreffen den Betrieb und die Nutzer. Sie gehören vor den Ausfall.

## Die Fehlerpfade testen

Chaos Engineering führt Fehler absichtlich herbei. Chaos Monkey kann beispielsweise Instanzen beenden. Damit lässt sich beobachten, ob die Anwendung den Ausfall wie vorgesehen behandelt.

Lasttests zeigen Belastungsgrenzen, prüfen Auto-Scaling-Regeln, decken Ressourcenlecks auf und helfen, die Schwellen des Circuit Breakers zu prüfen.

Ein Muster im Architekturdiagramm ist noch kein Nachweis. Erst der Test zeigt, welche Funktion bei einem Ausfall verfügbar bleibt und wie die Anwendung zurückkehrt.
