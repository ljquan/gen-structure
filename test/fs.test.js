const path = require("path");
const apiFs = require("../src/api/fs.js");

describe.only("resolve", () => {
    test("class", () => {
        expect(path.relative(__dirname, apiFs.resolve(path.resolve(__dirname, '../src/JsProcessor')))).toEqual('../src/JsProcessor.js');
        expect(path.relative(__dirname, apiFs.resolve(path.resolve(__dirname, './fixture/regexp')))).toEqual('fixture/regexp.ts');
        expect(path.relative(__dirname, apiFs.resolve(path.resolve(__dirname, '../')))).toEqual('../index.js');
    });

});
