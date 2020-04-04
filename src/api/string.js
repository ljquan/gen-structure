
// 字符串处理
// 驼峰
function toHump(str){
    return str.replace(/[^\w]+(\w)/g, function ($0, $1) {
        return $1.toUpperCase()
    })
}

module.exports =  {
    toHump,
}
