const path = require("path");
const apiFs = require("../src/api/fs.js");
const AbstractProcessor = require("../src/AbstractProcessor.js");
const processor = new AbstractProcessor(path.resolve(__dirname, "../"), {
  exclude: /\.git|.vscode|node_modules/,
});

describe("parse", () => {
  // test("class", () => {
  //   const source = path.resolve(__dirname, "./fixture/class.ts");
  //   const ast = processor.parse(apiFs.readFileSync(source));
  //   // expect(ast).toEqual([
  //   //   {
  //   //     pos: 0,
  //   //     type: "comment",
  //   //     content:
  //   //       "/**\n * 关键词：'if', 'switch', 'with', 'catch', 'for', 'while', 'void'等不被误判\n */",
  //   //     searchStartPost: 0,
  //   //     searchEndPost: 75,
  //   //   },
  //   // ]);
  // });

  test("parseKeyWord ", () => {
    const source = path.resolve(__dirname, "./fixture/parseKeyWord.ts");
    const ast = processor.parse(apiFs.readFileSync(source));
    // console.log(JSON.stringify(ast, null, 2))
    expect(ast).toEqual([
      {
        pos: 0,
        type: "comment",
        content:
        "/**\n * 关键词：'if', 'switch', 'with', 'catch', 'for', 'while', 'void'等不被误判 \n */",
        searchStartPost: 0,
        searchEndPost: 76,
      },
    ]);
  });

  test.only("parseObject ", () => {
    const source = path.resolve(__dirname, "./fixture/parseObject.ts");
    const ast = processor.parse(apiFs.readFileSync(source));
    // console.log(JSON.stringify(ast, null, 2));
    expect(ast).toEqual([
      {
        "pos": 0,
        "type": "comment",
        "content": "// 文件注释",
        "searchStartPost": 0,
        "searchEndPost": 7
      },
      {
        "type": "object",
        "name": "definedObject",
        "content": "const definedObject",
        "pos": 16,
        "searchStartPost": 15,
        "searchEndPost": 39,
        "bracketsStart": 38,
        "children": [
          {
            "type": "function",
            "name": "hello",
            "content": "    hello() ",
            "pos": 54,
            "searchStartPost": 53,
            "searchEndPost": 67,
            "bracketsStart": 66,
            "bracketsEnd": 113,
            "children": [
              {
                "pos": 76,
                "type": "comment",
                "content": "// 注释 4.1.1",
                "searchStartPost": 67,
                "searchEndPost": 87
              }
            ],
            "comment": {
              "pos": 44,
              "type": "comment",
              "content": "// 注释 4.1",
              "searchStartPost": 39,
              "searchEndPost": 53
            }
          }
        ],
        "bracketsEnd": 117,
        "comment": {
          "pos": 8,
          "type": "comment",
          "content": "// 对象注释",
          "searchStartPost": 7,
          "searchEndPost": 15
        }
      },
      {
        "pos": 137,
        "type": "export-default",
        "content": "module.exports = ",
        "searchStartPost": 136,
        "searchEndPost": 154,
        "children": [
          {
            "type": "function",
            "name": "hello",
            "content": "  hello()",
            "pos": 156,
            "searchStartPost": 155,
            "searchEndPost": 166,
            "bracketsStart": 165,
            "bracketsEnd": 181,
            "children": [
              {
                "pos": 171,
                "type": "comment",
                "content": "// noop",
                "searchStartPost": 166,
                "searchEndPost": 178
              }
            ]
          },
          {
            "type": "function",
            "name": "world",
            "content": "  world()",
            "pos": 184,
            "searchStartPost": 182,
            "searchEndPost": 194,
            "bracketsStart": 193,
            "children": [
              {
                "type": "function",
                "name": "innerFun",
                "content": "    const innerFun = function()",
                "pos": 207,
                "searchStartPost": 206,
                "searchEndPost": 239,
                "bracketsStart": 238,
                "bracketsEnd": 253,
                "children": [
                  {
                    "pos": 246,
                    "type": "comment",
                    "content": "//",
                    "searchStartPost": 239,
                    "searchEndPost": 248
                  }
                ]
              },
              {
                "pos": 199,
                "type": "comment",
                "content": "// 内部函数",
                "searchStartPost": 194,
                "searchEndPost": 206
              }
            ],
            "bracketsEnd": 257
          }
        ],
        "bracketsEnd": 259,
        "comment": {
          "pos": 121,
          "type": "comment",
          "content": "/**\n * 导出对象\n */",
          "searchStartPost": 118,
          "searchEndPost": 136
        }
      },
      {
        "type": "object",
        "name": "exportObj",
        "content": "export const exportObj",
        "pos": 265,
        "searchStartPost": 260,
        "searchEndPost": 291,
        "bracketsStart": 290,
        "children": [
          {
            "type": "function",
            "name": "expFun",
            "content": "  expFun()",
            "pos": 316,
            "searchStartPost": 315,
            "searchEndPost": 327,
            "bracketsStart": 326,
            "bracketsEnd": 331,
            "comment": {
              "pos": 294,
              "type": "comment",
              "content": "/**\n   * expFun\n   */",
              "searchStartPost": 291,
              "searchEndPost": 315
            }
          }
        ],
        "bracketsEnd": 333
      }
    ]);
  });
});
