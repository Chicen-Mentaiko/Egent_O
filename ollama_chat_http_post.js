//http_post.js


//いんぽ
import * as http from 'http';
import * as readline from 'readline';
import *  as fs from 'node:fs';


//Ollama 設定
var Ollama_url = "http://localhost:11434/api/"

//var mode = "general" 	  //= 単一生成(記憶なし) => このコードではgeneralを使用。
var mode = "chat"	  //= 会話できる(jsonが複雑になる。)


//変数一覧
var user_prompt	= ""	//ゆーざーぷろんぷｔ
let first = true	//初回のみ実行
var history_template_user = {"role":"user","content":""}	//こうやってかくよ。
var history_template_ai	= {"role":"assistant","content":""}	//こうやってかくよ。
var history_file = "Chat.log"					//logの保存先


//関数一覧

//入力関数
const readInterface = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: ">"
});//入力関数を実装(from input2.js)


//本体
function Egent_O()
{

	//********初期処理
	//タイトル
	console.log("///////////////////////////////");
	console.log("////                       ////");
	console.log("////        EGENT_O        ////");
	console.log("////                       ////");
	console.log("///////////////////////////////");
	console.log("\nThis File is " + import.meta.filename + "\n\n");

	//引数より
	for(var i = 0; i < process.argv.length; i++)
	{
		if(process.argv[i] === "-rmchat")//Chatデータを削除
		{
			fs.writeFile(history_file,"[",function(err){if(err);})
			console.log("\u001b[41mRemoved Chat Data!!\x1b[0m\n\n");
			//ここでfs.writeでChat.logが;
			//[\n
			//\t
			//になる
		}
		else if(process.argv[i] === "-h") //help
		{
			console.log("Egent_O\n");
			console.log("Usage: Egent_O [Option]\n");
			console.log("Optional:\n");
			console.log("-h\t:HELP - show this topic");
			console.log("-rmchat\t:ReMoveChat - delete Chat Data\n");
			process.exit()
		}
	}
	//**************
	
	console.log("** Type /bye to quit. **");

	//入力しょり
	readInterface.prompt();
	readInterface.on("line",async(line) => {
		
		if(line === "/bye") //byeを入力したらescape 
		{
			process.exit()
		}

		history_template_user.content = line //ゆーざー入力を保存/上書き
		var user = history_template_user //jsonを保存

		var stat = fs.readFileSync(history_file,"utf8") //chat.logの大きさ確認
		//console.log(stat)
		if(stat === "[")//chatの内容が"["のみの場合
		{
			fs.appendFileSync(history_file,"\n\t" + JSON.stringify(user) + "\n]")//追記
			//fs.appendでChat.logがこうなるはず;
			//[\n
			//\t{"role":"user","content":""}\n
			//]
			//console.log("[\\n\\t");
		}
		else
		{
			/*
			fs.appendFileSync(history_file,",\n\t" + JSON.stringify(user) + "\n]")//ついき
			//fs.appendでChat.logがこうなるはず;
			//[\n
			//\t{"role":"user","content":""},\n
			//\t{"role":"assistant","content":""},\n
			//\t{"role":"user","content":""}\n
			//]
			//console.log("\\b\\b\\b,\\b");
			*/
			read_write_chat(user)
		}

		var history = JSON.parse(fs.readFileSync(history_file,'utf8'));//上の追記を読み込み


		//console.dir(history,{depth:null,colors:true})

		await ask_ai(history);
		//console.log("入力されたもじは" + line);
		readInterface.prompt();
	});
}

async function ask_ai(history)
{
	return new Promise((resolve,reject) => {


		var data = JSON.stringify(
			{
				model: "gemma3",
				messages: history,//ここにimpo
				stream: true
			});

		var option = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(data)
			},
		};

		//console.dir(JSON.stringify(data,null,2))//dataを出力


		var request = http.request(Ollama_url + mode,option,res => {
			if(res.statusCode === 200 && first === true)//つながったらHTTPステータスを出力
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
			var return_response = ""

			res.on("data", chunk => {//データが来てる間
				buffer += chunk.toString()
				re_data = buffer.split("\n"); 
				buffer = re_data.pop();//re_dataは配列なのでforでまわす
				for(var i of re_data)//streamなので1文字づつ出力
				{
					var sentence = JSON.parse(i)
					process.stdout.write(sentence.message.content)
					return_response += sentence.message.content
				}
			});

			res.on("end",() => {//データが止まったら
				process.stdout.write("\n");
				var data = JSON.parse(re_data)
				history_template_ai.content = return_response; //AIが言った言葉を保存

				/*
				var chat_json = JSON.parse(fs.readFileSync(history_file,"utf8"));
				chat_json.push(history_template_ai);
				fs.writeFileSync(history_file,JSON.stringify(chat_json,null,2))
				*/

				read_write_chat(history_template_ai)

				/*
				fs.appendFileSync(history_file,",\n\t" +JSON.stringify(ai) + "\n]",(err) => { 
					if(err) throw err
				});
				*/
				//fs.appendでChat.logがこうなるはず;
				//[\n
				//\t{"role":"user","content":""},\n
				//\t{"role":"assistant","content":""}
				//]
				resolve();//promiseの処理おわりをしらせる
			});

		});

		request.write(data);
		request.end();

	})
}

function read_write_chat(json_data)
{
	var chat_json = JSON.parse(fs.readFileSync(history_file,"utf8"));
	chat_json.push(json_data);
	fs.writeFileSync(history_file,JSON.stringify(chat_json,null,2))

}



//実行_right__now.
Egent_O();



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
