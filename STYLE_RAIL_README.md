# Style-Rail Integration (Screen 3)

## Ziel
Screen 3 („Style wählen“) nutzt die hierarchische Style-Auswahl aus `presets.json` (Rail + Breadcrumbs),
ähnlich `style_index.html`, aber als **modulares** Widget.

## Dateien
- `styleRail.js` – eigenständige Rail-Komponente (`window.createStyleRail`)
- `styleRail.css` – Styles nur für die Rail (keine Änderungen an `styles.css`)
- `app.patched.js` – minimal gepatchte Wizard-App (bindet Rail ein, speichert `state.styleMeta`)
- `index.patched.html` – minimal gepatchtes HTML (bindet `styleRail.css` + `styleRail.js` ein)
- `index.with-rail.html` – Test-Variante, die direkt `app.patched.js` lädt (ohne Umbenennen)

## Einbau (Produktiv)
1) `styleRail.js` + `styleRail.css` in dasselbe Verzeichnis wie `index.html` legen
2) In `index.html` im `<head>` hinzufügen:
   `<link rel="stylesheet" href="./styleRail.css" />`
3) Vor `app.js` hinzufügen:
   `<script src="./styleRail.js"></script>`
4) `app.js` durch den Inhalt von `app.patched.js` ersetzen

## Hinweis
`presets.json` muss unter `./presets.json` erreichbar sein (Rail lädt es per `fetch`).
Bei `file://` funktioniert `fetch` oft nicht – bitte über lokalen Webserver (z.B. VS Code Live Server) öffnen.
