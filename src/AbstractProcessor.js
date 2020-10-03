// 入口文件
const apiFs = require("./api/fs.js");
const path = require("path");
const slash = require("slash");

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
        weight: 5, // 注释的优先级要比正则高。不然容易死循环：/* webpackChunkName: "trans_login" */   '../views/system/trans_login.vue'
      },
      {
        name: "regexp",
        reg: /(?!\/\/)\/([^\n\\\/]|\\\/|\\\w)+\//,
        weight: 4,
      },
      {
        name: "require",
        reg: /(?<!\.)\brequire\(['"`]([^'"`]+)['"`]\)/,
        weight: 0,
        fun: (str) => {
          const arr = str.match(/\(['"`]([^'"`\s]+)['"`]\)/);
          return (arr && arr[1]) || "";
        },
      },
      {
        name: "import",
        reg: /(?<!\.)\bimport\s[^'"`]+['"`]([^'"`]+)['"`]/,
        weight: 0,
        fun: (str) => {
          const arr = str.match(/['"`]([^'"`\s]+)['"`]/);
          return (arr && arr[1]) || "";
        },
      },
      {
        // export * from 'xx'
        name: "export-import",
        reg: /(?<!\.)\bexport\s[^'"`]+\sfrom\s['"`]([^'"`\s]+)['"`]/,
        weight: 0,
        fun: (str) => {
          const arr = str.match(/['"`]([^'"`\s]+)['"`]/);
          return (arr && arr[1]) || "";
        },
      },
      {
        // export default'
        name: "export-default",
        reg: /(?<!\.)\bexport[\s]+default\b[^\{\n]*|\bmodule\.exports\b[^\{\n]*/,
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
  /**
   * 解析出简单的ast
   * @param {string} text 源码内容
   */
  parse(text) {
    // 避免window与mac换行符不一致
    text = text.replace(/\r\n/g, '\n');
    let list = [];
    let lastEndPos = 0;
    // 数字列表
    const numList = [];
    // 符号列表
    const symbolList = [];
    // console.log('parse', this.parseReg);
    text.replace(this.parseReg, (str, ...args) => {
      // console.log(str);
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
            content: arr[0],
            pos: startPos + (arr.index || 0),
            searchStartPost: startPos,
            searchEndPost: lastEndPos, // { 括号后面的位置
            bracketsStart: pos, // { 括号前面的位置
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
              bracketsStart: pos,
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
                bracketsStart: pos,
              };
            } else if(!skipStr && lastItem.type === 'export-default'){
              item = lastItem;
              list.pop();
            }
          }
        }
        if (item) {
          numList.push(item);
        } else {
          numList.push({
            pos: pos,
            txt: skipStr,
            bracketsStart: pos,
          });
        }
        symbolList.push("{");
        return;
      } else if (str[0] === "}") {
        symbolList.pop();
        const item = numList.pop();
        if (item) {
          item.bracketsEnd = pos;
          list = list.filter((o) => {
            if (o.type === "comment" && o.pos > item.bracketsStart && o.pos < item.bracketsEnd){ 
              item.children = item.children || [];
              item.children.push(o);
              // 括号内的注释
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
            list.push(element);
          }
          return "";
        }
      }
    });

    // 处理注释归属
    const processComment = (arrAst) =>{
      const sortArr = arrAst.sort((a, b)=>a.pos - b.pos);
      return sortArr.filter((item, idx, self)=>{
        if(item.type === 'comment'){
          // 文件开头的注释，belongPre是true因为searchStartPost和pos都是0。这里的逻辑回归为文件注释
          const belongPre = text.substring(item.searchStartPost, item.pos).indexOf('\n') === -1;
          if(belongPre){
            const preItem = self[idx - 1];
            if(preItem && preItem.searchEndPost === item.searchStartPost
                && preItem.type !== "comment"){
                  preItem.comment = item;
                  return false;
                }
          } else {    
            const nextItem = self[idx + 1];
            if(nextItem && item.searchEndPost === nextItem.searchStartPost
                && nextItem.type !== "comment"){
                  const nextCommentItem = self[idx + 2];
                  if(nextCommentItem && nextCommentItem.searchStartPost === nextItem.searchEndPost
                      && nextCommentItem.type === "comment"){
                        // 段注释与行注释，优先选行注释
                        return true;
                      }
                  nextItem.comment = item;
                  return false;
                }
          }
        }else if('bracketsStart' in item && item.children && item.children.length){
          if(!item.comment){
            const firstChildren = item.children[0];
            if(firstChildren.type === 'comment'){
              const belongPre = text.substring(firstChildren.searchStartPost, firstChildren.pos).indexOf('\n') === -1;
              if(belongPre){
                item.comment = firstChildren;
                item.children.shift();
              }
            }
          }
          item.children = processComment(item.children);
        }
        return true;
      });
    }
    return processComment(list);
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
   */
  genStructure(fileList, deep = 0) {
    if(!(fileList && fileList.length)){
      throw new Error('未找到代码文件');
    }
    let strList = [];
    const lastIndex = fileList.length - 1;
    fileList.forEach((item, i) => {
      let tree = '';
      if (deep > 0) {
        tree = (i < lastIndex ? "├" : "└") +
          Array(deep - 1)
            .fill("─")
            .join("");
      }
      if (item.type === 'file') {
        // 处理文件 - 说明
        const pathStr = `[${tree}${item.name}](${slash(path.relative(process.cwd(), item.path))})`;
        let document = item.ast ? this.getDocument(item.ast).replace(/@\w+/, "") : '';
        strList.push(`${pathStr}\t${document}<br>`);
      } else if (item.type === 'dir') {
        // console.log('subDir', subDir);
        // 生成子目录
        let struct = this.genStructure(item.children, deep + 1);
        if (struct) {
          let index = null; // 目录中的index文件描述，如果有，可用于描述当前目录说明
          struct = struct.filter((file) => {
            if (/index\.[^\///\.]+$/.test(file.name) && file.type === 'file') {
              index = file;
              return false;
            }
            return true;
          });
          const head =
            Array(deep + 1)
              .fill("#")
              .join("") + " ";
          const pathStr = `[${tree}${item.name}](${slash(path.relative(process.cwd(), item.path))})`;
          if (index) {
            if (struct.length > 1) {
              strList.push(`${head}${pathStr} ${index.split(")\t")[1] || ""}`); // 文件描述用 )\t 分割
            } else {
              strList.push(`${pathStr} ${index.split(")\t")[1]}`); // 文件描述用 )\t 分割
            }
          } else if (struct.length > 1) {
            // 只有一个子目录或者只有一个文件，不打印目录
            strList.push(head +  pathStr);
          }
          strList = strList.concat(struct);
        }
      }
    });
    return strList;
  }

  /**
   * 过滤掉不关注的目录，如.git等
   * @param {string} absPath
   */
  pathFilter(absPath) {
    const opt = this.opt || {
      exclude: /\.git|.vscode|node_modules|test/,
    };
    const relPath = path.relative(process.cwd(), absPath);
    // console.log(relPath, opt)
    if (opt.exclude && opt.exclude.test(relPath)) {
      if (!(opt.include && opt.include.test(relPath))) {
        return false;
      }
    }
    return true;
  }
  /**
   * 获取文件列表
   */
  getFiles() {
    const list = apiFs.getFileAndDir(this.dir, this.pathFilter.bind(this));
    // console.log(this.dir, list);
    let newList = [];
    const parseAst = (item)=>{
      let newItem = Object.assign({}, item);
      // console.log(item.path);
      if (item.type === "file") {
        if (this.acceptFile(newItem.name)) {
          newItem.ast = this.parse(apiFs.readFileSync(item.path));
          return newItem;
        }
      } else if (item.children && item.children.length){
        newItem.children = newItem.children.map(o => parseAst(o)).filter(o=>!!o);
        if(newItem.children.length){
          return newItem;
        }
      }
    }
    for (const item of list) {
      const newItem = parseAst(item);
      if(newItem){
        newList.push(newItem);
      }
    }
    return newList;
  }

  /**
   * 获取一个文件的说明注释
   * @param {string} file 文件
   */
  getDocument(file) {}

};
