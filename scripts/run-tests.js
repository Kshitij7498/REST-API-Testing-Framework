const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 3000);
const baseUrl = `http://127.0.0.1:${port}`;
const isWindows = process.platform === "win32";

function waitForServer(url, timeoutMs = 15000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode === 200) return resolve();
        retry();
      });
      req.on("error", retry);
      req.setTimeout(1000, () => req.destroy(new Error("Health check timed out")));
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`API did not become ready at ${url} within ${timeoutMs}ms`));
      } else {
        setTimeout(check, 250);
      }
    };
    check();
  });
}

async function main() {
  const server = spawn(process.execPath, [path.join(root, "src", "server.js")], {
    cwd: root,
    env: { ...process.env, PORT: String(port), API_TOKEN: process.env.API_TOKEN || "test-token" },
    stdio: "inherit",
    windowsHide: true
  });

  let finished = false;
  const stopServer = () => {
    if (finished) return;
    finished = true;
    if (server.exitCode === null) {
      server.kill();
      if (isWindows && server.pid) {
        // The Node child is terminated directly; no shell process is used.
      }
    }
  };

  try {
    server.on("error", (error) => {
      console.error("Could not start API server:", error.message);
      process.exitCode = 1;
    });
    await waitForServer(`${baseUrl}/health`);
    console.log("\nAPI ready. Running Postman collection with Newman...\n");

    const newmanBin = path.join(root, "node_modules", "newman", "bin", "newman.js");
    const run = spawn(process.execPath, [
      newmanBin,
      "run",
      path.join(root, "postman", "RestAPI-Testing-Framework.postman_collection.json"),
      "--environment",
      path.join(root, "postman", "local.postman_environment.json"),
      "--env-var",
      `baseUrl=${baseUrl}`,
      "--reporters",
      "cli"
    ], { cwd: root, stdio: "inherit", windowsHide: true });

    const code = await new Promise((resolve, reject) => {
      run.on("error", reject);
      run.on("close", (exitCode) => resolve(exitCode === null ? 1 : exitCode));
    });
    process.exitCode = code;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    stopServer();
  }
}

main();
