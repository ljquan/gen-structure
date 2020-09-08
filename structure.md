# 依赖关系

```plantuml
@startuml
[index.js] -down-> [commander]
[index.js] -down-> [path]
[index.js] -down-> [package.json]
[index.js] -up-> [src/api/fs.js]
[index.js] -down-> [src/run]
[src/run.js] -up-> [src/api/fs.js]
[src/run.js] -down-> [fs]
[src/run.js] -down-> [path]
[src/api/fs.js] -down-> [fs-extra]
[src/api/fs.js] -down-> [path]
[src/api/fs.js] -down-> [readline]
@enduml
```

# 代码说明
[./index.js](./index.js)	命令行处理<br>
[./src/run.js](./src/run.js)	入口文件<br>
## [./src/api](./src/api)
[├───fs.js](./src/api/fs.js)	通用文件系统能力<br>
[└───string.js](./src/api/string.js)	字符串处理<br>
  create by [gen-structure@liquid](https://github.com/ljquan/gen-structure.git)