# 依赖关系
```plantuml
@startuml
[src/JsProcessor] -up-> [src/AbstractProcessor]
[src/AbstractProcessor] -up-> [src/api/fs]
[src/api/fs] -up-> [fs-extra]
[src/api/fs] -up-> [path]
[src/api/fs] -up-> [readline]
[src/AbstractProcessor] -up-> [path]
[src/JsProcessor] -up-> [path]
[src/JsProcessor] -up-> [src/api/fs]
@enduml
```
```plantuml
@startuml
[src/run] -up-> [src/api/fs]
[src/run] -up-> [fs]
[src/run] -up-> [path]
@enduml
```
```plantuml
@startuml
[index] -up-> [commander]
[index] -up-> [path]
[index] -up-> [package]
[index] -up-> [src/api/fs]
[index] -up-> [src/JsProcessor]
@enduml
```
# 代码说明
[index.js](index.js)	命令行处理<br>
# [src](src)
[├AbstractProcessor.js](src/AbstractProcessor.js)	入口文件<br>
[├JsProcessor.js](src/JsProcessor.js)	入口文件<br>
[├run.js](src/run.js)	入口文件<br>
## [└api](src/api)
[├─fs.js](src/api/fs.js)	通用文件系统能力<br>
[└─string.js](src/api/string.js)	字符串处理<br>
  create by [gen-structure@liquid](https://github.com/ljquan/gen-structure.git)