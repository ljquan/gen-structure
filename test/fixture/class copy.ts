
/**
 * 1、注释与定义相邻的情况
 */
class Greeter {
    greeting: string;
    /**
     * 2、class中的方法注释-多行
     * @param message 信息
     */
    constructor(message: string) {
        // 2.1 函数中的函数
        function test(){
            /**
             * 2.1 函数中的函数的其他注释-多行（被滤掉）
             */
            return true;
        }
        // 2.2 函数中的其他注释-单行（被滤掉）
        this.greeting = message;
    }

    // 3、class中的注释-单行
    greet() {
        const obj = {
            // 3.1 函数中的对象的函数注释 
            hello(){
                // 注释 3.1.1
                return true;
            },
        };
        // 注释3.2
        return "Hello, " + this.greeting;
    }
    /* 3、class中的注释- /**\/单行 */
    toString() {
        const obj = {
            // 注释 3.1
            hello() {
                // 注释 3.1.1
                return true;
            },
        };
        // 注释3.2
        return "Hello, " + this.greeting;
    }
}
// 注释4
let greeter = new Greeter("world");
const obj = {
    // 注释 4.1
    hello() {
        // 注释 4.1.1
        return true;
    },
};