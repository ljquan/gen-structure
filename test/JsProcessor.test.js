const path = require("path");
const apiFs = require("../src/api/fs.js");
const JsProcessor = require("../src/JsProcessor.js");
const processor = new JsProcessor(path.resolve(__dirname, "../"), {
  exclude: /\.git|.vscode|node_modules/,
});

describe("parse", () => {
  test("class", () => {
    const source = path.resolve(__dirname, "./fixture/class.ts");
    const ast = processor.parse(apiFs.readFileSync(source));
    console.log(processor.getDocument(ast))
    // expect(ast).toEqual([
    //   {
    //     pos: 0,
    //     type: "comment",
    //     content:
    //       "/**\n * 关键词：'if', 'switch', 'with', 'catch', 'for', 'while', 'void'等不被误判\n */",
    //     searchStartPost: 0,
    //     searchEndPost: 75,
    //   },
    // ]);
  });

});
