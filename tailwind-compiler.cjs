const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const compilerFile = path.join(__dirname, "vendor", "tailwind.js");
const compiler = new vm.Script(fs.readFileSync(compilerFile, "utf8"), {
  filename: "vendor/tailwind.js",
});

// The bundled Tailwind distribution accepts a stylesheet through a style
// element. Supply that input and capture its compiled output in Node.
function compileTailwind(source) {
  return new Promise((resolve, reject) => {
    const stylesheet = { textContent: source };
    const output = {
      set textContent(css) { resolve(css); }
    };
    const document = {
      createElement: () => output,
      querySelectorAll: selector => selector === 'style[type="text/tailwindcss"]' ? [stylesheet] : [],
      documentElement: {},
      head: { append() {} },
    };
    const performance = {
      mark(name, options) {
        if (name === "(error)") reject(new Error(options.detail.error));
      },
      measure() {},
    };
    compiler.runInNewContext({
      console,
      document,
      performance,
      MutationObserver: class { observe() {} },
    });
  });
}

module.exports = { compileTailwind };
