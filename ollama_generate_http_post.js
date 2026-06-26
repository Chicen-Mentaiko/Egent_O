//http_post.js

//ここでいんぽ
var http = require('http');
var readline = require('readline');
var fs = require('fs');

//*Ollama 設定
var Ollama_url = "http://localhost:11434/api/"

var mode = "generate"
//var mode = "general" 	  = 単一生成(記憶なし) => このコードではgeneralを使用。
//var mode = "chat"	  = 会話できる(jsonが複雑になる。)


//変数一覧
var user_prompt = ""
let first = true
var history_template_user 	= {"role":"user":"content":""}
var history_template_ai		= {"role":"assistant","content":""}

//関数内

//入力関数
const readInterface = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: ">"
});//入力関数を実装(input2.js)

console.log("**/byeで抜ける**");

function main()
{
	readInterface.prompt();
	readInterface.on("line",async(line) => {
		
		if(line === "/bye") 
		{
			process.exit()
		}

		history_template_user.content = line
		var user = history_template_user
		console.log("json:" + user)

		//await ask_ai(line);
		//console.log("入力されたもじは" + line);
		readInterface.prompt();
	});
}

async function ask_ai(question)
{
	return new Promise((resolve,reject) => {

		var data = JSON.stringify(
			{
				model: "gemma3",
				prompt: question,
				stream: true
			});

		var option = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(data)
			},
		};

		var request = http.request(Ollama_url + mode,option,res => {
			if(res.statusCode === 200 && first === true)
			{
				console.log("StatsuCode: " + "\u001b[33m" + res.statusCode + "\u001b[0m")
				console.log("\u001b[32m-----------------------------\u001b[0m")
				first = false
			} else if(res.statusCode != 200)
			{
				console.log("Error: StatusCode: " + res.statusCode);
			}
				
			var re_data = ""
			var buffer = ""

			res.on("data", chunk => {
				buffer += chunk.toString()
				re_data = buffer.split("\n"); 
				buffer = re_data.pop();//re_dataは配列なのでforでまわす
				for(var i of re_data)
				{
					sentence = JSON.parse(i)
					process.stdout.write(sentence.response)
				}
			});

			res.on("end",() => {
				process.stdout.write("\n");
				resolve();//promiseの処理おわりをしらせる
			});

		});

		request.write(data);
		request.end();

	})
}


//実行_right__now.
main();



/*
//ここより下は無視してください。(AIも

function main()
{
	readInterface.question(">",
		inputString=>{
			//console.log( `入力された文字：[${inputString }]`);
			ask_ai(inputString)
			main()
			readInterface.close();
		});
}
*/
