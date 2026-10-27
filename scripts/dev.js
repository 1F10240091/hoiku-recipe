const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const windows = process.platform === "win32";
const python = path.join(root, "backend", ".venv", windows ? "Scripts" : "bin", windows ? "python.exe" : "python");
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");

const services = [
  {
    name: "api",
    command: python,
    args: ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    cwd: path.join(root, "backend"),
  },
  {
    name: "web",
    command: process.execPath,
    args: [nextCli, "dev", "-H", "127.0.0.1"],
    cwd: path.join(root, "frontend"),
  },
];

const children = [];
let stopping = false;

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child && !child.killed) child.kill(windows ? undefined : "SIGTERM");
  }
  setTimeout(() => process.exit(exitCode), 300);
}

for (const service of services) {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(`[${service.name}] 起動できませんでした: ${error.message}`);
    stopAll(1);
  });
  child.on("exit", (code) => {
    if (!stopping) {
      console.error(`[${service.name}] が終了しました (code: ${code ?? "unknown"})`);
      stopAll(code || 1);
    }
  });
}

process.on("SIGINT", () => stopAll());
process.on("SIGTERM", () => stopAll());
