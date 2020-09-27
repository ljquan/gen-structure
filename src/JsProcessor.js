// 入口文件
const AbstractProcessor = require('./AbstractProcessor');
const apiFs = require("./api/fs.js");
const fs = require("fs");
const path = require("path");

const regComment = /\/{2,}|\/[\*]+|[\*]+\/|^\s*[\*]+|[\*]+\s*|<!-{2,}|-{2,}>/g;

const requireReg = /require\(['"`]([^'"`]+)['"`]\)/;
const importReg = /import[^'"`]+['"`]([^'"`]+)['"`]/;
const jsExtReg = /\.ts|\.js$/;

module.exports = class Processor extends AbstractProcessor{
  constructor(dir, opt) {
    super(dir, opt);
  }
  /**
   * 计算注释文本属于介绍该代码文件说明的可能性的权重（概率）
   * @param {string} text 文本
   */
  getWeight(text) {
    if (/@param/.test(text)){
      return 0;
    }
    if (/模块|组件|@desc/.test(text)) {
      return 10;
    }
    if (/用于|处理|方便你|实现/.test(text)) {
      return 9;
    }

    if (/用|是|为/.test(text)) {
      return 8;
    }
    if (/[\u4e00-\u9fa5]/.test(text) && !/上午|下午/.test(text)) {
      // 自动生成注释可能包含中文时间
      return text.length / 10;
    }
    return text.length > 50 ? 0 : text.length / 50;
  }

  getSingleComment(text){
    const lines = text.split(/\n+/);
    return lines.map(line => {
      const str = line.replace(regComment, "").trim();
      return {
        origin: line,
        clean: str,
        weight: this.getWeight(str),
      };
    }).sort((a, b)=>b.weight - a.weight)[0];
  }
  /**
   * 获取一个文件的说明注释
   * @param {string} file 文件
   */
  getDocument(ast) {
    let list = [];
    for (let item of ast) {
      if(item.type === "comment"){
        list.push(item);
      }
      if(!item.comment){
        continue;
      }
      if(list.length === 0){
        list.push(item.comment);
      } else if (item.type === 'export-default') {
        list.push(item.comment);
      }
    }
    list = list.map(item => this.getSingleComment(item.content)).sort((a, b) => b.weight - a.weight);
    // console.log(list);

    const item = list[0];
    return item ? item.clean : '';
  }

  /**
   * 获取代码引用关系
   * @param {string} file 当前文件
   * @param {string} str 代码
   */
  addRelate(file, str) {
    if (!jsExtReg.test(file)) {
      return;
    }
    let match = str.match(requireReg);
    if (!match) {
      match = str.match(importReg);
    }
    if (!match) {
      return;
    }

    if (!(file in this.relativeMap)) {
      this.relativeMap[file] = {};
    }
    let name = /[\.\/\\]/.test(match[1][0])
      ? path.resolve(path.parse(file).dir, match[1])
      : match[1];
    this.relativeMap[file][name] = 1;
  }

  getRelateUML() {
    const list = [];
    const cwd = process.cwd();
    for (const key of Object.keys(this.relativeMap)) {
      let name = key.includes(cwd)
        ? path.relative(cwd, key).replace(jsExtReg, "")
        : key;
      for (const rel of Object.keys(this.relativeMap[key])) {
        let relName = key.includes(cwd)
          ? path.relative(cwd, rel).replace(jsExtReg, "")
          : rel;
        list.push(`[${name}] -up-> [${relName}]`);

        let hasAdd = false;
        this.umlMap.forEach((arr) => {
          if (arr[0] === relName) {
            arr.unshift(name);
            hasAdd = true;
          } else if (arr[arr.length - 1] === name) {
            arr.push(relName);
            hasAdd = true;
          }
        });
        if (!hasAdd) {
          this.umlMap.push([name, relName]);
        }
      }
    }
    const umlArr = this.umlMap.sort((a, b) => b.length - a.length);
    console.log(this.clustering(umlArr));
    return this.clustering(umlArr)
      .map((item) => this.getUMLString(item))
      .join("\n\n");
  }

  getUMLString(list) {
    return `
\`\`\`plantuml
@startuml
${list.join("\n")}
@enduml
\`\`\``;
  }

  clustering(arr, res = []) {
    if (arr.length === 0) {
      return res;
    }
    const dict = {};
    const list = [];
    const dot = arr[0][0];
    const line = {};
    const left = arr.filter((a) => {
      if (
        a[0] === dot ||
        (res.length > 2 && a.some((k) => k in dict)) ||
        a[0] in dict
      ) {
        a.forEach((item, idx) => {
          if (idx) {
            dict[item] = 1;
            const str = `[${a[idx - 1]}] -up-> [${item}]`;
            if (!line[str]) {
              line[str] = 1;
              list.push(str);
            }
          }
        });
        return false;
      }
      return true;
    });
    res.push(list);
    return this.clustering(left, res);
  }
  /**
   * 生成项目结构
   * @param {string} dir 目录地址
   * @param {number} deep 目录深度（根目录为0）
   * @param {Object} opt 选项
   */
  genStructure(fileList, deep = 0) {
    let strList = [];
    const lastIndex = fileList.length - 1;
    fileList.forEach((item, i) => {
      let tree = '';
      if(deep > 0){
        tree = (i < lastIndex ? "├" : "└") +
          Array(deep + 1)
            .fill("─")
            .join("");
      }
      if (item.type === 'file') {
        // 处理文件 - 说明
        const pathStr = `[${tree}${item.name}](${item.path})`;
        let document = item.ast ? this.getDocument(item.ast).replace(/@\w+/, ""): '';
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
            const pathStr = `[${item.name}](${item.path})`;
            if (index) {
              if (struct.length > 1) {
                strList.push(`${head}${pathStr} ${index.split(")\t")[1] || ""}`); // 文件描述用 )\t 分割
              } else {
                strList.push(`${pathStr} ${index.split(")\t")[1]}`); // 文件描述用 )\t 分割
              }
            } else if (struct.length > 1) {
              // 只有一个子目录或者只有一个文件，不打印目录
              strList.push(head + pathStr);
            }
            strList = strList.concat(struct);
          }
      } 
    });
    return strList;
  }

  async run() {
    const struct = await this.genStructure(this.dir, 0, this.opt);
    const uml = this.getRelateUML();
    return `# 依赖关系
    ${uml}

    # 代码说明
    ${struct
      .join("\n")
      .replace(
        new RegExp(this.dir.replace(path.sep, "\\" + path.sep), "g"),
        "."
      )}`;
  }
};
