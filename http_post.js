//http_post.js


//いんぽ
import * as http from 'http';
import * as readline from 'readline';
import * as fs from 'node:fs';
import * as child_process from "child_process";
import * as net from 'node:net';

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
//var model = "gemma3:4b";	//modelを指定
var model = "gemma3";	//modelを指定
let debug =  false	//でバックを指定
var stream = true	//ストリーム出力するかどうか?
var google_color = [34,31,33,34,32,34]
var word = "waiting"
var waiting = []
var spin_count = 0;
var Irodori_Server;
var Irodori_Server_flag = false
var Irodori_Server_path = "./Irodori-TTS-Server-Portable"
var Irodori_Server_Windows_title = "Irodori_TTS_Server"


for(var i  = 0; i < word.length; i++)
{
	var sentence =	"\u001b[" + google_color[0] + "mW" +
			"\u001b[" + google_color[1] + "ma" +
			"\u001b[" + google_color[2] + "mi" +
			"\u001b[" + google_color[3] + "mt" +
			"\u001b[" + google_color[4] + "mi" +
			"\u001b[" + google_color[5] + "mn" +
			"\u001b[" + google_color[0] + "mg" +
			"\u001b[" + google_color[1] + "m\."+
			"\u001b[" + google_color[2] + "m\."+
			"\u001b[" + google_color[3] + "m\."+
			"\u001b[0m"

	waiting.push(sentence)
	var temp = google_color[0]
	google_color.shift()
	google_color.push(temp)

}//waiting文章作成;




//tool(ツール)
var tools = [
	{
		//コマンド実行
		"type":"function",
		"function":
		{
			"name":"shell",
			"description":"Execute Command.",
			"parameters":
			{
				"type":"object",
				"required":["command"],
				"properties":
				{
					"command":
					{
						"type":"string",
						"description":"Type here command to execute.(windows OS)"
					}
				}
			}
		}
	}
]
//toolここまで


//**function list**
//readInterface
//Egent_O()
//read_and_write_chat()
//Irodori-TTS-Server()
//finish()
//
//
//
//

//入力関数
const readInterface = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: ">"
});//入力関数を実装(from input2.js)


//本体
async function Egent_O()
{

	child_process.execSync("chcp 65001",{encoding:'utf-8'})

	//********初期処理
	//タイトル
	console.log("///////////////////////////////");
	console.log("////                       ////");
	console.log("////        EGENT_O        ////");
	console.log("////                       ////");
	console.log("///////////////////////////////");
	console.log("\nThis File is " + import.meta.filename + "\n");

	//引数より
	for(var i = 0; i < process.argv.length; i++)
	{
		if(process.argv.length === 2)//引数なしの場合
		{
			break;//前回の情報を引き継ぎ
		}
		else if(process.argv[i] === "-rmchat")//Chatデータを削除
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
			console.log("-h\t\t:HELP - show this topic");
			console.log("-rmchat\t\t:ReMoveChat - delete Chat Data");
			console.log("-debug\t\t:Debug - Show What happen in this JS");
			console.log("-newchat\t\t:NewChat - Copy chat.log to make new chat.log");
			console.log("-rechat\t\t:ReChat - Rewrite Chat.log to override chat.log(未実装)");
			console.log("-model [model] \t:Changing Model (Default Model:\"gemma3\")\n")
			console.log("-voice\t:Use Irodoir-TTS to speach AI answer.\n\n")
			process.exit()
		}
		else if(process.argv[i] === "-model") //model変更 
		{
			model = process.argv[i + 1];
			var ollama_list = child_process.execFileSync('ollama',['list'],{encode:'utf8'});
			if(ollama_list.toString().includes(model))
			{	
				console.log("Model Settings: " + model);
			}
			else
			{
				console.log("\u001b[41mError: Can't find Model: " + model + "\u001b[0m\n")
				process.exit()
			}
		}
		else if(process.argv[i] === "-debug") //model変更 
		{
			console.log("Debug Mode.")
			debug = true
		}
		else if(process.argv[i] === "-newchat")
		{
			fs.copyFileSync(history_file,history_file + 
					Date().getFullYear() + "_" +
					Date().getMonth() + 1 + "_" +
					Date().getDate()
			)
			fs.writeFile(history_file,"[",function(err){if(err);})
			console.log("\u001b[42mThis is New Chat.\x1b[0m\n\n");
		}
		else if(process.argv[i] === "-rechat")
		{
			var file = fs.readdirSync(".");
			
			console.log("\u001b[42mThis is New Chat.\x1b[0m\n\n");
		}
		else if(process.argv[i] === "-voice")
		{
			try
			{
			Irodori_Server_flag = await Irodori_TTS_Server(30000)
			}
			catch(err)
			{
				console.log("\u001b[41nCAN'T BOOT!!\u001b[0m\nNo voice to continue...");
			}
		}
		else if(i === process.argv.length)
		{
			console.log("\u001b[41mError: Optional Unknown\u001b[0m\n")
			process.exit()
		}
	}
	//**************
	
	console.log("** Type /bye to quit. **");

	//入力しょり
	readInterface.prompt();
	readInterface.on("line",async(line) => {
		
		if(line === "/bye" || line === "/exit") //byeか/exitを入力したらescape 
		{
			finish();//終了処理
		}

		history_template_user.content = line //ゆーざー入力を保存/上書き
		var user = history_template_user //jsonを保存

		var stat = fs.readFileSync(history_file,"utf8") //chat.logの大きさ確認
		if(stat === "[")//chatの内容が"["のみの場合
		{
			fs.appendFileSync(history_file,"\n\t" + JSON.stringify(user) + "\n]")//追記
			//fs.appendでChat.logがこうなるはず;
			//[\n
			//\t{"role":"user","content":""}\n
			//]
			if(debug === true)
			{
				console.log("Debug > Crear the Chat");
			}
		}
		else
		{
			read_write_chat(user)
		}

		var history = JSON.parse(fs.readFileSync(history_file,'utf8'));//上の追記を読み込み

		await ask_ai(history);
		
		readInterface.prompt();
	});
}

