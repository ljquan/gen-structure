const path = require("path");
const apiFs = require("../src/api/fs.js");
const JsProcessor = require("../src/JsProcessor.js");
const processor = new JsProcessor(path.resolve(__dirname, "../"), {
  exclude: /\.git|.vscode|node_modules|test/,
});

describe("parse", () => {
  test("class", () => {
    const source = path.resolve(__dirname, "./fixture/class.ts");
    const txt = apiFs.readFileSync(source);
    const ast = processor.parse(txt);
    // console.log(processor.getDocument(ast))
    // console.log(processor.genStructure(processor.getFiles()));
    // console.log(processor.processImport(ast));
    // console.log(processor.processImport(processor.getFiles()));
    // console.log(processor.run());
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
