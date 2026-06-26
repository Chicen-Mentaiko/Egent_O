//GetJson.js


var fs = require('fs');

var data = fs.readFileSync("Chat.log","utf8")

console.log(JSON.parse(data));
