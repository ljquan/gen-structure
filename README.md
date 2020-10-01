# gen-structure

## 说明
生成当前项目的目录结构说明文档。从代码文件分析出当前代码文件的描述，得到路径+描述的形式，便于清楚地了解项目概况。


## 使用方法
```sh
npm i gen-structure -g #安装
gen-structure # 在你的目录下执行
```

## 效果
默认会生成`structure.md`文件,如下
```md
`./structure.md`	`./src/run.js`	入口文件<br><br>
`./src/run.js`	入口文件<br>
## ./src/api
`./src/api/fs.js`	通用文件系统能力<br>
`./src/api/string.js`	字符串处理<br>

<br>create by [gen-structure](https://github.com/ljquan/gen-structure.git)
```


Usage: gen-structure [options]

Options:
  -V, --version         output the version number
  -d, --dist <type>     目标文件
  -p, --path <type>     项目路径，默认命令行所在路径
  -e, --exclude <type>  忽略的路径，默认点开头、node_module的路径
  -i, --include <type>  加入被默认忽略的路径
  -h, --help            output usage information


  