async function ask_ai(history)
{
	return new Promise((resolve,reject) => {

		var wait = waiting_now();

		var data = JSON.stringify(
			{
				model: model,
				messages: history,//ここにimpo
				//tools:tools,
				stream: stream
			});

		var option = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(data)
			},
		};

		if(debug)
		{
			console.dir(JSON.parse(data),{depth:null,colors:true})
		}
		
		var request = http.request(Ollama_url + mode,option,res => {
			var re_data = ""
			var buffer = ""
			var return_response = ""
			var check_color = ""
			if(buffer === "")
			{
				endwait(wait)
			}
			if(res.statusCode != 200)//つながったらHTTPステータスを出力
			{
				console.error("Error: StatusCode: " + res.statusCode);
				process.exit()
			}
				

			res.on("data", chunk => {//データが来てる間
				buffer += chunk.toString()
				re_data = buffer.split("\n"); 
				buffer = re_data.pop();//re_dataは配列なのでforでまわす
				for(var i of re_data)//streamなので1文字づつ出力
				{
					var sentence = JSON.parse(i)
					/*
					if(sentence.message.content.indexOf("<") === 0)
					{
						if(sentence.message.content.indexOf(">") === 0)
					}
					*/
					process.stdout.write(sentence.message.content)
					return_response += sentence.message.content
				}
				if(debug)
				{
					console.log("Debug.console.log(data) > " + JSON.stringify(i))
				}
			});

			res.on("end",() => {//データが止まったら
				process.stdout.write("\n");
				var data = JSON.parse(re_data)
				history_template_ai.content = return_response; //AIが言った言葉を保存

				read_write_chat(history_template_ai)

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
	var chat_json = JSON.parse(fs.readFileSync(history_file,"utf8"));//JSONを読み込む
	chat_json.push(json_data);					//データを配列にぶち込む
	fs.writeFileSync(history_file,JSON.stringify(chat_json,null,2));//JSONを書き込む
}

function shell(command)
{
	try
	{
		return child_process.execSync(command,{encoding:"utf8"})
	} catch (error)
	{
		return error
	}
}

function spin()
{
	process.stdout.write('\x1B[?25l')
	readline.clearLine(process.stdout,0)
	readline.moveCursor(process.stdout,-9999,0)
	if(spin_count > waiting.length - 2)
	{
		spin_count = 0;
	}else
	{
		spin_count++;
	}
	process.stdout.write(waiting[spin_count]);
}

function waiting_now()
{
	return setInterval(() =>{ spin();},200)
}

function endwait(waiting)
{ 
	clearInterval(waiting);
	readline.clearLine(process.stdout,0);
	readline.moveCursor(process.stdout,-9999,0)
	process.stderr.write('\x1B[?25h')
	process.stderr.write("\n")
}

function Irodori_TTS_Server(timeout)
{
	var wait = waiting_now();
	var check_done = false
	return new Promise((resolve,reject) => {
		var startTime = Date.now()
		function check(first = false,isDone = false)
		{
			if(isDone === false)
			{
				if(Date.now() - startTime > timeout)
				{
					endwait(wait)
					reject(false);
					check_done = true
					return;
				}
				var socket = net.createConnection({port:8088,host:'localhost'});

				socket.on('connect', () => {
					endwait(wait)
					socket.destroy();//切断
					console.log("Irodori-TTS-Server Working now...")
					resolve(true);//もどります
					check_done = true
					return
				});

				socket.on('error',() => {
					if(first === false)
					{
						socket.destroy();
						setTimeout(check,2000);
					}
				})
			}
		}

		check(true,check_done);//起動しているか確認

		if(debug === true)
		{
			//ウィンドウでる
			Irodori_Server = child_process.exec(`cmd /c start "${Irodori_Server_Windows_title}" cmd /c start_server.bat`,{cwd: Irodori_Server_path})
		}
		else
		{	//ウィンドウでない
			Irodori_Server = child_process.exec('cmd /c start_server.bat',{cwd: Irodori_Server_path})
		}

		if(debug === true)
		{
			console.log("check = " + check_done)
		}
	check(false,check_done);
	});

}

function finish()
{
	if(Irodori_Server_flag === true)
	{
		if(debug === true)
		{
			var command = `taskkill /f /t /fi "WINDOWTITLE eq ${Irodori_Server_Windows_title}"`
			console.log(command)
			//try
			//{
				child_process.execSync(command,{encoding:'utf-8'})
			//	console.log("stdout:" + stdout)
				Irodori_Server.kill('SIGINT')
				//}
			//catch(error)
			//{
			//	console.log("error.message:" + error.message)
			//	if(error.stderr)
			//	{
			//		console.log("error.stderr" + error.stderr)
			//	}
			//}
		}
	}
	Irodori_Server.kill('SIGINT')
	process.exit()
}

process.on('exit',() => {
	finish()
});

process.on('SIGINT',() => {
})


//実行_right__now.
Egent_O();

//以下むし
//
//Irodori_Server = child_process.exec('cmd /c start start_server.bat',{cwd: './Irodori-TTS-Server-Portable'})
