// 入口文件
const AbstractProcessor = require("./AbstractProcessor");
const path = require("path");
const apiFs = require("./api/fs.js");

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
    // 依赖字典
    const importDict = {};
    const cwd = process.cwd();
    const umlMap = [];

    // 递归获取依赖字典以及依赖链路
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
              let rel = /^[\.\/\\]/.test(ast.content)
                ? path.relative(
                    cwd,
                    apiFs.resolve(path.resolve(path.parse(item.path).dir, ast.content))
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
              // 把引用关系添加到引用链中
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
    // apiFs.writeFileSync(path.resolve(process.cwd(), 'fileList.json'), JSON.stringify(fileList, null, 2));
    // apiFs.writeFileSync(path.resolve(process.cwd(), 'importDict.json'), JSON.stringify(importDict, null, 2));
    // console.log('importDict', JSON.stringify(importDict, null, 2));
    // 把引用链长的排在前面
    const linkDict = {};
    const umlList = umlMap.sort((a, b) => b.length - a.length).filter(arr=>{
      let ret = !(arr[0] in linkDict);
      // 避免重复绘制，把前面已经在引用链中的链路去掉
      for(let o of arr){
        linkDict[o] = 1;
      }
      return ret;
    });
    // console.log('linkDict', JSON.stringify(linkDict, null, 2));
    // console.log('umlList', JSON.stringify(umlList, null, 2));
    function getUMLString(list) {
      return `
    \`\`\`plantuml
    @startuml
    ${list.join("\n")}
    @enduml
    \`\`\``;
    }
    // apiFs.writeFileSync(path.resolve(process.cwd(), 'importDict.json'), JSON.stringify(this.clustering(umlList, importDict), null, 2));
    // // console.log(JSON.stringify(this.clustering(umlList, importDict), null, 2));
    // return '';
    return this.clustering(umlList, importDict).map(item=>getUMLString(item)).join('\n\n');
  }

  clustering(arr, importDict) {
    let dict = Object.assign({}, importDict);
    const countDict = {};
    // 递归添加子依赖链路
    const addRel = function(subArr){
      let list = [];
      const source = subArr[subArr.length - 1];
      if(dict[source] && dict[source].length){
        const relList = dict[source];
        delete dict[source];
        relList.forEach(rel => {
          const copyArr = subArr.slice();
          copyArr.push(rel);
          const pathList = addRel(copyArr);
          list.push.apply(list, pathList);
        });
      } else {
        list.push(subArr);
      }
      list = list.sort((a, b) => b.length - a.length);
      if (countDict[source]) {
        if (countDict[source].count < list.length) {
          countDict[source] = {
            count: list.length,
            list
          };
        }
      } else {
        countDict[source] = {
          count: list.length,
          list
        };
      }
      return list;
    }
    for(const item of arr){
      // 从后往前绘图，便于减少颗粒度
      addRel([item[0]]);
    }
    // 计算路径数量及深度
    let countList = [];
    for(const key of Object.keys(countDict)){
      if (countDict[key].count > 1) {
        const countItem = countDict[key];
        const level = Math.max.apply(null, countItem.list.map(o => o.length - o.lastIndexOf(key)));
        countItem.level = level;
        countList.push({
          key,
          // 路径数量
          count: countDict[key].count,
          // 深度
          level
        });
      }
    }
  
    countList = countList.sort((a, b) => {
      let ret = a.level - b.level;
      if(ret === 0 ){
        return a.count - b.count;
      }
      return ret;
    });

    dict = Object.assign({}, importDict);
    // 递归添加子依赖
    const drawEdge = function (arr, source) {
      if (dict[source] && dict[source].length) {
        const relList = dict[source];
        delete dict[source];
        relList.forEach(rel => {
          arr.push([source, rel]);
          if ((!countDict[rel]) || (!countDict[source]) || (countDict[rel].level < countDict[source].level)) {
            drawEdge(arr, rel);
          }
        });
      }
    }
    // 聚合
    const clust = [];
    let drawBackIndex = -1;
    // apiFs.writeFileSync(path.resolve(process.cwd(), 'countList.json'), JSON.stringify(countList, null, 2));
    countList.forEach((item, idx)=>{
      // 从一个中等规模的图开始画起：一个图通路少于10条，且层级少于5
      if(item.count < 10 && item.level < 5){
        drawBackIndex = idx;
      }else{
        // console.log(item);
        let subList = [];
        drawEdge(subList, item.key);
        if (subList.length > 0) {
          clust.push(subList);
        }
      }
    });
    for (; drawBackIndex >= 0; drawBackIndex--) {
      const item = countList[drawBackIndex];
      let subList = [];
      drawEdge(subList, item.key);
      if (subList.length > 0) {
        clust.push(subList);
      }

    }

    // console.log('clust', JSON.stringify(clust, null, 2))
    let list = [];
    let subList = [];
    for(const item of clust){
      if (subList.length > 0) {
        list.push(subList);
        subList = [];
      }
      const edgeDict = {};
      item.forEach((sourceRel) => {
        const [source, rel] = sourceRel;
        if (edgeDict[source]){
          edgeDict[source]++;
        } else {
          edgeDict[source] = 1;
        }
        if (edgeDict[source] > Math.max(5, Math.floor(importDict[source].length / 2) || 0)) {
          subList.push(`[${source}] --> [${rel}]`);
        } else {
          subList.push(`[${source}] -up-> [${rel}]`);
        }
      });
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
