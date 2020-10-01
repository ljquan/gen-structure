// 通用文件系统能力
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

//判断路径是否存在
async function getStat(tarPath) {
  const stat = await fs.stat(tarPath).catch(()=>false);
  return stat;
}

//判断文件是否存在
async function isFile(tarPath) {
  const stat = await fs.stat(tarPath);
  return stat && stat.isFile();
}

//判断目录是否存在
async function isDir(tarPath) {
  const stat = await getStat(tarPath);
  return stat && stat.isDirectory();
}


//获取当前目录下的文件夹
function getDir(dir) {
  let results = [];
  let list = fs.readdirSync(dir);
  list.forEach(function (file) {
    let stat = fs.statSync(dir + '/' + file);
    if (stat && stat.isDirectory()) results.push(file);
  });
  return results;
}

// 类似require.resolve，获得最可能的文件
function resolve(filePath) {
  let results = [];
  try{
    let state = fs.statSync(filePath);
    if (state.isDirectory()){
      filePath = path.resolve(filePath, 'index');
    }
  }catch(e){
    // noop
  }
  const fileState = path.parse(filePath);
  // console.log(fileState);
  let list = fs.readdirSync(fileState.dir);
  list.forEach(function (file) {
    const state = path.parse(file);
    if (fileState.base === state.base) {
      results.push({
          base: state.base,
          weigth: 3
      });
    } else if (fileState.name === state.name) {
      results.push({
        base: state.base,
        weigth: /js|ts/.test(state.ext) ? 2 : (state.ext === 'vue' ? 1 : 0)
      });
    }
  });
  const file =results.sort((a, b) => b.weigth - a.weigth)[0];
  if(file){
    return path.resolve(fileState.dir, file.base);
  }
  return filePath;
}

//获取当前目录下的文件
function getFile(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    const stat = fs.statSync(dir + '/' + file);
    if (stat && stat.isFile()) results.push(file);
  });
  return results;
}

//获取当前目录下的文件及文件夹
function getFileAndDir(dir, filter) {
  let results = [];
  let dirList = [];
  let list = fs.readdirSync(dir);
  filter = filter || (() => true);
  list.forEach(function (file) {
    let stat = fs.statSync(dir + '/' + file);
    if (stat && stat.isDirectory()){
      dirList.push(file);
    }else if(stat && stat.isFile()){
      const absPath = path.resolve(dir, file);
      if(filter(absPath)){
        results.push({
          path: absPath,
          type: 'file',
          name: file,
        });
      }
    }
  });
  // 按字母顺序排
  results = results.sort(function(a,b){return a.name.localeCompare(b.name)});
  dirList = dirList.sort(function(a,b){return a.localeCompare(b)});
  for(const file of dirList){
    const absPath = path.resolve(dir, file);
    if(filter(absPath)){
      results.push({
        path: absPath,
        type: 'dir',
        name: file,
        children: getFileAndDir(absPath, filter)
      });
      // results = results.concat(getFileAndDir(absPath, filter));
    }
  }
  return results;
}

//获取该目录下文件名及其内容，返回一个对象，{文件名： '文件内容'};
function getFileDict(dir) {
  const results = getFile(dir);
  const dict = {};
  results.forEach(function (item) {
    dict[item.replace(/\.[^\.]+$/, '')] = readFileSync(path.join(dir, item));
  });
  return dict;
}

//同步读取单个文件内容
function readFileSync(src) {
  return fs.readFileSync(src).toString();
}

//获取当前文件绝对路径--当前项目
function getPwdPath(src) {
  return path.join(process.cwd(), src);
}

//同步读取相对路径文件内容
function readPwdFile(src) {
  return readFileSync(getPwdPath(src));
}

//同步写入文件
function writeFileSync(src, content) {
  fs.mkdirpSync(src.replace(/[^\\\/]+$/, ''));
  fs.writeFileSync(src, content);
}

//向文件中添加内容
function append(src, content, reg, target) {
  let data = readFileSync(src);
  if (reg) {
    //如果传入了正则表达式，说明是要在指定位置插入内容
    data = data.replace(reg, content); // 如果要替换reg部分内容，可以在传入的content后面加上： \n$&
  } else {
    //若没有传入正则表达式，说明是单纯的加在原文件内容末尾
    data += content;
  }
  writeFileSync(target || src, data);
}
/**
 * 按行读取（不要用于min文件一行内容太多，导致读取缓慢）
 * @param {string} file 文件
 * @param {number} number 行数
 */
function readLine(file, number){

  return new Promise(function(resolve){
    let str = '';
    let no = 0;
    let fRead = fs.createReadStream(file);
    let objReadline = readline.createInterface({
        input:fRead,
        terminal: true
    });
    // 避免处理图片文件自动退出
    objReadline.on('SIGTSTP', function () {});
    objReadline.on('line',function (line) {
      str += line + '\n';
      no++;
      if(no === number){
        objReadline.close();
        fRead.close();
      }
  });
    objReadline.on('close',function () {
      resolve(str.trimRight());
    });
  });
}

module.exports = {
  isFile,
  isDir,
  getDir,
  getFile,
  getPwdPath,
  getFileDict,
  readFileSync,
  readPwdFile,
  writeFileSync,
  append,
  readLine,
  getFileAndDir,
  resolve,
};

