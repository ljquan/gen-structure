const path = require("path");
const apiFs = require("../src/api/fs.js");
const AbstractProcessor = require("../src/AbstractProcessor.js");
const processor = new AbstractProcessor(path.resolve(__dirname, "../"), {
  exclude: /\.git|.vscode|node_modules/,
});

describe("parse", () => {
  test("class", () => {
    const source = path.resolve(__dirname, "./fixture/class.ts");
    const ast = processor.parse(apiFs.readFileSync(source));
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

  test.only("parseObject ", () => {
    const source = path.resolve(__dirname, "./fixture/parseObject.ts");
    const ast = processor.parse(apiFs.readFileSync(source));
    // console.log(JSON.stringify(ast, null, 2));
    expect(ast).toEqual([
      {
        "type": "object",
        "name": "definedObject",
        "content": "const definedObject",
        "pos": 4,
        "searchStartPost": 3,
        "searchEndPost": 27,
        "comment": {
          "pos": 1,
          "type": "comment",
          "content": "//",
          "searchStartPost": 0,
          "searchEndPost": 3
        },
        "children": [
          {
            "type": "function",
            "name": "hello",
            "content": "    hello() ",
            "pos": 42,
            "searchStartPost": 41,
            "searchEndPost": 55,
            "comment": {
              "pos": 32,
              "type": "comment",
              "content": "// 注释 4.1",
              "searchStartPost": 27,
              "searchEndPost": 41
            }
          }
        ]
      },
      {
        "pos": 125,
        "type": "export-default",
        "content": "module.exports = ",
        "searchStartPost": 124,
        "searchEndPost": 142,
        "comment": {
          "pos": 109,
          "type": "comment",
          "content": "/**\n * 导出对象\n */",
          "searchStartPost": 106,
          "searchEndPost": 124
        },
        "children": [
          {
            "type": "function",
            "name": "hello",
            "content": "  hello()",
            "pos": 144,
            "searchStartPost": 143,
            "searchEndPost": 154
          },
          {
            "type": "function",
            "name": "world",
            "content": "  world()",
            "pos": 172,
            "searchStartPost": 170,
            "searchEndPost": 182,
            "children": [
              {
                "type": "function",
                "name": "innerFun",
                "content": "    const innerFun = function()",
                "pos": 195,
                "searchStartPost": 194,
                "searchEndPost": 227,
                "comment": {
                  "pos": 187,
                  "type": "comment",
                  "content": "// 内部函数",
                  "searchStartPost": 182,
                  "searchEndPost": 194
                }
              }
            ]
          }
        ]
      },
      {
        "type": "object",
        "name": "exportObj",
        "content": "export const exportObj",
        "pos": 253,
        "searchStartPost": 248,
        "searchEndPost": 279,
        "children": [
          {
            "type": "function",
            "name": "expFun",
            "content": "  expFun()",
            "pos": 304,
            "searchStartPost": 303,
            "searchEndPost": 315,
            "comment": {
              "pos": 282,
              "type": "comment",
              "content": "/**\n   * expFun\n   */",
              "searchStartPost": 279,
              "searchEndPost": 303
            }
          }
        ]
      }
    ]);
  });
});
