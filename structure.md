# 依赖关系
```plantuml
@startuml
[src/JsProcessor] -up-> [src/AbstractProcessor]
[src/AbstractProcessor] -up-> [src/api/fs]
[src/api/fs] -up-> [fs-extra]
[src/api/fs] -up-> [readline]
[src/AbstractProcessor] -up-> [slash]
[src/JsProcessor] -up-> [slash]
@enduml
```
```plantuml
@startuml
[index] -up-> [commander]
[index] -up-> [package]
[index] -up-> [src/JsProcessor]
@enduml
```
```plantuml
@startuml
[src/run] -up-> [src/api/fs]
[src/run] -up-> [path]
@enduml
```
# 代码说明
[index.js](index.js)	命令行处理<br>
# [src](src)
[├AbstractProcessor.js](src/AbstractProcessor.js)	// 上次结束的位置为本次开始位置<br>
[├JsProcessor.js](src/JsProcessor.js)	把引用链长的排在前面<br>
[├run.js](src/run.js)	段单行注释减一<br>
## [└api](src/api)
[├─fs.js](src/api/fs.js)	通用文件系统能力<br>
[└─string.js](src/api/string.js)	字符串处理<br>
  create by [gen-structure@liquid](https://github.com/ljquan/gen-structure.git)