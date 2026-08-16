//http_post.js

//いんぽ
import * as http from 'http';//ローカル側
import * as https from 'https';//LINE_app側
import * as readline from 'readline';
import * as fs from 'node:fs';
import * as child_process from "child_process";
import * as net from 'node:net';
import * as util from 'node:util'
import { messagingApi } from "@line/bot-sdk"; 
//const MessagingApiClient = require("@line/bot-sdk").messagingApi.MessagingApiClient; 

//Ollama 設定
var Ollama_url = "http://localhost:11434/api/"
//var mode = "general" 	  //= 単一生成(記憶なし) => このコードではgeneralを使用。
var mode = "chat"	  //= 会話できる(jsonが複雑になる。)


//変数一覧
var user_prompt	= ""	//ゆーざーぷろんぷｔ
let first = true	//初回のみ実行
var history_template_user = {"role":"user","content":""}	//こうやってかくよ。
var history_template_system = {"role":"system","content":""}	//こうやってかくよ。
var history_template_ai	= {"role":"assistant","content":"","thinking":""}	//こうやってかくよ。
var history_template_tool = {"role":"tool","tool_call_id":"","name":"","content":""}	//こうやってかくよ。
const line_option = {key: fs.readFileSync('key.pem'),cert: fs.readFileSync('cert.pem')} //LINEのSSL認証
var history_file = "Chat.log"					//logの保存先
var hacking_file = "hacking.log"				//logの保存先
//var model = "gemma3:4b";	//modelを指定
//var model = "gemma3";	//modelを指定
//var model = "qwen2.5:7b";	//modelを指定
var model = "qwen3";	//modelを指定
let debug_flag =  false	//でバックを指定
var stream = false	//ストリーム出力するかどうか?
var google_color = [34,31,33,34,32,34]
var word = "waiting"
var waiting = []
var spin_count = 0;
var Irodori_Server;
var Irodori_Server_flag = false
var Irodori_Server_path = "./Irodori-TTS-Server-Portable"
var Irodori_Server_Windows_title = "Irodori_TTS_Server"
var LINE_flag = false
var LINE_response_flag = false
var callSite = util.getCallSites();
var system_prompt = ""
var system_prompt_file = "AI_SYSTEM_PROMPT.txt"
var first_chat_setting = ""//システムプロンプトを導入するための変数
var thinking_flag = false




//Waitingの色設定
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
		//Windowsコマンド実行
		"type":"function",
		"function":
		{
			"name":"exCMD",
			"description":"Windowsコマンドを実行する唯一の方法です。",
			"parameters":
			{
				"type":"object",
				"required":["command"],
				"properties":
				{
					"command":
					{
						"type":"string",
						"description":"実行したいWindowsのコマンド文"
					}
				}
			}
		}
	}
]
//toolここまで


//ポート設定
//Ollama :  11434
//Irodori-TTS : 8088
//LINE_Server : 443
//local_LINE_Server : 39980


