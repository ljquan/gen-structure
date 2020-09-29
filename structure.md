# 依赖关系
```plantuml
@startuml
[test/JsProcessor.test] -up-> [src/JsProcessor]
[src/JsProcessor] -up-> [src/AbstractProcessor]
[src/AbstractProcessor] -up-> [src/api/fs]
[src/api/fs] -up-> [fs-extra]
[src/AbstractProcessor] -up-> [path]
[src/JsProcessor] -up-> [path]
[test/JsProcessor.test] -up-> [path]
[test/JsProcessor.test] -up-> [src/api/fs]
@enduml
```
```plantuml
@startuml
[src/run] -up-> [src/api/fs]
[src/api/fs] -up-> [fs-extra]
[src/run] -up-> [fs]
[src/run] -up-> [path]
@enduml
```
```plantuml
@startuml
[index] -up-> [src/api/fs]
[src/api/fs] -up-> [fs-extra]
[index] -up-> [src/JsProcessor]
[src/JsProcessor] -up-> [src/AbstractProcessor]
[index] -up-> [path]
[index] -up-> [package]
[index] -up-> [commander]
@enduml
```
```plantuml
@startuml
[test/AbstractProcessor.test] -up-> [src/api/fs]
[src/api/fs] -up-> [path]
[src/api/fs] -up-> [readline]
[test/AbstractProcessor.test] -up-> [path]
[test/AbstractProcessor.test] -up-> [src/AbstractProcessor]
@enduml
```
# 代码说明
[index.js](index.js)	命令行处理<br>
# [src](src)
[├──AbstractProcessor.js](src/AbstractProcessor.js)	入口文件<br>
[├──JsProcessor.js](src/JsProcessor.js)	入口文件<br>
[├──run.js](src/run.js)	入口文件<br>
## [api](src/api)
[├───fs.js](src/api/fs.js)	通用文件系统能力<br>
[└───string.js](src/api/string.js)	字符串处理<br>
# [test](test)
[├──AbstractProcessor.test.js](test/AbstractProcessor.test.js)	<br>
[├──JsProcessor.test.js](test/JsProcessor.test.js)	<br>
## [fixture](test/fixture)
[├───class copy.ts](test/fixture/class copy.ts)	1、注释与定义相邻的情况<br>
[├───class.ts](test/fixture/class.ts)	1、注释与定义相邻的情况<br>
[├───parseFunction.ts](test/fixture/parseFunction.ts)	<br>
[├───parseKeyWord.ts](test/fixture/parseKeyWord.ts)	关键词：'if', 'switch', 'with', 'catch', 'for', 'while', 'void'等不被误判<br>
[└───parseObject.ts](test/fixture/parseObject.ts)	文件注释<br>
  create by [gen-structure@liquid](https://github.com/ljquan/gen-structure.git)