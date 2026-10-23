const express = require("express");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const TOKEN = process.env.API_TOKEN || "test-token";

app.use(express.json({ limit: "100kb" }));

// Convert malformed JSON errors into a predictable JSON response.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Malformed JSON body"
    });
  }
  return next(err);
});

let items = [{ id: 1, name: "Sample item", description: "Seed record" }];
let nextId = 2;

function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "Bearer token required" });
  }
  if (header.slice(7) !== TOKEN) {
    return res.status(403).json({ error: "Forbidden", message: "Invalid token" });
  }
  return next();
}

function validateItem(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Bad Request", message: "JSON object required" });
  }
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return res.status(400).json({ error: "Validation Error", message: "name must be a non-empty string" });
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    return res.status(400).json({ error: "Validation Error", message: "description must be a string" });
  }
  return next();
}

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.get("/api/items", requireAuth, (req, res) => {
  res.status(200).json({ data: items, count: items.length });
});

app.get("/api/items/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Bad Request", message: "id must be a positive integer" });
  }
  const item = items.find((entry) => entry.id === id);
  if (!item) return res.status(404).json({ error: "Not Found", message: "Item not found" });
  return res.status(200).json({ data: item });
});

app.post("/api/items", requireAuth, validateItem, (req, res) => {
  const item = {
    id: nextId++,
    name: req.body.name.trim(),
    description: req.body.description === undefined ? "" : req.body.description
  };
  items.push(item);
  return res.status(201).json({ data: item, message: "Item created" });
});

app.put("/api/items/:id", requireAuth, validateItem, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Bad Request", message: "id must be a positive integer" });
  }
  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) return res.status(404).json({ error: "Not Found", message: "Item not found" });
  items[index] = {
    id,
    name: req.body.name.trim(),
    description: req.body.description === undefined ? items[index].description : req.body.description
  };
  return res.status(200).json({ data: items[index], message: "Item updated" });
});

app.delete("/api/items/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Bad Request", message: "id must be a positive integer" });
  }
  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) return res.status(404).json({ error: "Not Found", message: "Item not found" });
  items = items.filter((entry) => entry.id !== id);
  return res.status(200).json({ message: "Item deleted", id });
});

// Final error handler keeps unexpected errors in JSON form.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: "Internal Server Error" });
});

if (require.main === module) {
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Sample REST API listening at http://127.0.0.1:${PORT}`);
  });
}

module.exports = app;
