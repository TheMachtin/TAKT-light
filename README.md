# TAKT light

Schlanke Fassung des [Schichtrechners](https://github.com/TheMachtin/Schichtrechner):
eine Zahl – der Leistungsgrad im Akkord – und die Arbeitszeiten, aus denen sie
entsteht. Läuft als installierbare Web-App (PWA) offline auf dem Handy.

## Was drin ist

**Reiter „Akkord“** – die Startseite und im Normalfall die einzige, die man braucht.

* Leistungsgrad in Prozent, ampelfarbig: ab 100 % grün, ab 90 % gelb, darunter rot
* darunter die Rechengrundlage (gearbeitete gegen erarbeitete Zeit) und der
  Vorsprung bzw. Rückstand in Minuten
* der **Rechenweg**: die Formel mit genau den Zahlen, die gerade in den Feldern
  stehen – Schritt für Schritt nachrechenbar. Wer ihn zuklappt, findet ihn beim
  nächsten Start zugeklappt vor.
* Start, „Bis“, Stückzeit und die fertigen Stück – letztere mit großen Tasten,
  die sich auch mit Handschuhen treffen lassen
* zwei Knöpfe, die die eingestellten Schichtzeiten übernehmen

**Reiter „Arbeitszeit“** – einmal einstellen, dann in Ruhe lassen.

* Früh- und Spätschicht mit Beginn, Ende, Hauptpause und verkürztem Freitag
* beliebig viele bezahlte Kurzpausen
* Anleitung

## Was gegenüber TAKT fehlt

Bewusst weggelassen, damit die App eine Aufgabe hat und nicht fünf:

* kein Reiter „Details“ – kein Tagessoll, keine Hochrechnung, keine Auftragsplanung
* keine verbuchten Aufträge, kein Verlauf über die Tage
* nur Deutsch
* **keine automatische Startzeit.** Die App rät nicht, wann die Schicht begonnen
  hat, und verstellt den Start auch nicht im Hintergrund. Einzige Automatik ist
  das Feld „Bis“: es hängt an der Uhr, bis man eine feste Zeit einträgt.

## So wird gerechnet

```
Leistungsgrad = Stück × Stückzeit ÷ gearbeitete Zeit × 100
gearbeitete Zeit = (Bis − Start) − Pausen dazwischen
```

Abgezogen werden die Hauptpause und alle bezahlten Kurzpausen, die ins
Zeitfenster der gewählten Schicht fallen – für den Akkord zählt nur, wann nicht
produziert wird. Eine gerade laufende Pause wird anteilig angerechnet, damit der
Leistungsgrad während der Pause nicht einbricht und danach wieder springt.
Überlappende Pausen zählen einmal.

Beispiel: 05:48 bis 09:00 sind 192 Minuten, minus 5 Minuten Kurzpause bleiben
187. Bei 30 Stück à 6,15 min sind 184,5 Minuten erarbeitet – also 98,7 %.
Genau diese Rechnung steht in der App unter der großen Zahl.

**Pausen vor dem Start zählen nicht.** Wer um 12:00 einsteigt, hat die Pause um
11:30 nicht gehabt – sie darf ihm also auch nicht von der Arbeitszeit abgezogen
werden. Der Schichtrechner zieht die Hauptpause an dieser Stelle trotzdem ab und
zeigt bei spätem Einstieg einen um rund 30 % zu hohen Leistungsgrad.

## Geprüft

Die Prozentrechnung ist gegen eine unabhängig geschriebene Referenzrechnung
geprüft, mit Chromium über Playwright:

* 22 Szenarien über beide Schichten, pünktlichen und verspäteten Einstieg,
  laufende Pausen, Überstunden und krumme Stückzeiten – alle deckungsgleich
  mit der Referenz
* die Frühschicht Minute für Minute (492 Minuten einzeln nachgerechnet)
* wer genau in der Vorgabezeit arbeitet, liest in jeder einzelnen Minute
  100,0 % – auch während und nach den Pausen
* ein Stück zu wenig bleibt immer unter 100 %
* der Leistungsgrad steigt nie von allein, steht während der Pausen still und
  läuft danach ohne Nachholsprung weiter
* der angezeigte Rechenweg ergibt in 93 Kombinationen genau die angezeigte
  Prozentzahl

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | die ganze App: Aufbau, Gestaltung und Rechnung in einer Datei |
| `service-worker.js` | Offline-Betrieb und das Update-Band |
| `manifest.json` | Name, Farben und Symbole für die Installation |
| `icon-*.png`, `apple-touch-icon.png` | App-Symbole |

## Betrieb

Statische Dateien, kein Build und keine Abhängigkeiten. Zum Ausprobieren genügt

```sh
python3 -m http.server 8000
```

und `http://localhost:8000` im Browser; veröffentlicht wird über GitHub Pages
(Einstellungen → Pages → Branch `main`). Ein Service Worker braucht HTTPS oder
`localhost` – über `file://` bleibt die App ohne Offline-Betrieb, rechnet aber.

Alle Eingaben liegen im `localStorage` des Geräts unter dem Namensraum
`takt-light.` – getrennt von TAKT, beide können nebeneinander auf demselben
Gerät liegen. Die Stückzahl gehört zu einem Tag und beginnt am nächsten wieder
bei null; Zeiten und Einstellungen bleiben stehen.

## Veröffentlichen einer neuen Fassung

`VERSION` in `index.html` und `SPEICHERSTAND` in `service-worker.js` gemeinsam
hochzählen. Sonst bleibt der alte Stand im Speicher des Browsers liegen und die
neue Fassung kommt nie an. Umgeschaltet wird erst, wenn jemand auf das grüne
Band tippt – damit mitten in der Schicht keine Eingabe verloren geht.
