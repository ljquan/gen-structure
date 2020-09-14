// 入口文件
const apiFs = require("./api/fs.js");
const fs = require("fs");
const path = require("path");

const regComment = /\/{2,}|\/[\*]+|[\*]+\/|^\s*[\*]+|[\*]+\s*|<!-{2,}|-{2,}>/g;

const requireReg = /require\(['"`]([^'"`]+)['"`]\)/;
const importReg = /import[^'"`]+['"`]([^'"`]+)['"`]/;
const jsExtReg = /\.ts|\.js$/;

module.exports = class AbstractProcessor {

  constructor(dir, opt) {
    this.dir = path.resolve(dir);
    this.opt = opt;
    this.umlMap = [];
    this.astParse = Object.assign({
      comment(line){

      },
      class(line){

      },
      method(line){

      },
      import(line){

      },
      export(line){

      },
    }, opt.astParse);
    // 需要按照先comment, 后代码的顺序
    this.astKey = ['comment'].concat(Object.keys(this.astParse).filter(key=>key!=='comment'));

    // 注释
    this.relativeMap = {};
  }

  getAst(line){
    const list = [];
    // 这里简单处理。假设一行里面最多存在2种语句。代码+注释，或者只有类声明，或者只有函数声明
    for(const key of this.astKey){
      const item = this.astParse[key](line);
      if(!item){
        continue;
      }
      if(item.append){
        list.push(append);
      }

      if(item.remain){
        line = item.remain;
      }else{
        break;
      }
    }
    return list;
  }

  /**
   * 把文本处理成类似AST的结构
   * @param {string} text 文本
   */
  parse(text){
    const lines = text.split(/\s*[\r\n]+\s*/);
    const blockList = [];
    const rsp = [];
    const astParse = this.astParse;
    let block = {};
    for(const line of lines){
      const astList = this.getAst(line);
      for(const ast of astList){
        if(ast.action==='push'){
          blockList.push(ast);
        }else if(ast.action==='pop' && blockList.length > 0){
          let astTmp = blockList.pop();
          let blist = [];
          while(astTmp && astTmp.actionTag !== astTmp.actionTag){
            blist.push(astTmp);
            astTmp = blockList.pop();
          }
          astTmp.children = blist.reverse();
        }else{
          rsp.push(ast);
        }
      }
    }
    return rsp;
  }
  /**
   * 处理的文件(代码文件)
   * @param {string} name
   */
  acceptFile(name){
    return /\.ts$|\.js$/.test(name);
  }
  /**
   * 生成项目结构
   * @param {string} dir 目录地址
   * @param {number} deep 目录深度（根目录为0）
   * @param {Object} opt 选项
   */
  async genStructure(dir, deep = 0, opt) {

  }

  /**
   * 过滤掉不关注的目录，如.git等
   * @param {string} absPath
   */
  pathFilter(absPath){
    const opt = this.opt || {
      exclude: /\.git|.vscode|node_modules/
    };
    if (opt.exclude && opt.exclude.test(absPath)) {
      if (!(opt.include && opt.include.test(absPath))) {
        return false;
      }
    }
    return true;
  }

  getFiles(){
    const list = apiFs.getFileAndDir(this.dir, this.pathFilter.bind(this));
    const newList = [];
    for(const item of list){
      if(item.type === 'file'){
        if(this.acceptFile(item.name)){
          newList.push(Object.assign({}, item, {
            ast: this.parse(apiFs.readFileSync(item.path)),
          }));
        }
      }else{
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
  async getDocument(file) {

  }

  /**
   * 获取代码引用关系
   * @param {string} file 当前文件
   * @param {string} str 代码
   */
  addRelate(file, str) {

  }

  getRelateUML() {
    return '';
  }

  getUMLString(list) {
    return `
\`\`\`plantuml
@startuml
${list.join("\n")}
@enduml
\`\`\``;
  }
  getDetail(){
    return '';
  }
  get structure() {
    const list = this.getFiles();
    return '# 依赖关系\n' + this.getRelateUML(list) + '# 代码说明\n' + this.getDetail(list);
  }
};
