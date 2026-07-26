// Point d'entrée pour l'hébergement mutualisé (cPanel > Setup Node.js App).
// cPanel/Passenger exécute ce fichier et fournit le port d'écoute via process.env.PORT.
// L'application doit avoir été construite au préalable avec `npm run build`.

const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Application prête sur le port ${port}`);
  });
});
