const path = require('path');
const apiFs = require("../src/api/fs.js");
const AbstractProcessor = require('../src/AbstractProcessor.js');
const processor = new AbstractProcessor(path.resolve(__dirname, '../'), {
  exclude: /\.git|.vscode|node_modules/
});

describe("parse", () => {
  test("js", () => {
    // console.log(JSON.stringify(processor.getFiles(), null,2));
    // console.log(processor.structure);
    const a = path.resolve(__dirname, './fixture/class.ts');

    console.log(JSON.stringify(processor.parse(apiFs.readFileSync(a)), null, 2));
    // expect().toBeTruthy();
  });

  test("parseKeyWord ", () => {
    const source = path.resolve(__dirname, './fixture/parseKeyWord.ts');
    const ast = processor.parse(apiFs.readFileSync(source));
    expect(ast).toEqual([
      {
        "pos": 0,
        "type": "comment",
        "content": "关键词：'if', 'switch', 'with', 'catch', 'for', 'while', 'void'等不被误判",
        "searchStartPost": 0,
        "searchEndPost": 75
      }
    ]);
  });
  test.only("parseObject ", () => {
    const source = path.resolve(__dirname, './fixture/parseObject.ts');
    const ast = processor.parse(apiFs.readFileSync(source));
    console.log(JSON.stringify(ast, null, 2));
    // expect(ast).toEqual([
    //   {
    //     "pos": 0,
    //     "type": "comment",
    //     "content": "关键词：'if', 'switch', 'with', 'catch', 'for', 'while', 'void'等不被误判",
    //     "searchStartPost": 0,
    //     "searchEndPost": 75
    //   }
    // ]);
  });
});
