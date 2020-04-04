# gen-structure

## 说明
生成当前项目目录结构说明文档。


## 使用方法
```sh
npm i gen-structure -g #安装
gen-structure # 在你的目录下执行
```

Usage: gen-structure [options]

Options:
  -V, --version         output the version number
  -d, --dist <type>     目标文件
  -p, --path <type>     项目路径，默认命令行所在路径
  -e, --exclude <type>  忽略的路径，默认点开头、node_module的路径
  -i, --include <type>  加入被默认忽略的路径
  -s, --suffix <type>   支持的文件后缀名。默认：ts，js，css，scss等s结尾的文件
  -h, --help            output usage information