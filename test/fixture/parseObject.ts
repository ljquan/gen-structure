  
// 文件注释
// import 注释0
const JsProcessor = require("../src/JsProcessor.js") ; //import 注释
 //import 注释2
const AbstractProcessor = require("../src/AbstractProcessor.js") ; //import 注释3
// 对象注释
const definedObject = {
    // 注释 4.1
    hello() {
        // 注释 4.1.1
        return true;
    },

};

/**
 * 导出对象
 */
module.exports = {
  hello(){
    // noop
  },
  world(){
    // 内部函数
    const innerFun = function(){
      //
    }
  }
}




export const exportObj = {
  /**
   * expFun
   */
  expFun(){

  }
};
