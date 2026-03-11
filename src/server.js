require("dotenv").config();

const { createApp } = require("./app");

function listenWithFallback(app, startPort, maxTries = 10) {
  let port = Number(startPort);
  if (!Number.isInteger(port) || port <= 0) port = 3000;

  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE" && maxTries > 0) {
      // eslint-disable-next-line no-console
      console.warn(`Port ${port} is in use. Trying ${port + 1}...`);
      server.close(() => listenWithFallback(app, port + 1, maxTries - 1));
      return;
    }
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}

async function main() {
  const port = Number(process.env.PORT || 3000);
  const app = createApp();
  listenWithFallback(app, port);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});