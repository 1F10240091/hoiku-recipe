const { spawnSync } = require("node:child_process");
const path = require("node:path");
const backend = path.resolve(__dirname, "../backend");
const windows = process.platform === "win32";
const python = path.join(backend, ".venv", windows ? "Scripts" : "bin", windows ? "python.exe" : "python");
function run(command, args) {
  const result = spawnSync(command, args, { cwd: backend, stdio: "inherit", windowsHide: true });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
if (process.argv[2] === "setup") {
  run(windows ? "python" : "python3", ["-m", "venv", ".venv"]);
  run(python, ["-m", "pip", "install", "-r", "requirements.txt"]);
} else {
  run(python, ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"]);
}
