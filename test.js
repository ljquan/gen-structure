const path = require("path");
const apiFs = require("./src/api/fs.js");
const JsProcessor = require("./src/JsProcessor.js");
const processor = new JsProcessor(path.resolve(__dirname, "./"), {
    exclude: /\.git|.vscode|node_modules|test/,
});


// const source = path.resolve(__dirname, "./src/AbstractProcessor.js");
const source = path.resolve(__dirname, "./test/fixture/regexp.ts");
const txt = apiFs.readFileSync(source);
const ast = processor.parse(txt);
