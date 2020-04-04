// 入口文件
const apiFs = require('./api/fs.js');
const fs = require('fs');
const path = require('path');

const regComment = /\/{2,}|\/[\*]+|[\*]+\/|^\s*[\*]+|[\*]+\s*|<!-{2,}|-{2,}>/g;

function getWeight(text) {
  if (/模块|组件|@desc/.test(text)) {
    return 10;
  }
  if (/用于|处理|方便你|实现/.test(text)) {
    return 9;
  }

  if (/用|是|为/.test(text)) {
    return 8;
  }
  if (/[\u4e00-\u9fa5]/.test(text)) {
    return 7;
  }
  return 0;
}

async function getDocument(file) {
  const doc = await apiFs.readLine(file, 50);
  const lines = doc.split(/\s*[\r\n]+\s*/);
  let arr = [];
  let commentStart = false;
  for (let str of lines) {
    if (/\s*import\s|require\(|^@use|^@import/.test(str) || !str) {
      continue;
    }

    if (/^\/\*|<!-{2,}/.test(str)) {
      commentStart = true;
    } else if (/\*{1,}\/|-{2,}>/.test(str) && commentStart) {
      commentStart = false;
    } else if (!(/^\/{2,}/.test(str) || commentStart)) {
      break;
    }
    const text = str.replace(regComment, '').trim();
    if (text && !(/eslint|@ts|lint/.test(text) && !/[\u4e00-\u9fa5]/.test(text))) {
      arr.push({
        text,
        weight: getWeight(text)
      });
    }
  }
  arr = arr.sort((a, b) => b.weight - a.weight);
  return arr[0] && arr[0].text;
}

async function genStructure(dir, deep = 0, opt) {
  let strList = [];
  const fileList = apiFs.getFile(dir);
  const dirList = apiFs.getDir(dir);
  const textList = [];
  for (let file of fileList) {
    if (/\.(ico|svg|png|jpg|png|exe|jpeg|md|json|d\.ts|html)$/.test(file)) { // 跳过非代码文件
      // console.log('file', file);
      continue;
    }
    const filePath = path.resolve(dir, file);
    // console.log('filePath', filePath);
    const text = await getDocument(filePath);
    // console.log('text', text);
    if (text) {
      textList.push([text, file, filePath]);
    }
  }
  let last = textList.length - 1;
  textList.forEach(([text, file, filePath], i) => {
    // 处理文件 - 说明
    if (last > 0) {
      const tree = (i < last ? '├' : '└') + Array(deep + 1).fill('─').join('');
      const pathStr = `[${tree}${file}](${filePath})`;
      strList.push(`${pathStr}\t${text.replace(/@\w+/, '')}<br>`);
    }else{
      strList.push(`[${filePath}](${filePath})\t${text.replace(/@\w+/, '')}<br>`);
    }
  })

  for (let subDir of dirList) {
    if (opt && opt.exclude && opt.exclude.test(subDir)) {
      if (!(opt.include && opt.include.test(subDir))) {
        continue;
      }
    }
    // console.log('subDir', subDir);
    let struct = await genStructure(path.resolve(dir, subDir), deep + 1);
    if (struct) {
      let index = '';
      let dirNum = 0;
      struct = struct.filter(file => {
        if (/index\.[^\///\.]+$/.test(file) && !index) {
          index = file;
          return false;
        } else if (!file.includes(')\t')) {
          dirNum++;
        }
        return true;
      });
      const head = Array(deep + 1).fill('#').join('') + ' ';
      const dirDoc = path.join(dir, subDir);
      const pathStr = `[${dirDoc}](${dirDoc})`;
      if (index) {
        if (struct.length > 1) {
          strList.push(`${head}${pathStr} ${index.split(')\t')[1]}`); // 文件描述用 )\t 分割
        } else {
          strList.push(`${struct.length > 1 ? head : ''}${pathStr} ${index.split(')\t')[1]}`); // 文件描述用 )\t 分割
        }
      } else if (struct.length > 1 && dirNum !== 1) { // 只有一个子目录或者只有一个文件，不打印目录
        strList.push(head + pathStr);
      }
      strList = strList.concat(struct);
    }
  }
  last = strList.length - 1;
  if (last > -1) {
    strList[last] = strList[last].replace('├', '└');
  }
  return strList;
}


module.exports = async function run(dir, opt) {
  // console.log('run', dir, opt);
  const myDir = path.resolve(dir);
  const struct = await genStructure(myDir, 0, opt);
  // console.log('struct', struct);
  return struct.join('\n').replace(new RegExp(myDir.replace(path.sep, '\\' + path.sep), 'g'), '.');
}
