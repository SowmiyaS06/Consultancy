const net = require("net");
const { spawn } = require("child_process");

const parsePorts = (value) =>
  String(value || "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((port) => Number.isInteger(port) && port > 0 && port < 65536);

const unique = (values) => [...new Set(values)];

const isPortFree = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "::");
  });

const findFreePort = async (ports) => {
  for (const port of ports) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port)) return port;
  }
  return null;
};

const run = async () => {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (!command) {
    console.error("Usage: node scripts/run-with-free-port.cjs <command> [...args]");
    process.exit(1);
  }

  const defaultPorts = [5000, 5001, 5002, 5003, 5004, 5005];
  const envPreferred = parsePorts(process.env.PORT);
  const envList = parsePorts(process.env.AUTO_PORTS);
  const candidates = unique([...envPreferred, ...envList, ...defaultPorts]);

  const freePort = await findFreePort(candidates);
  if (!freePort) {
    console.error(`No free port found in: ${candidates.join(", ")}`);
    process.exit(1);
  }

  console.log(`Using PORT=${freePort}`);

  const child = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      PORT: String(freePort),
    },
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
