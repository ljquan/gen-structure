#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const packageJson = require('./package.json');
const apiFs = require('./src/api/fs.js');
const run = require('./src/run');


program
  .version(packageJson.version)

program
  .option('-d, --dist <type>', '目标文件')
  .option('-p, --path <type>', '项目路径，默认命令行所在路径')
  .option('-e, --exclude <type>', '忽略的路径，默认点开头、node_module的路径')
  .option('-i, --include <type>', '加入被默认忽略的路径')


program.parse(process.argv);

// console.log('process.argv', process.argv);



let exclude = 'node_modules|\\..*|dist';
const option = {};
let dir = path.resolve(program.path || process.cwd());

if(program.exclude){
  exclude += '|' + program.exclude;
}

if(program.include){
  option.include = new RegExp(program.include, 'i');;
}
option.exclude = new RegExp(exclude, 'i');


run(dir, option).then(str=>{
  let dist = program.dist;
  if(!dist){
    dist = path.resolve(process.cwd(), './structure.md');
  }
  apiFs.writeFileSync(dist, str + `




<style>
a{
  font-family:Arial,"PingFang SC","Microsoft YaHei",sans-serif,"Apple Color Emoji","Segoe UI Emoji";
  text-decoration: none!important;
}
a:hover{
  text-decoration: none!important;
}
h1 a{
    font-size: 26px;
}
h2 a{
    font-size: 22px;
}
h3 a{
    font-size: 18px;
}
h4 a{
    font-size: 14px;
}
h5, h6, h7{
    font-size: 12px;
}
h8, h9, h10{
    font-size: 10px;
}
h1 {
    font-size: 14px;
}
h2 {
    font-size: 14px;
}
h3 {
    font-size: 14px;
}
h4 {
    font-size: 14px;
}
</style> <br>


create by [${packageJson.name}@${packageJson.author}](${packageJson.repository.url})`);
  // console.log(str);
  console.log('处理完成', dist);
});