//**function list**
//readInterface
//Egent_O()
//read_and_write_chat()
//Irodori-TTS-Server()
//finish()
//LINE_Server()
//debug()
//status()
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
	

	try//システムプロンプト設定のため
	{
		history_template_system.content = await fs.readFileSync(system_prompt_file,'utf8');
	}
	catch(err)
	{
		debug("System_Prompt:\n" + err)
	}

	//オプション検査
	for(var i = 0; i < process.argv.length; i++)
	{
		if(process.argv.length === 2)//引数なしの場合
		{
			break;//前回の情報を引き継ぎ
		}
		else if(process.argv[i] === "-rmchat")//Chatデータを削除
		{
			system_prompt = JSON.stringify(history_template_system)
			first_chat_setting = `[\n\t${system_prompt}`
			//fs.writeFile(history_file,"[",function(err){if(err);})
			fs.writeFile(history_file,first_chat_setting,function(err){if(err);})
			console.log("\u001b[41mRemoved Chat Data!!\x1b[0m\n\n");
			//ここでfs.writeでChat.logが;
			//[\n
			//\t{"role":"system","content":"やあこんにち"}
			//になる
		}
		else if(process.argv[i] === "-h") //help
		{
			console.log("Egent_O\n");
			console.log("Usage: Egent_O [Option]\n");
			console.log("Optional:\n");
			console.log("-h\t\t:HELP - show this topic");
			console.log("-rmchat\t\t:ReMoveChat - delete Chat Data");
			console.log("-debug\t\t:Debug - Show What happen in this Program.");
			console.log("-newchat\t\t:NewChat - Copy chat.log to make new chat.log");
			console.log("-rechat\t\t:ReChat - Rewrite Chat.log to override chat.log(未実装)");
			console.log("-model [model] \t:Changing Model (Default Model:" + model + ")")
			console.log("-line\t\t:Use for LINE.")
			console.log("-voice\t:Use Irodoir-TTS to speach AI answer.(未実装)\n\n")
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
			debug("Debug Mode.")
			debug_flag = true
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
		else if(process.argv[i] === "-line")
		{
			LINE_flag = true
		}
		/*
		else if(process.argv[i] === "-rechat")
		{
			var file = fs.readdirSync(".");
			
			console.log("\u001b[42mThis is New Chat.\x1b[0m\n\n");
		}*/
		else if(process.argv[i] === "-voice")
		{
			Irodori_Server_flag = true
			/*
			try
			{
			Irodori_Server_flag = await Irodori_TTS_Server(30000)
			}
			catch(err)
			{
				console.log("\u001b[41nCAN'T BOOT!!\u001b[0m\nNo voice to continue...");
			}
			*/
		}
		else if(i === process.argv.length)
		{
			console.log("\u001b[41mError: Optional Unknown\u001b[0m\n")
			process.exit()
		}
	}
	//**************オプション確認終了(Option fin)
	
	/*
	if(debug_flag === true)
	{
		console.log("Debug : Check Option Fin...")
	}
	*/
	debug("Egent_O : Check Option Fin...")

	if(Irodori_Server_flag === true)//Irodori_TTS起動
	{
		try
		{
			Irodori_Server_flag = await Irodori_TTS_Server(30000)
		}
		catch(err)
		{
			console.log("\u001b[41nCAN'T BOOT!!\u001b[0m\nNo voice to continue...");
			Irodori_Server_flag = false
		}
	}

	if(LINE_flag === true)
	{
		await LINE_Server();
	}


	//初期処理終了

	console.log("** Type /bye to quit. **");

	//入力しょり
	readInterface.prompt();
	try
	{
		readInterface.on("line",async(line) => {
			
			if(line === "/bye" || line === "/exit") //byeか/exitを入力したらescape 
			{
				finish();//終了処理
			}
			if(line === "/status")
			{
				status()
			}

			/*
			if(line === "/rmchat")
			{
				try{
					fs.writeFile(history_file,"[",function(err){if(err);})
					response_LINE("\u001b[41mRemoved Chat Data!!\x1b[0m\n");
					console.log("Removed Chat Data!!");
					readInterface.prompt();
					return
				}
				catch(err)
				{
					console.log(err)
				}
			}
			*/


			history_template_user.content = line //ゆーざー入力を保存/上書き
			var user = history_template_user //jsonを保存

			var stat = fs.readFileSync(history_file,"utf8") //chat.logの大きさ確認
			if(stat === first_chat_setting)//chatの内容が初回のみの場合
			{
				fs.appendFileSync(history_file,",\t" + JSON.stringify(user) + "\n]")//追記
				//fs.appendでChat.logがこうなるはず;
				//[\n
				//\t{"role":"system","content":"やあこんにち"},
				//\t{"role":"user","content":""}\n
				//]
				/*
				if(debug_flag === true)
				{
					console.log("Debug > Crear the Chat");
				}
				*/
				callSite = util.getCallSites();
				debug("Egent_O : Clear the Chat")
			}
			else
			{
				await read_write_chat(user)
			}

			var history = JSON.parse(fs.readFileSync(history_file,'utf8'));//上の追記を読み込み

			await ask_ai(history);
			
			readInterface.prompt();
		});
	}
	catch(err)
	{
		console.log(err)
	}
}

