
//
const definedObject = {
    // 注释 4.1
    hello() {
        // 注释 4.1.1
        return true;
    },

};


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