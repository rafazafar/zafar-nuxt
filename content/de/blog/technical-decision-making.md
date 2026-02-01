---
title: "Die Kunst der technischen Entscheidungsfindung"
description: "Wie Senior-Engineering Trade-offs evaluieren und Entscheidungen treffen, die den Test der Zeit bestehen."
image: "/img/blog/decision-making.png"
date: 2025-11-28
tags:
  - Führung
  - Entscheidungsfindung
  - Engineering
  - Best Practices
---

# Die Kunst der technischen Entscheidungsfindung

Wenn sich Ingenieure in ihrer Karriere weiterentwickeln, verändert sich die Natur ihrer Arbeit. Am Anfang geht es darum, Code zu schreiben und technische Probleme zu lösen. Aber mit zunehmender Seniorität kommt dein Impact zunehmend aus Entscheidungen – architektonische Entscheidungen, Technologieauswahlen und Trade-off-Bewertungen, die ganze Teams und Produkte betreffen.

## Entscheidungsframeworks, die tatsächlich funktionieren

Nach Jahren des Treffens (und manchmal Bereuens) technischer Entscheidungen habe ich ein Framework entwickelt, das mir hilft, Optionen systematischer zu bewerten.

### Der 3-Monate-, 1-Jahr-, 3-Jahre-Test

Für jede bedeutende Entscheidung frage ich: Wie wird das in 3 Monaten, 1 Jahr und 3 Jahren aussehen?

- **3 Monate**: Kurzfristiger Schmerz und Lernkurven
- **1 Jahr**: Betrieblicher Overhead und Team-Adoption
- **3 Jahre**: Technische Schulden oder Vorteile, Skalierbarkeit

Diese einfache Übung hat mich vor der Wahl glänzender neuer Technologien bewahrt, die später Probleme verursacht hätten.

### Das Reversibilitätsprinzip

Nicht alle Entscheidungen sind gleich. Jeff Bezos' Framework von Typ-1 (irreversibel) und Typ-2 (reversibel) Entscheidungen lässt sich perfekt auf Engineering übertragen.

**Typ-1-Entscheidungen** (schwer rückgängig zu machen):
- Datenbankmigrationen
- Kernarchitekturentscheidungen
- Vendor-Lock-in-Situationen

**Typ-2-Entscheidungen** (leicht rückgängig zu machen):
- Bibliotheksauswahlen mit ähnlichen Alternativen
- UI-Framework-Auswahlen
- Interne Tools

Bei Typ-2-Entscheidungen optimiere ich für Geschwindigkeit und Lernen. Verbringe keine Wochen mit der Evaluierung von React vs. Vue, wenn beides funktionieren würde. Wähle eines aus und shippe.

## Häufige Entscheidungsfallen

### Der „Google macht es“-Fehlschluss

Ich bin in diese Falle getappt. „Netflix verwendet Microservices, also sollten wir das auch.“ Nein. Netflix hat Tausende von Ingenieuren. Du bist ein Team von fünf. Die Rahmenbedingungen sind anders, also ist auch die optimale Lösung anders.

### Analyse-Paralyse

Irgendwann ist mehr Forschung nur noch Prokrastination. Ich habe gelernt, mir selbst eine „Entscheidungsfrist" zu setzen. Nach diesem Datum treffe ich die beste Entscheidung mit verfügbaren Informationen.

### Das Team ignorieren

Die beste technische Entscheidung ist wertlos, wenn dein Team sie nicht umsetzen kann. Ich habe gelernt, Entscheidungen basierend auf zu bewerten:
- Aktuelles Team-Know-how
- Lernkurve und Dokumentation
- Hiring-Auswirkungen (können wir Leute finden, die das können?)

## Fazit

Technische Entscheidungsfindung ist eine Fähigkeit, die durch Übung und Reflexion verbessert wird. Das Ziel ist nicht, perfekt zu sein – es ist, bewusst zu sein, aus Fehlern zu lernen und im Laufe der Zeit organisationales Wissen aufzubauen.

Wie gehst du mit technischen Entscheidungen um? Ich würde gerne deine Frameworks und gelernten Lektionen hören.
