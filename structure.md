# 依赖关系

```plantuml
@startuml
[index] -up-> [commander]
[index] -up-> [path]
[index] -up-> [package.json]
[index] -up-> [src/api/fs]
[index] -up-> [src/run]
[src/run] -up-> [src/api/fs]
[src/run] -up-> [fs]
[src/run] -up-> [path]
[src/api/fs] -up-> [fs-extra]
[src/api/fs] -up-> [path]
[src/api/fs] -up-> [readline]
@enduml
```

# 代码说明
[./index.js](./index.js)	命令行处理<br>
[./src/run.js](./src/run.js)	入口文件<br>
## [./src/api](./src/api)
[├───fs.js](./src/api/fs.js)	通用文件系统能力<br>
[└───string.js](./src/api/string.js)	字符串处理<br>
  create by [gen-structure@liquid](https://github.com/ljquan/gen-structure.git)