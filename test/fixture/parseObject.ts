// 文件注释
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
