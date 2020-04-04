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
  let commentStart = false;
  for(let str of lines){
    if(/\s*import\s|require\(|^@use|^@import/.test(str) || !str){
      continue;
    }

    if(/^\/\*|<!-{2,}/.test(str)){
      commentStart = true;
    }else if(/\*{1,}\/|-{2,}>/.test(str) && commentStart){
      commentStart = false;
    } else if(!(/^\/{2,}/.test(str) || commentStart)){
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

async function genStructure(dir, deep = 0, opt){
  let strList = [];
  const fileList = apiFs.getFile(dir);
  const dirList = apiFs.getDir(dir);
  for(let file of fileList){
    const text = await getDocument(path.join(dir, file));
    // console.log('text', text);
    if(text){
      strList.push('`' + path.join(dir, file) + `\`\t${text.replace(/@\w+/, '')}<br>`);
    }
  }

  for(let subDir of dirList){
    if(opt && opt.exclude && opt.exclude.test(subDir)){
      if(!(opt.include && opt.include.test(subDir))){
        continue;
      }
    }
    // console.log('subDir', subDir);
    let struct = await genStructure(path.resolve(dir, subDir), deep+1);
    if(struct){
      let index = '';
      let dirNum = 0;
      struct = struct.filter(file=>{
        if(/index\.[^\///\.]+$/.test(file) && !index){
          index = file;
          return false;
        }else if(!file.includes('`\t')){
          dirNum ++;
        }
        return true;
      });
      let dirDoc = Array(deep+1).fill('#').join('') + ' ' + path.join(dir, subDir);
      if(index){
        strList.push(dirDoc + ` ${index.split('`\t')[1]}`); // 文件描述用 `\t 分割
      }else if(struct.length > 1 && dirNum !== 1){ // 只有一个子目录或者只有一个文件，不打印目录
        strList.push(dirDoc);
      }
      strList = strList.concat(struct);
    }
  }
  return strList;
}


module.exports = async function run(dir, opt){
  const myDir = path.resolve(dir);
  const struct = await genStructure(myDir, 0, opt);
  return struct.join('\n').replace(new RegExp(myDir.replace(path.sep, '\\' + path.sep), 'g'), '.');
}
