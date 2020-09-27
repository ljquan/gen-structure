// 入口文件
const apiFs = require("./api/fs.js");
const fs = require("fs");
const path = require("path");

const regAnnotation = /"([^\\\"]*(\\.)?)*"|'([^\\\']*(\\.)?)*'|`([^\\\`]*(\\.)?)*`|\/{2,}.*(?=[\r\n])|\/{2,}[^\r\n]*|\/\*[\s\S]*?\*\//g;

const tagRE = /(?:<!--[\S\s]*?-->|<%((?!%>)[\s\S])*%>|<(?:<%((?!%>)[\s\S])*%>|"[^"]*<%((?!%>)[\s\S])*%>[^"]*"|'[^']*<%((?!%>)[\s\S])*%>[^']*'|"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)/g;

const regComment = /\/{2,}|\/[\*]+|[\*]+\/|^\s*[\*]+|[\*]+\s*|<!-{2,}|-{2,}>/g;

const requireReg = /require\(['"`]([^'"`]+)['"`]\)/;
const importReg = /import[^'"`]+['"`]([^'"`]+)['"`]/;
const jsExtReg = /\.ts|\.js$/;

module.exports = class AbstractProcessor {
  constructor(dir, opt) {
    this.dir = path.resolve(dir);
    this.opt = opt;
    this.umlMap = [];
    const reg = (this.astReg = [
      {
        name: "string",
        reg: /"([^\"]*(\\.)?)*"|'([^\']*(\\.)?)*'|`([^\`]*(\\.)?)*`/,
        weight: 3,
      },
      {
        name: "comment",
        reg: /\/{2,}.*(?=[\r\n])|\/{2,}[^\r\n]*|\/\*[\s\S]*?\*\//,
        fun: (str) => str,
        weight: 2,
      },
      {
        name: "regexp",
        reg: /(?!\/\/)\/[^\n]+\//,
        weight: 4,
      },
      {
        name: "require",
        reg: /\brequire\(['"`]([^'"`]+)['"`]\)/,
        weight: 0,
        fun: (str) => {
          const arr = str.match(/\(['"`]([^'"`\s]+)['"`]\)/);
          return (arr && arr[1]) || "";
        },
      },
      {
        name: "import",
        reg: /\bimport\s[^'"`]+['"`]([^'"`]+)['"`]/,
        weight: 0,
        fun: (str) => {
          const arr = str.match(/['"`]([^'"`\s]+)['"`]/);
          return (arr && arr[1]) || "";
        },
      },
      {
        // export * from 'xx'
        name: "export-import",
        reg: /\bexport\s[^'"`]+\sfrom\s['"`]([^'"`\s]+)['"`]/,
        weight: 0,
        fun: (str) => {
          const arr = str.match(/['"`]([^'"`\s]+)['"`]/);
          return (arr && arr[1]) || "";
        },
      },
      {
        // export default'
        name: "export-default",
        reg: /\bexport[\s]+default\b[^\{\n]*|\bmodule\.exports\b[^\{\n]*/,
        weight: 0,
        fun: (str) => str,
      },
      {
        // 括号
        name: "brackets",
        reg: /[\(]*\{|\}[\)]*/,
        weight: 0,
        fun: (str) => str,
      },
    ]);
    const regStr = reg
      .sort((a, b) => b.weight - a.weight)
      .map((item) => {
        const regStr = item.reg.toString().slice(1, -1);
        item.reg$ = new RegExp(`^(${regStr})$`);
        return regStr;
      })
      .join("|");
    // console.log(regStr);
    this.parseReg = new RegExp(regStr, "g");
  }

  parse(text) {
    let list = [];
    let lastEndPos = 0;
    // 数字列表
    const numList = [];
    // 符号列表
    const symbolList = [];
    text.replace(this.parseReg, (str, ...args) => {
      const lastItem = list[list.length - 1] || {};
      const pos = args[args.length - 2];
      // 上次结束的位置为本次开始位置
      const startPos = lastEndPos;
      const skipStr = text.substring(startPos, pos);
      lastEndPos = pos + str.length;

      // 通过类似中序转后续的方式解析出括号与定义之间的关系
      if (str[str.length-1] === "{") {
        let item = null;
        // 解析出类
        let arr = skipStr.match(/[^;\n]*\bclass\s+(\b[^\s]+\b)[^\{\}\n;]+/);
        if (arr) {
          item = {
            type: "class",
            name: arr[1],
            constent: arr[0],
            pos: startPos + (arr.index || 0),
            searchStartPost: startPos,
            searchEndPost: lastEndPos,
            children: [],
          };
        } else {
          arr =
            // function name(){}
            skipStr.match(/[^;\n]*\bfunction\s+(\b[^\s\(\)\.]+\b)\s*\([^\(\)]*\)[^\{\}\n;]*$/) ||
            // const a = function(){}
            skipStr.match(
              /[^;\n]*(\b[^\s\(\)\.]+\b)\s*=\s*\bfunction\s*\([^\(\)]*\)\s*$/
          ) ||
        // const a = ()=>{}
        // const b = params => ({foo: bar})
        // const b = params => abc => params.concat(abc);
          skipStr.match(/[^;\n]*(\b[^\s\(\)\.]+\b)\s*=\s*(\([^\(\)]*\)|\b[^\s\(\)]+\b)\s*=>\s*$/);
          if (numList.length && !arr) {
            // 类/对象函数
            arr = skipStr.match(/[^;\n\.]*(\b[^\s\(\)\.]+\b)\s*\([^\(\)]*\)\s*$/);
            if (
              arr &&
              ["if", "switch", "with", "catch", "for", "while", "void"].indexOf(
                arr[1]
              ) !== -1
            ) {
              arr = null;
            }
          }
          if (arr) {
            item = {
              type: "function",
              name: arr[1],
              content: arr[0],
              pos: startPos + (arr.index || 0),
              searchStartPost: startPos,
              searchEndPost: lastEndPos,
            };
          } else {
            arr = skipStr.match(/[^;\n]*\b([^\s=]+)\s*=\s*$/);
            if (arr) {
              item = {
                type: "object",
                name: arr[1],
                content: arr[0].replace(/\s*=\s*$/, ""),
                pos: startPos + (arr.index || 0),
                searchStartPost: startPos,
                searchEndPost: lastEndPos,
              };
            } else if(!skipStr && lastItem.type === 'export-default'){
              item = lastItem;
              list.pop();
            }
          }
        }
        if (item) {
          // 确保纯粹。不会在他上面多一行代码
          if (skipStr.trim().indexOf("\n") === -1 && list.length) {
            // 这种情况下，上一个comment，大概率是该class或function的注释
            if (lastItem.type === "comment" &&
              lastItem.searchEndPost === item.searchStartPost
            ) {
              list.pop();
              item.comment = lastItem;
            }
          }
          numList.push(item);
        } else {
          numList.push({
            pos: pos,
            txt: skipStr,
          });
        }
        symbolList.push("{");
        return;
      } else if (str[0] === "}") {
        symbolList.pop();
        const item = numList.pop();
        if (item) {
          list = list.filter((o) => {
            if (o.type === "comment" && o.pos > item.pos) {
              return false;
            }
            return true;
          });
          if (item.type) {
            if (numList.length) {
              const parent = numList[numList.length - 1];
              parent.children = parent.children || [];
              parent.children.push(item);
            } else {
              list.push(item);
            }
          }
        }
        return;
      }

      // 其他情况
      for (const item of this.astReg) {
        if (item.reg$.test(str)) {
          if (item.fun) {
            const element = {
              pos,
              type: item.name,
              content: item.fun(str),
              searchStartPost: startPos,
              searchEndPost: lastEndPos,
            };
            if (lastItem.type === "comment" &&
              lastItem.searchEndPost === element.searchStartPost
            ) {
              list.pop();
              element.comment = lastItem;
            }
            list.push(element);
          }
          return "";
        }
      }
    });
    return list;
  }

  /**
   * 处理的文件(代码文件)
   * @param {string} name
   */
  acceptFile(name) {
    return /\.ts$|\.js$/.test(name);
  }
  /**
   * 生成项目结构
   * @param {string} dir 目录地址
   * @param {number} deep 目录深度（根目录为0）
   * @param {Object} opt 选项
   */
  async genStructure(dir, deep = 0, opt) {}

  /**
   * 过滤掉不关注的目录，如.git等
   * @param {string} absPath
   */
  pathFilter(absPath) {
    const opt = this.opt || {
      exclude: /\.git|.vscode|node_modules/,
    };
    if (opt.exclude && opt.exclude.test(absPath)) {
      if (!(opt.include && opt.include.test(absPath))) {
        return false;
      }
    }
    return true;
  }

  getFiles() {
    const list = apiFs.getFileAndDir(this.dir, this.pathFilter.bind(this));
    const newList = [];
    for (const item of list) {
      if (item.type === "file") {
        if (this.acceptFile(item.name)) {
          newList.push(
            Object.assign({}, item, {
              ast: this.parse(apiFs.readFileSync(item.path)),
            })
          );
        }
      } else {
        newList.push(item);
      }
    }
    return newList;
  }

  /**
   * 计算注释文本属于介绍该代码文件说明的可能性的权重（概率）
   * @param {string} text 文本
   */
  getWeight(text) {
    return text.length;
  }
  /**
   * 获取一个文件的说明注释
   * @param {string} file 文件
   */
  async getDocument(file) {}

  /**
   * 获取代码引用关系
   * @param {string} file 当前文件
   * @param {string} str 代码
   */
  addRelate(file, str) {}

  getRelateUML() {
    return "";
  }

  getUMLString(list) {
    return `
\`\`\`plantuml
@startuml
${list.join("\n")}
@enduml
\`\`\``;
  }
  getDetail() {
    return "";
  }
  get structure() {
    const list = this.getFiles();
    return (
      "# 依赖关系\n" +
      this.getRelateUML(list) +
      "# 代码说明\n" +
      this.getDetail(list)
    );
  }
};
