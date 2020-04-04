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
  .option('-s, --suffix <type>', '支持的文件后缀名。默认：ts，js，css，scss等s结尾的文件')


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


let suffix = '\\.[^.]+s$';

if(program.suffix){
  suffix += '|' + program.suffix;
}
option.suffix = new RegExp(suffix, 'i');

run(dir, option).then(str=>{
  let dist = program.dist;
  if(!dist){
    dist = path.resolve(process.cwd(), './structure.md');
  }
  apiFs.writeFileSync(dist, str);
  console.log(str);
  console.log('处理完成', dist);
});
