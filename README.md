# PAEZ Hub in VS Code

## Run the preview

1. Extract the ZIP and open the folder containing dev.cjs in VS Code.
2. Open Terminal > New Terminal. Use Node.js 22 or newer.
3. Run node dev.cjs and open the printed URL, normally http://127.0.0.1:3000.
4. Leave the terminal running while you edit. Press Ctrl+C when you're done.

The project bundles React, Babel, and Tailwind. You can start the preview without npm install or Vite.

## Edit the project

| File | What to edit |
| --- | --- |
| tailwind.css | Tailwind utilities grouped with @apply, fonts, gradients, layout, and visual states |
| src/screens/264-16.jsx | Login layout and text |
| src/screens/264-257.jsx | Student dashboard layout and text |
| src/screens/ | Other React screen and dialog layouts |
| src/portal.jsx | Button behavior, forms, and shared UI |
| src/design-data.js | Prototype click destinations |
| src/frames.json | List of screens and their Figma IDs |
| assets/ | Local images and fonts |

To change a design detail, find the element in its .jsx file, copy its className, then search for the matching selector in tailwind.css. For example, the login header is .screen-264-16-header. Save your change and the preview reloads. The demo returns to Login after a reload.

dev.cjs compiles both JSX and Tailwind when the preview starts or the source changes. tailwind-compiler.cjs connects that server to the bundled Tailwind compiler. The server sends compiled CSS to the browser through the stylesheet link in index.html. Edit the source tailwind.css in VS Code.

The portal is a frontend demo. Account, exam, enrollment, and submission actions are simulated. School hub integration and module files are pending.
