//txt2translate4txt.js
//by webhook-get-and-replay-test_by_line_bot_sdk-443-translate-clean.js

//import http from "https";
import fs from 'fs';
import rl from 'readline'

/*
const option = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
}
*/

var google_color = [34,31,33,34,32,34]
var word = "waiting"
var waiting = []

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

}


var spin_count = 0;

function spin()
{
	process.stdout.write('\x1B[?25l')
	rl.clearLine(process.stdout,0)
	rl.moveCursor(process.stdout,-9999,0)
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
	rl.clearLine(process.stdout,0);
	process.stderr.write('\x1B[?25h')
}

//\u001b[34mW\u001b[31ma\u001[33mi\u001b[34t\u001b[32mi\u001b[43n\u001b[34mg...\u001b[0m",


import translateModule from './translate.js';

var response;

var AEGI = "あっ♡きもちぃ♡やあ♡みゅう♡もっと突いてぇ♡あ♡" + 
	"あんっ♡いきゅぅぅっ♡♡♡イッちゃうぅ♡あんっ♡くるっ…♡あ♡あ♡♡イッちゃうぅ♡" 

//import * as line from '@line/bot-sdk'; 
//const client = new line.messagingApi.MessagingApiClient({ channelAccessToken: fs.readFileSync('AccsessToken.txt'),})

var ja2en = 'generalNT_ja_en';
var en2ja = 'generalNT_en_ja'; // API値 英語

var api_param = "";

for(var i = 0; i <= process.argv.length; i++)
{
	if(process.argv[i] === "-en2jp")
	{
		console.log("Option: English to Japanese.")
		api_param = en2ja;
		break;
	}
	else if(process.argv[i] === "-jp2en")
	{
		console.log("Option; Japanese to English.")
		api_param = ja2en;
		break;
	}
	else if(process.argv[i] === "-h")
	{
		console.log("\n\ntxt2translate4txt.js [file] [Option]\n");
		console.log("Option:")
		console.log("-en2jp:\t- English covert to japanese");
		console.log("-jp2en:\t- Japanese conver to english\n\n");
		process.exit();
	}
	else if(i === process.argv.length)
	{
		console.log("\nError: Not Option found.\n");
		process.exit();
	}
}


try
{
	response = fs.readFileSync(process.argv[2],{encoding: 'utf-8',flag:'r'});
}catch
{
	console.log("File not found.");
	response = AEGI;
}

console.log("テキストないよう:" + response);//中身だけ抽出

var return_res = ""


if(response.length > 200)
{
	var wait = waiting_now()
	var sentence = response.split(/\r\n|\n|\r/)
	for(var i = 0; i < sentence.length; i++)
	{
		var temp = await translateModule.translate(sentence[i],api_param,false);//trueでdev版
		return_res += temp + "\n";
	}
	endwait(wait)

}
else
{
	var wait = waiting_now()
	response = await translateModule.translate(response,api_param,false);//trueでdev版
	endwait(wait)
}
console.log("翻訳後:" + return_res)
try
{
	fs.writeFileSync(process.argv[2],return_res,{ encoding: 'utf8',flag:'w'});
} catch (err)
{
	console.error("Error",err.mesage);
}



