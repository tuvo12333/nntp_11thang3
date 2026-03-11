const express = require("express");
const morgan = require("morgan");
const path = require("path");

const usersRouter = require("./routes/users");
const rolesRouter = require("./routes/roles");

function createApp() {
  const app = express();

  app.use(morgan("dev"));
  app.use(express.json());

  // UI (static)
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/users", usersRouter);
  app.use("/roles", rolesRouter);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  // error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
      message: err.message || "Internal Server Error",
      details: err.details,
    });
  });

  return app;
}

module.exports = { createApp };


