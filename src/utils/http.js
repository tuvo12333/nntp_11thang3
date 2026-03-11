class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function requireFields(body, fields) {
  const missing = fields.filter((f) => body?.[f] === undefined || body?.[f] === null || body?.[f] === "");
  if (missing.length) {
    throw new HttpError(400, "Missing required fields", { missing });
  }
}

function ensureId(id, fieldName = "id") {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    throw new HttpError(400, `Invalid ${fieldName}`);
  }
}

module.exports = { HttpError, requireFields, ensureId };


