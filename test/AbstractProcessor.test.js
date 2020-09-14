const path = require('path');
const apiFs = require("../src/api/fs.js");
const AbstractProcessor = require('../src/AbstractProcessor.js');
const processor = new AbstractProcessor(path.resolve(__dirname, '../'), {
  exclude: /\.git|.vscode|node_modules/
});

describe("getAst", () => {
  test("js", () => {
    // console.log(JSON.stringify(processor.getFiles(), null,2));
    // console.log(processor.structure);
    console.log(processor.parse(apiFs.readFileSync('/Users/liquid/code/ljquan/gen-structure/index.js')));
    // expect().toBeTruthy();
  });

});
