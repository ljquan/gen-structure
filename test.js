const fsApi = require('./src/api/fs.js');

fsApi.readLine('/Users/liquid/code/tencent/gen-structure/src/public/animate.min.css', 50).then(function(str){
  console.log(str);
})

