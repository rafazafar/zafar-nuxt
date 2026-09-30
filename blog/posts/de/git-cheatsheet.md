---
title: "Git-Befehle zum Nachschlagen"
description: "Eine kurze Hilfe für Änderungen, Branches, unfertige Arbeit und das Rückgängigmachen geteilter Commits."
date: 2022-04-23
image: https://images.unsplash.com/photo-1556075798-4825dfaaf498?q=80&w=800
minRead: 2
---

Die meisten Git-Aufgaben folgen einem kurzen Ablauf: Dateien ändern, Änderungen für einen Commit auswählen, den Commit erstellen und ihn teilen. Die Befehle lassen sich leichter einordnen, wenn diese Schritte klar getrennt bleiben.

<figure class="concept concept--flow">
<div class="concept-title">Wohin deine Änderungen gehen</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3h7l5 5v13H7z M14 3v6h5 M10 13h6 M10 17h6"/></svg><strong>Arbeitsdateien</strong><span>Dateien bearbeiten.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12l5 5L20 6"/></svg><strong>Staging</strong><span>Mit git add auswählen.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0"/></svg><strong>Lokale Historie</strong><span>Mit git commit speichern.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9z"/></svg><strong>Remote</strong><span>Mit git push teilen.</span></li>
</ol>
<figcaption>Staging wählt den nächsten Stand aus. Ein lokaler Commit sendet noch nichts an das Remote.</figcaption>
</figure>

## Anfangen und den Zustand prüfen

- `git init`: Ein neues Repository im aktuellen Verzeichnis anlegen.
- `git clone <repository>`: Ein vorhandenes Repository kopieren.
- `git status`: Branch und Dateizustände prüfen.
- `git diff`: Noch nicht gestagte Änderungen an versionierten Dateien ansehen.
- `git log`: Die Commit-Historie lesen.

Vor einem Commit oder Branch-Wechsel lohnt sich der Blick auf den Zustand. Dann ist klar, wo die eigene Arbeit liegt.

## Änderungen speichern und teilen

Mit `git add <file>` wählst du Änderungen für den nächsten Commit aus. `git commit -m "<message>"` speichert sie lokal in der Historie. Erst `git push` überträgt die Commits an das Remote-Repository.

`git pull` holt entfernte Änderungen und integriert sie in den aktuellen Branch. Wie die Integration erfolgt, hängt von Konfiguration und Optionen ab.

Im Alltag heißt das: bearbeiten, stagen, committen und pushen. Hole während der Arbeit auch die Änderungen des Teams in deinen Branch.

## Auf einem Branch arbeiten

- `git branch <branch>`: Einen Branch erstellen.
- `git checkout <branch>`: Zu einem Branch wechseln.
- `git merge <branch>`: Den genannten Branch in den aktuellen Branch übernehmen.
- `git branch -d <branch>`: Einen Branch löschen, sofern die Merge-Prüfungen von Git das erlauben.

Für eine Funktion erstellst du einen Branch und wechselst dorthin. Nach Arbeit, Tests und Review wechselst du zum Hauptbranch zurück und mergst den Feature-Branch.

Bei `git merge` ist wichtig, auf welchem Branch du gerade stehst. Dieser Branch wird geändert.

## Unfertige Arbeit beiseitelegen

`git reset <file>` nimmt Änderungen aus dem Staging-Bereich. Die Arbeitskopie bleibt erhalten. Das hilft, wenn du versehentlich zu viel ausgewählt hast.

`git stash` legt lokale Änderungen vorübergehend ab. `git stash pop` wendet den neuesten Stash an und entfernt ihn, wenn das erfolgreich war. So lässt sich eine Aufgabe unterbrechen, ohne sie schon committen zu müssen.

## Einen geteilten Commit rückgängig machen

`git revert` erstellt einen neuen Commit, der die Änderungen eines früheren Commits umkehrt:

```
git revert <commit-hash>
```

Anschließend kannst du den Revert-Commit pushen. Der ursprüngliche Commit bleibt in der Historie sichtbar, ebenso seine Rücknahme.

## Kleine, verständliche Commits machen

Ohne Commit fehlt ein gespeicherter Stand in der Historie. Ich versuche während der Arbeit mindestens stündlich zu committen. Zugleich sollte ein Commit eine zusammenhängende Änderung beschreiben. Große Pakete erschweren Review und Fehlersuche.

Verwende Branches für Funktionen und größere Änderungen. Prüfe und teste die Arbeit vor dem Merge. Ein stabiler Hauptbranch gibt dem Team einen verlässlichen Ausgangspunkt und erleichtert spätere Rücknahmen.
