//http_post.js

var http = require('http');

//general = 単一生成(記憶なし) => このコードではgeneralを使用。
//chat	  = 会話できる(jsonが複雑になる。)
var mode = "generate"

var Ollama_url = "http://localhost:11434/api/" + mode

var data = JSON.stringify(
	{
		model: "gemma3",
		prompt: "Node.JSでHelloWorldを出力してください。",
		stream: true
	});

var option = {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		"Content-Length": Buffer.byteLength(data)
	},
};

var request = http.request(Ollama_url,option,res => { 
	
	console.log("StatsuCode: " + "\u001b[33m" + res.statusCode + "\u001b[0m")
	console.log("\u001b[32m-----------------------------\u001b[0m")
		
	var re_data = ""
	var buffer = ""

	res.on("data", chunk => {
		buffer += chunk.toString()
		re_data = buffer.split("\n"); 
		buffer = re_data.pop();
		sentence = JSON.parse(re_data)
		process.stdout.write(sentence.response)
	});

	
	//console.log("GETed Data.");

	res.on("end", () => {
		//var json = JSON.parse(re_data);
		//console.log("------------------------\n" + json.response);
	});
	
});

request.write(data);
request.end();

