const path = require("path");
const slash = require("slash");
const apiFs = require("../src/api/fs.js");

describe("resolve", () => {
    test("class", () => {
        expect(slash(path.relative(__dirname, apiFs.resolve(path.resolve(__dirname, '../src/JsProcessor'))))).toEqual('../src/JsProcessor.js');
        expect(slash(path.relative(__dirname, apiFs.resolve(path.resolve(__dirname, './fixture/regexp'))))).toEqual('fixture/regexp.ts');
        expect(slash(path.relative(__dirname, apiFs.resolve(path.resolve(__dirname, '../'))))).toEqual('../index.js');
    });

});
