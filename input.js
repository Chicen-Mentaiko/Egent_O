//input.js
//qitta.com/saba_can00/items/02ff28a16a0d312a5259
//

process.stdin.setEncoding("utf8")

var lines = [];
var reader = require("readline").createInterface({input: process.stdin});

reader.on("line",(line) => { lines.push(line); });

reader.on("close",() => { console.log(lines); });
