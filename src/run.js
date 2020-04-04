// 入口文件
const apiFs = require('./api/fs.js');
const fs = require('fs');
const path = require('path');

const regComment = /\/{2,}|\/[\*]+|[\*]+\/|^\s*[\*]+|[\*]+\s*|<!-{2,}|-{2,}>/g;

function getWeight(text){
  if(/模块|组件|@desc/.test(text)){
    return 10;
  }
  if(/用于|处理|方便你|实现/.test(text)){
    return 9;
  }

  if(/用|是|为/.test(text)){
    return 8;
  }
  if(/[\u4e00-\u9fa5]/.test(text)){
    return 7;
  }
  return 0;
}

async function getDocument(file){
  const doc = await apiFs.readLine(file, 50);
  const lines = doc.split(/\s*[\r\n]+\s*/);
  let arr = [];
  for(let str of lines){
    if(/\s*import\s|require\(|^@use|^@import/.test(str) || !str){
      continue;
    }
    if(!/^\/{2,}|^\/\*|^\*|<!-{2,}|[\u4e00-\u9fa5]+/.test(str)){
      break;
    }
    const text = str.replace(regComment, '').trim();
    if(text && !(/eslint|@ts|lint/.test(text) && !/[\u4e00-\u9fa5]/.test(text))){
      arr.push({
        text,
        weight: getWeight(text)
      });
    }
  }
  arr = arr.sort((a, b)=>b.weight - a.weight);
  return arr[0] && arr[0].text;
}

let suffix;

async function genStructure(dir, deep = 0, opt){
  suffix = suffix || opt.suffix;
  let str = '';
  const fileList = apiFs.getFile(dir);
  const dirList = apiFs.getDir(dir);
  for(let file of fileList){
    if(suffix && !suffix.test(file)){
      continue;
    }
    const text = await getDocument(path.join(dir, file));
    // console.log('text', text);
    if(text){
      str += '`' + path.join(dir, file) + `\` ${text.replace(/@\w+/, '')}<br>\n`;
    }
  }

  for(let subDir of dirList){
    if(opt && opt.exclude && opt.exclude.test(subDir)){
      if(!(opt.include && opt.include.test(subDir))){
        continue;
      }
    }
    // console.log('subDir', subDir);
    const struct = await genStructure(path.resolve(dir, subDir), deep+1);
    if(struct){
      str += Array(deep+1).fill('#').join('') + ' ' + path.join(dir, subDir) + '\n';
      str += struct;
    }
  }
  return str;
}


module.exports = async function run(dir, opt){
  const myDir = path.resolve(dir);
  const struct = await genStructure(myDir, 0, opt);
  return struct.replace(new RegExp(myDir.replace(path.sep, '\\' + path.sep), 'g'), '.');
}
