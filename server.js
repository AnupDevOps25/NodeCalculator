const http = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.join(__dirname, "public");
const staticFiles = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
  "/calculator.js": {
    file: "calculator.js",
    type: "text/javascript; charset=utf-8",
  },
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

async function handleCalculation(request, response) {
  let input;
  try {
    input = await readJson(request);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: error.message });
    return;
  }

  const { left, operator, right } = input || {};
  const supportedOperators = ["+", "-", "*", "/"];

  if (
    typeof left !== "number" ||
    !Number.isFinite(left) ||
    typeof right !== "number" ||
    !Number.isFinite(right) ||
    !supportedOperators.includes(operator)
  ) {
    sendJson(response, 400, {
      error: "Provide finite numbers and a supported operator (+, -, *, /).",
    });
    return;
  }

  if (operator === "/" && right === 0) {
    sendJson(response, 400, { error: "Cannot divide by zero." });
    return;
  }

  const operations = {
    "+": () => left + right,
    "-": () => left - right,
    "*": () => left * right,
    "/": () => left / right,
  };
  const result = operations[operator]();

  if (!Number.isFinite(result)) {
    sendJson(response, 400, { error: "The result is outside the supported range." });
    return;
  }

  sendJson(response, 200, { result });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/calculate") {
    await handleCalculation(request, response);
    return;
  }

  if (request.method === "GET" && staticFiles[url.pathname]) {
    const asset = staticFiles[url.pathname];
    try {
      const contents = await readFile(path.join(publicDirectory, asset.file));
      response.writeHead(200, { "Content-Type": asset.type });
      response.end(contents);
    } catch (error) {
      console.error(`Unable to read ${asset.file}:`, error);
      sendJson(response, 500, { error: "Unable to load the application." });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found." });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Calculator is running at http://localhost:${port}`);
});
