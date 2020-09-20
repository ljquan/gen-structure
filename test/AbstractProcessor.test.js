const path = require("path");
const apiFs = require("../src/api/fs.js");
const AbstractProcessor = require("../src/AbstractProcessor.js");
const processor = new AbstractProcessor(path.resolve(__dirname, "../"), {
  exclude: /\.git|.vscode|node_modules/,
});

describe("parse", () => {
  test.only("class", () => {
    const source = path.resolve(__dirname, "./fixture/class.ts");
    const ast = processor.parse(apiFs.readFileSync(source));
    console.log(JSON.stringify(ast, null, 2));
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

  test("parseKeyWord ", () => {
    const source = path.resolve(__dirname, "./fixture/parseKeyWord.ts");
    const ast = processor.parse(apiFs.readFileSync(source));
    console.log(JSON.stringify(ast, null, 2));
    expect(ast).toEqual([
      {
        pos: 0,
        type: "comment",
        content:
          "/**\n * 关键词：'if', 'switch', 'with', 'catch', 'for', 'while', 'void'等不被误判\n */",
        searchStartPost: 0,
        searchEndPost: 75,
      },
    ]);
  });

  test("parseObject ", () => {
    const source = path.resolve(__dirname, "./fixture/parseObject.ts");
    const ast = processor.parse(apiFs.readFileSync(source));
    // console.log(JSON.stringify(ast, null, 2));
    expect(ast).toEqual([
      {
        type: "object",
        name: "definedObject",
        content: "const definedObject",
        pos: 4,
        searchStartPost: 3,
        searchEndPost: 27,
        comment: {
          pos: 1,
          type: "comment",
          content: "//",
          searchStartPost: 0,
          searchEndPost: 3,
        },
        children: [
          {
            type: "function",
            name: "hello",
            content: "    hello() ",
            pos: 42,
            searchStartPost: 41,
            searchEndPost: 55,
            comment: {
              pos: 32,
              type: "comment",
              content: "// 注释 4.1",
              searchStartPost: 27,
              searchEndPost: 41,
            },
          },
        ],
      },
      {
        type: "object",
        name: "exports",
        content: "module.exports",
        pos: 110,
        searchStartPost: 106,
        searchEndPost: 128,
        children: [
          {
            type: "function",
            name: "hello",
            content: "  hello()",
            pos: 129,
            searchStartPost: 128,
            searchEndPost: 139,
          },
          {
            type: "function",
            name: "world",
            content: "  world()",
            pos: 157,
            searchStartPost: 155,
            searchEndPost: 167,
            children: [
              {
                type: "function",
                name: "innerFun",
                content: "    const innerFun = function()",
                pos: 180,
                searchStartPost: 179,
                searchEndPost: 212,
                comment: {
                  pos: 172,
                  type: "comment",
                  content: "// 内部函数",
                  searchStartPost: 167,
                  searchEndPost: 179,
                },
              },
            ],
          },
        ],
      },
      {
        type: "object",
        name: "exportObj",
        content: "export const exportObj",
        pos: 238,
        searchStartPost: 233,
        searchEndPost: 264,
        children: [
          {
            type: "function",
            name: "expFun",
            content: "  expFun()",
            pos: 289,
            searchStartPost: 288,
            searchEndPost: 300,
            comment: {
              pos: 267,
              type: "comment",
              content: "/**\n   * expFun\n   */",
              searchStartPost: 264,
              searchEndPost: 288,
            },
          },
        ],
      },
    ]);
  });
});
