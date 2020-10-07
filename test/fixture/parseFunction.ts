// 箭头函数：用 => 运算符定义的函数。
const a = () => { }
const b = params => ({ foo: a })
const c = ({ list }) => abc => list.concat(abc);

// 普通函数：用 function 关键字定义的函数。
function foo(){
    // code
}

// 在 class 中定义的函数。

class C {
    foo(){
        //code
    }
}

// 类：用 class 定义的类，实际上也是函数。
class Foo {
    constructor(){
        //code
    }
}

// 生成器函数：用 function * 定义的函数。
function* foo2(){
    // code
}

// 异步函数：普通函数、箭头函数和生成器函数加上 async 关键字。

async function foo4(){
    // code
}
const foo5 = async () => {
    // code
}
async function * foo6(){
    // code
}