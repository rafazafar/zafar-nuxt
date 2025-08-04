---
title: "Git-Spickzettel: Wichtige Befehle für Entwickler"
description: Eine umfassende Referenzanleitung zu Git-Befehlen und -Workflows für Entwickler aller Erfahrungsstufen, mit Tipps zur Vermeidung häufiger Fehler.
date: 2022-04-23
image: https://images.unsplash.com/photo-1556075798-4825dfaaf498?q=80&w=800
minRead: 5
author:
  name: Zafar
  avatar:
    src: https://r2.zafar.dev/img/profile.jpg
    alt: Zafar
---

## Grundlegende Befehle

- `git init`: Initialisiert ein neues Git-Repository
- `git clone <repository>`: Klont ein vorhandenes Repository
- `git add <file>`: Fügt eine Datei zum Staging-Bereich hinzu
- `git commit -m "<message>"`: Überträgt Änderungen mit einer Nachricht
- `git push`: Pusht Änderungen in das Remote-Repository
- `git pull`: Holt Änderungen aus dem Remote-Repository
- `git status`: Überprüft den Status des Repositorys

## Branching

- `git branch <branch>`: Erstellt einen neuen Branch
- `git checkout <branch>`: Wechselt zu einem anderen Branch
- `git merge <branch>`: Führt einen Branch in den aktuellen Branch zusammen
- `git branch -d <branch>`: Löscht einen Branch

## Andere nützliche Befehle

- `git log`: Zeigt den Commit-Verlauf an
- `git diff`: Zeigt die im Repository vorgenommenen Änderungen an
- `git reset <file>`: Macht das Staging einer Datei rückgängig
- `git stash`: Speichert Änderungen vorübergehend
- `git stash pop`: Stellt die zuletzt zwischengespeicherten Änderungen wieder her

## Grundlegender Workflow

1. Nehmen Sie Änderungen an Ihrem lokalen Repository vor: Erstellen oder bearbeiten Sie Dateien, fügen Sie sie mit `git add` zum Staging-Bereich hinzu und übertragen Sie die Änderungen dann mit `git commit`.
2. Pushen Sie Ihre Änderungen in das Remote-Repository: Verwenden Sie `git push`, um Ihre übertragenen Änderungen an das Remote-Repository zu senden.
3. Aktualisieren Sie Ihr lokales Repository mit Änderungen aus dem Remote-Repository: Verwenden Sie `git pull`, um Änderungen aus dem Remote-Repository abzurufen und in Ihr lokales Repository zusammenzuführen.

## Branching-Workflow

1. Erstellen Sie einen neuen Branch: Verwenden Sie `git branch <branch>`, um einen neuen Branch zu erstellen.
2. Wechseln Sie zum neuen Branch: Verwenden Sie `git checkout <branch>`, um zum neuen Branch zu wechseln.
3. Nehmen Sie Änderungen vor und übertragen Sie sie wie gewohnt.
4. Führen Sie den Branch in den Haupt-Branch zusammen: Wenn Sie bereit sind, die Änderungen aus Ihrem neuen Branch in den Haupt-Branch (normalerweise Master) zu übernehmen, wechseln Sie mit `git checkout <branch>` zurück zum Haupt-Branch und verwenden Sie dann `git merge <branch>`, um die Änderungen aus Ihrem neuen Branch in den Haupt-Branch zusammenzuführen.

## Einen bereits gepushten Commit rückgängig machen

Wenn Sie den ursprünglichen Commit beibehalten, aber nur die von ihm vorgenommenen Änderungen rückgängig machen möchten, können Sie den Befehl `git revert` verwenden, um einen neuen Commit zu erstellen, der die vom ursprünglichen Commit vorgenommenen Änderungen rückgängig macht. Zum Beispiel:

```
git revert <commit-hash>
```

Dadurch wird ein neuer Commit erstellt, der die im ursprünglichen Commit vorgenommenen Änderungen rückgängig macht. Sie können den Revert-Commit dann in das Remote-Repository pushen, um die Änderungen auf dem Remote rückgängig zu machen.

## Häufige Entwicklerfehler bei der Verwendung von Git

### Vergessen, Änderungen zu committen

Es ist wichtig, Ihre Änderungen regelmäßig zu committen, damit Sie einen Überblick über die von Ihnen gemachten Fortschritte haben. Wenn Sie vergessen, Ihre Änderungen zu committen, können Sie Ihre Arbeit verlieren, wenn etwas schief geht.

### Nicht oft genug committen

Auf der anderen Seite ist es auch wichtig, Ihre Änderungen oft genug zu committen, damit Sie nicht zu viele Änderungen in einem einzigen Commit haben. Große Commits können schwieriger zu überprüfen und zu beheben sein, wenn es Probleme gibt.

Versuchen Sie, mindestens einmal pro Stunde zu committen.

### Kein Branching

Es ist eine gute Idee, Branches zu verwenden, wenn Sie an neuen Funktionen arbeiten oder wesentliche Änderungen an Ihrer Codebasis vornehmen. Dies hilft, Ihren Haupt-Branch (normalerweise Master) stabil zu halten und ermöglicht es Ihnen, gleichzeitig an mehreren Funktionen zu arbeiten.

### Den Haupt-Branch nicht sauber halten

Es ist wichtig, Ihren Haupt-Branch (normalerweise Master) sauber zu halten und nur gut getesteten Code aufzunehmen. Dies erleichtert das Zurücksetzen von Änderungen bei Bedarf und verringert das Risiko, Fehler in Ihre Codebasis einzuführen.

### Änderungen vor dem Zusammenführen nicht überprüfen

Es ist eine gute Idee, Änderungen vor dem Zusammenführen in den Haupt-Branch zu überprüfen, insbesondere wenn Sie mit einem Team arbeiten. Dies hilft sicherzustellen, dass der Code von hoher Qualität ist und keine Probleme verursacht.