async function ask_ai(history)
{
	return new Promise((resolve,reject) => {

		var wait = waiting_now();

		var data = JSON.stringify(
			{
				model: model,
				messages: history,//ここにimpo
				tools:tools,
				stream: stream,
				options:
				{
					temperature:0.1
				}
			});

		var option = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(data)
			},
		};

		if(debug_flag)//ここはしゃーない
		{
			debug("send_data:")
			console.dir(JSON.parse(data),{depth:null,colors:true})
		}
		
		var request = http.request(Ollama_url + mode,option,res => {
			var re_data = ""
			var buffer = ""
			var chunks = []
			var return_response = ""
			var return_thinking = ""
			var check_color = ""
			if(buffer === "")
			{
				endwait(wait)
			}
			if(res.statusCode != 200)//つながったらHTTPステータスを出力
			{
				console.error("Error: StatusCode: " + res.statusCode);
				console.error("Error: " + JSON.parse(res));
				process.exit()
			}
				

			res.on("data", chunk => {//データが来てる間
				//buffer += chunk.toString()
				try
				{
					chunks.push(chunk)
				}
				catch(err)
				{
					console.log("data:" + err)
				}
			});

			res.on("end",async () => {//データが止まったら
				try
				{
					buffer = Buffer.concat(chunks).toString()
					callSite = util.getCallSites();
					debug("Egent_O-ask_ai:" + buffer)
					process.stdout.write("\n");
					var data = JSON.parse(buffer)
					return_response = data.message.content
					return_thinking = data.message.thinking
					response_LINE(return_response)
					await typewrite(return_response)

					if(thinking_flag === true)
					{
						await typewrite(return_thinking)
					}

					
					try{
						if(data.message.tool_calls != undefined)
						{
							if(data.message.tool_calls[0].function.arguments.command != "")
							{
								callSite = util.getCallSites();
								debug("Egent_O-ask_ai-tool_calls:" + data.message.tool_calls[0].function.arguments.command)
								var ai_command = data.message.tool_calls[0].function.arguments.command
								var id = data.message.tool_calls[0].id
								var name = data.message.tool_calls[0].function.id
								var command_ans = exCMD(ai_command)
								history_template_tool.content = command_ans
								history_template_tool.id = id
								history_template_tool.name = name
								history_template_ai.thinking = return_thinking; //AIが思考を保存
								await read_write_chat(history_template_ai)
								await read_write_chat(history_template_tool)
								history = JSON.parse(fs.readFileSync(history_file,'utf8'));//上の追記を読み込み
								await ask_ai(history)//再帰関数
								resolve();//promiseの処理おわりをしらせる
								return
									
							}
							else
							{
								//コマンドないってことじゃん
							}
						}
					}
					catch(err)
					{
						console.log(err)
					}

					history_template_ai.content = return_response; //AIが言った言葉を保存
					history_template_ai.thinking = return_thinking; //AIが思考を保存

					await read_write_chat(history_template_ai)

					
					//fs.appendでChat.logがこうなるはず;
					//[\n
					//\t{"role":"user","content":""},\n
					//\t{"role":"assistant","content":""}
					//]
					
				}
				catch(err)
				{
					console.log(err)
				}
				resolve();//promiseの処理おわりをしらせる
					
			});

		});

		request.write(data);
		request.end();

	})
}

async function typewrite(text)
{
	return new Promise((resolve) => {
		let index = 0

		const timer =  setInterval(() => {
			if(index < text.length)
			{
				process.stdout.write(text.charAt(index));
				index++
			} else
			{
				clearInterval(timer);
				console.log()
				resolve();
			}
	},5)
	})

}
async function read_write_chat(json_data)
{
	return new Promise((resolve,reject) => {
		try
		{
			var chat_json = JSON.parse(fs.readFileSync(history_file,"utf8"));//JSONを読み込む
			chat_json.push(json_data);					//データを配列にぶち込む
			fs.writeFileSync(history_file,JSON.stringify(chat_json,null,2));//JSONを書き込む
			resolve()
		}catch(err)
		{
			debug(err + `\ndata:${json_data}`)
		}
	})
}

function exCMD(command)
{
	console.log("\n[exCMD:command]:\"" + command + "\"\n")
	try
	{
		var report = child_process.execSync(command,{encoding:"utf8"})
		if(report === ""  || report === undefined)
		{
			return `exCMD: ${command} Succsessfull with no errors. The directory or file has been created. Please proceed to the next step.`
		}
		else
		{
			return report
		}
	} catch (error)
	{
		//var report = "exCMD: Comand Error :" + error + ", If the command failed, analyze the error_details and choose the next logical step. You can try a different command, fix typos, or if it's impossible to recover, explain the reason to the user in text without calling tools."
		var report = "Command failed:" + error
		return report
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

		if(debug_flag === true)//debugの処理
		{
			//ウィンドウでる
			Irodori_Server = child_process.exec(`cmd /c start "${Irodori_Server_Windows_title}" cmd /c start_server.bat`,{cwd: Irodori_Server_path})
		}
		else
		{	//ウィンドウでない
			Irodori_Server = child_process.exec('cmd /c start_server.bat',{cwd: Irodori_Server_path})
		}

		if(debug_flag === true)
		{
			console.log("check = " + check_done)
		}
	check(false,check_done);
	});

}

