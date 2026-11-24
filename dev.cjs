const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const vm = require("node:vm");
const { compileTailwind } = require("./tailwind-compiler.cjs");

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const babel = vm.createContext({});
vm.runInContext(read("vendor/babel.js"), babel);

function transform(source) {
  return babel.Babel.transform(source, {
    plugins: [["transform-react-jsx", { pragma: "H", pragmaFrag: "React.Fragment" }]],
  }).code;
}

const liveReload = `
  (() => {
    const events = new EventSource("/changes");
    events.addEventListener("reload", () => location.reload());
  })();
`;

function compile() {
  const frames = JSON.parse(read("src/frames.json"));
  const components = frames.map(({ id }) => {
    const filename = "src/screens/" + id.replace(":", "-") + ".jsx";
    const source = read(filename);
    const declaration = source.match(/export default function (\w+)/);
    if (!declaration) throw new Error("Expected a default component in " + filename);
    try {
      const body = transform(source.replace("export default function", "function"));
      return JSON.stringify(id) + ": (() => {\n" + body + "\nreturn " + declaration[1] + ";\n})()";
    } catch (error) {
      throw new Error(filename + ": " + error.message);
    }
  });

  const source = read("src/design-data.js") + "\nconst SCREENS = {\n" +
    components.join(",\n") + "\n};\n" + transform(read("src/portal.jsx")) + liveReload;
  new vm.Script(source);
  return source;
}

const contentTypes = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".woff2": "font/woff2",
};
const clients = new Set();
let bundle;
let compileError;
function rebuild() {
  try {
    bundle = compile();
    compileError = undefined;
    console.log("JSX compiled.");
  } catch (error) {
    compileError = error.message;
    console.error(compileError);
  }
}
let css;
let cssError;
async function rebuildStyles() {
  try {
    css = await compileTailwind(read("tailwind.css"));
    cssError = undefined;
    console.log("Tailwind compiled.");
  } catch (error) {
    cssError = "tailwind.css: " + error.message;
    console.error(cssError);
  }
}

let rebuildTimer;
let rebuildQueue = Promise.resolve();
function queueRebuild() {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    rebuildQueue = rebuildQueue.then(async () => {
      rebuild();
      await rebuildStyles();
      for (const response of clients) response.write("event: reload\ndata: changed\n\n");
    });
  }, 120);
}
fs.watch(path.join(root, "src"), { recursive: true }, queueRebuild);
fs.watch(root, (_event, name) => {
  if (name === "index.html" || name === "tailwind.css") queueRebuild();
});

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  if (pathname === "/changes") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    response.write(": connected\n\n");
    clients.add(response);
    response.on("close", () => clients.delete(response));
    return;
  }
  if (pathname === "/tailwind.css") {
    response.writeHead(css === undefined ? 500 : 200, {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(css || "");
    return;
  }
  if (pathname === "/app.js") {
    response.writeHead(200, { "Content-Type": contentTypes[".js"], "Cache-Control": "no-store" });
    const message = compileError || cssError
      ? "document.getElementById('root').textContent = " +
        JSON.stringify("Check the VS Code terminal for the build error.") + ";" + liveReload
      : bundle;
    response.end(message);
    return;
  }
  const file = pathname === "/" || pathname === "/index.html"
    ? "index.html"
    : /^\/(assets|vendor)\/[a-zA-Z0-9_.-]+$/.test(pathname) ? pathname.slice(1) : null;
  if (!file) {
    response.writeHead(404).end("Not found");
    return;
  }
  fs.readFile(path.join(root, file), (error, bytes) => {
    if (error) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    }).end(bytes);
  });
});
server.on("error", error => {
  console.error(error.code === "EADDRINUSE"
    ? "Port " + port + " is busy. Stop the other server or set PORT before trying again."
    : error.message);
  process.exit(1);
});
rebuild();
rebuildStyles().then(() => {
  server.listen(port, "127.0.0.1", () => console.log("Open http://127.0.0.1:" + port));
});

