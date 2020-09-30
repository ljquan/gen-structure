// 入口文件
const AbstractProcessor = require("./AbstractProcessor");
const path = require("path");

const regComment = /\/{2,}|\/[\*]+|[\*]+\/|^\s*[\*]+|[\*]+\s*|<!-{2,}|-{2,}>/g;

module.exports = class Processor extends AbstractProcessor {
  constructor(dir, opt) {
    super(dir, opt);
  }
  /**
   * 计算注释文本属于介绍该代码文件说明的可能性的权重（概率）
   * @param {string} text 文本
   */
  getWeight(text) {
    if (/@param/.test(text)) {
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
  /**
   * 获取单行注释说明
   * @param {string} text 一段注释内容
   */
  getSingleComment(text) {
    const lines = text.split(/\n+/);
    return lines
      .map((line) => {
        const str = line.replace(regComment, "").trim();
        return {
          origin: line,
          clean: str,
          weight: this.getWeight(str),
        };
      })
      .sort((a, b) => b.weight - a.weight)[0];
  }
  /**
   * 获取一个文件的说明注释
   * @param {any[]} ast 代码语法树
   */
  getDocument(ast) {
    let list = [];
    for (let item of ast) {
      if (item.type === "comment") {
        list.push(item);
        continue;
      }
      if (!item.comment) {
        continue;
      }
      if (list.length === 0) {
        list.push(item.comment);
      } else if (item.type === "export-default") {
        list.push(item.comment);
      }
    }
    list = list
      .map((item) => this.getSingleComment(item.content))
      .sort((a, b) => b.weight - a.weight);
    // console.log(list);

    const item = list[0];
    return item ? item.clean : "";
  }

  /**
   * 处理依赖关系
   * @param {any[]} ast 代码语法树
   */
  processImport(fileList) {
    if (!(fileList && fileList.length)) {
      throw new Error("未找到代码文件");
    }
    const importDict = {};
    const cwd = process.cwd();
    const umlMap = [];
    const getRequire = (flist) => {
      flist.forEach((item) => {
        if (item.type === "file" && item.ast && item.ast.length) {
          let relDict = {};
          const file = path.relative(cwd, item.path).replace(/\.\w+$/, "");
          item.ast
            .filter((o) =>
              ["import", "require", "export-import"].includes(o.type)
            )
            .forEach((ast) => {
              let rel = /[\.\/\\]/.test(ast.content)
                ? path.relative(
                    cwd,
                    path.resolve(path.parse(item.path).dir, ast.content)
                  )
                : ast.content;
              rel = rel.replace(/\.\w+$/, "");

              if(!(file in importDict)){
                importDict[file] = [];
              }
              if(!(rel in relDict)){
                relDict[rel] = 1;
                importDict[file].push(rel);
              }
              let hasAdd = false;
              umlMap.forEach((arr) => {
                if (arr[0] === rel) {
                  arr.unshift(file);
                  hasAdd = true;
                } else if (arr[arr.length - 1] === file) {
                  arr.push(rel);
                  hasAdd = true;
                }
              });
              if (!hasAdd) {
                umlMap.push([file, rel]);
              }
            });
        } else if (
          item.type === "dir" &&
          item.children &&
          item.children.length
        ) {
          getRequire(item.children);
        }
      });
    };

    getRequire(fileList);
    // console.log('importDict', JSON.stringify(importDict, null, 2));
    const umlList = umlMap.sort((a, b) => b.length - a.length);
    // console.log('umlList', umlList[0]);
    function getUMLString(list) {
      return `
    \`\`\`plantuml
    @startuml
    ${list.join("\n")}
    @enduml
    \`\`\``;
    }
    return this.clustering(umlList, importDict).map(item=>getUMLString(item)).join('\n\n');
  }

  clustering(arr, importDict) {
    const dict = Object.assign({}, importDict);
    // 递归添加子依赖
    const addRel = function(arr, source){
      if(dict[source] && dict[source].length){
        const relList = dict[source];
        delete dict[source];
        relList.forEach(rel=>{
          arr.push([source, rel]);
          addRel(arr, rel);
        });
      }
    }
    // 聚合
    const clust = [];
    for(const item of arr){
      let subList = [];
      let level = 0;
      for(let i = item.length - 2; i >= 0; i--){
        const o = item[i];
        // console.log(o, dict[o]);

        if(level){
          level++;
        }else{
          level = 2;
        }
        // console.log('subList.length', subList.length, 'i', i, 'clust', clust.length);
        if(subList.length > 10 && i > 2){
          clust.push({
            level,
            list: subList,
            item: item.slice(i),
          });
          subList = [];
          level = 0;
        }
        addRel(subList, o);
      }
      if(level > 0 && subList.length > 0){
        clust.push({
          level,
          list: subList,
          item,
        });
      }
    }

    // console.log('clust', JSON.stringify(clust, null, 2))
    let list = [];
    let subList = [];
    let relDict = {};
    for(const item of clust){
      if(subList.length === 0){
        item.list.forEach((sourceRel)=>{
          subList.push(`[${sourceRel[0]}] -up-> [${sourceRel[1]}]`);
        });
        item.item.forEach(o=>relDict[o]=1);
      }else{
        list.push(subList);
        subList = [];
        relDict = {};
        item.list.forEach((sourceRel)=>{
          subList.push(`[${sourceRel[0]}] -up-> [${sourceRel[1]}]`);
        });
        item.item.forEach(o=>relDict[o]=1);
      }
    }
    if(subList.length){
      list.push(subList);
    }
    // console.log('list', JSON.stringify(list, null, 2));
    return list;
  }


  async run() {
    const files = this.getFiles();
    const struct = this.genStructure(files);

    return `# 依赖关系
    ${this.processImport(files)}

    # 代码说明
    ${struct
      .join("\n")
      }`.replace(/\n\s+/g, '\n');
  }
};