function finish()
{//全体の終了処理
	if(Irodori_Server_flag === true)
	{
		if(debug_flag === true)
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
		Irodori_Server.kill('SIGINT')
	}
	process.exit()
}

function LINE_Server()
{
	return new Promise((resolve) => {
		try
		{
			var server = https.createServer(line_option,(req,res) => {
					if(req.method === 'POST')
					{
						LINE_response_flag = true;//LINEからきたふらぐ。
						var jsondata = "";
						var response = "返答中";
						var line_data = '';
						var message = "";
						req.on('data',function(chunk){line_data += chunk});
						req.on('end',function()
						{
							
							//実行内容を記入
							res.writeHead(200,{'Content-Type':'text/json'});
							res.end("ok");//応答を返す
							callSite = util.getCallSites();
							debug("LINE_Server : " + "LINEから北で...\n" + line_data)
							try
							{
								jsondata = JSON.parse(line_data,null,4);
							} 
							catch(err)
							{
								console.log(err)
								fs.appendFileSync(hacking_file,line_data + "\n\n")//エラー原因を書き留める
								resolve()
							}

							debug("LINE_Server : " + "jsondata typeof : " + typeof jsondata)
							debug("LINE_Server :" + "jsonに変換したで")
							
							try
							{
								if(jsondata.events[0].message.text != undefined)
								{
									message = jsondata.events[0].message.text;
									debug("LINE_Server : " + "json後のmessage : " + message)
								}else{
									message = "今だけ\"...\"と返答してください。"
								}
								readInterface.write(message + "\n");
							}
							catch(err)
							{
								console.log(err)
							}
								

						})
					}
				})
			server.listen(443,() => {
				debug("LINE_Server:Start....");//443番でリッスン
				resolve()
			})
		}
		catch(err)
		{
			console.log(err)
		}
	})
}

function response_LINE(response)
{
	try
	{
		if(LINE_response_flag === true)
		{
			if(response === "")
			{

			}
			else
			{
				callSite = util.getCallSites();
				debug("response_LINE : "  + "AIの内容をLINEに返却")
				LINE_response_flag = false
				var MessagingApiClient = messagingApi.MessagingApiClient
				var client = new MessagingApiClient({ channelAccessToken: fs.readFileSync('AccsessToken.txt'),})
				try{
					client.pushMessage({
						to: 'U915cb38017ee8cb9fa3a551fa44cee67',
						messages: [{ type: 'text', text: response}]
					});
				}catch(err)
				{
					console.log(err)
				}
			}
		}
	}
	catch(err)
	{
		console.log(err)
	}
}

process.on('exit',() => {
	finish()
});


function debug(sentence,nonColor = false)
{
	if(debug_flag === true)
	{
		if(nonColor === false)
		{
			console.log(`\u001b[31mDebug : ${sentence}\u001b[0m`)
		}else
		{
			console.log(`Debug : ${sentence}`)
		}
	}
}

function status()
{

	try
	{
		var AI_status = "Enget_O Status:\nCommand\t\t\t:\t"
		for(var i = 0; i < process.argv.length; i++)
		{
			AI_status += process.argv[i] + " "
		}
		AI_status += "\n\u001b[34mmodel\u001b[0m\t\t\t:\t" + model + "\n"
		AI_status += "\u001b[34mhisotry_file\u001b[0m\t\t:\t" + history_file + "\n"
		AI_status += "\u001b[34mdebug_mode\u001b[0m\t\t:\t" + debug_flag + "\n"
		AI_status += "\u001b[34mIrodori_Server_AI_status\u001b[0m\t:\t" + Irodori_Server_flag + "\n"
		AI_status += "\u001b[34mLINE_Server_Status\u001b[0m\t:\t" + LINE_flag + "\n";
		AI_status += "\u001b[34mhistory_template_user_now\u001b[0m :\n" + JSON.stringify(history_template_user,null,2) + "\n"
		AI_status += "\u001b[34mhistory_template_ai_now\u001b[0m : \n" + JSON.stringify(history_template_ai,null,2) + "\n"
		AI_status += "\u001b[34mhistory_template_ai_system\u001b[0m : \n" + JSON.stringify(history_template_system,null,2) + "\n"
		AI_status += JSON.stringify(JSON.parse(fs.readFileSync(history_file,'utf8')),null,2) + "\n";

		console.log(AI_status)
		response_LINE(AI_status)
		readInterface.prompt();
		return
	}
	catch(err)
	{
		console.log(err)
		response_LINE(err)
		readInterface.prompt();
		return
	}
}

//実行_right__now.
Egent_O();

