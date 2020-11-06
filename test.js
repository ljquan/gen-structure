const path = require("path");
const apiFs = require("./src/api/fs.js");
const JsProcessor = require("./src/JsProcessor.js");
const processor = new JsProcessor(path.resolve(__dirname, "./"), {
  exclude: /\.git|.vscode|node_modules|test/,
});

// const source = path.resolve(__dirname, "./src/AbstractProcessor.js");
// const source = path.resolve(__dirname, "test/backCase/pathUtils.ts");
// const txt = apiFs.readFileSync(source);
// const ast = processor.parse(txt);
// console.log(JSON.stringify(ast, null, 2));
// console.log(processor.getDocument(ast));
const source = path.resolve(__dirname, "test/backCase/5_87ad1649.js");
const ast = processor.parse(apiFs.readFileSync(source));
console.log(JSON.stringify(ast, null, 2));
apiFs.writeFileSync(
  path.resolve(__dirname, "test.json"),
  JSON.stringify(ast, null, 2)
);
