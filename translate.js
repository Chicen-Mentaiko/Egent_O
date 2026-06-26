//translate.js

import dotenv from 'dotenv';

dotenv.config();

import fs from 'fs';

var url = 'https://mt-auto-minhon-mlt.ucri.jgn-x.jp'; // 基底URL (https://xxx.jpまでを入力)
var key = fs.readFileSync('translate_key.txt');
var secret = fs.readFileSync('translate_key_secret.txt');
var name = 'mentaiko'; // ログインID

//console.log("key:" + key + ". secret:" + secret)

var api_name = 'mt'; // API名 (https://xxx.jp/api/mt/generalNT_ja_en/ の場合は、"mt")
var api_param_ja2en = 'generalNT_ja_en'; // API値 (https://xxx.jp/api/mt/generalNT_ja_en/ の場合は、"generalNT_ja_en")
var api_param_en2ja = 'generalNT_en_ja'; // API値 英語
var api_param_ja2cn = 'generalNT_ja_zh-CN';//jp to cn
var api_param_cn2en = 'generalNT_zh-CN_en';//cn to en
var api_param_en2sw = 'generalNT_en_sw';//en to swahiri
var api_param_sw2jp = 'generalNT_sw_jp';//swahiri to jp


var api_param = 'generalNT_ja_en'	;//API値 初期値:ja

var exp = /^[a-zA-Z]/; 

import axios from 'axios';
import * as oauth from 'axios-oauth-client';
import { fileURLToPath} from "node:url";

const thisFile = fileURLToPath(import.meta.url);

const getClientCredentials = oauth.clientCredentials(
	axios.create(),
	url + '/oauth2/token.php',
	key,
	secret,
);

async function translate_template(word,gyaku = false,api_param_name = "",dev = false) {
	
	if(word.match(exp) && gyaku == false)
	{
		console.log("translate.js: This is en.");
		api_param = api_param_en2ja;
	}
	else if(gyaku == false)
	{
		console.log("translate.js: これは日本語やで。");
		api_param = api_param_ja2en;
	}
	else if(gyaku == true)
	{
		api_param_name = api_param_name;
	}

	if(gyaku == true)
	{
		return translate_template(
			translate_template(
				translate_template(
					translate_template(word,gyaku = false, api_param_name = "api_param_ja2cn"),
					gyaku = false,
					api_param_name = "api_param_en2sw"
				),
				gyaku = false,
				api_param_name = "api_param_en2sw",
			),
			gyaku = false,
			api_param_name ="api_param_sw2jp"
		)
	}

	/*

	//こっから内容
	var params = {
		access_token: auth.access_token,
		key: key, // API Key
		api_name: api_name,
		api_param: api_param,
		name: name, // ログインID
		type: 'json', // レスポンスタイプ
		text: word, // 翻訳テキスト
	};

	if(dev === true)
	{
		console.log("params :", params);
	}


	// クエリパラメータで渡さないと523エラーが返ってくる(´・ω・｀)
	var searchParams = new URLSearchParams();
	for (let key in params) {
		searchParams.append(key, params[key]);
	}

	const res = await axios.post(url + '/api/', searchParams);
	
	*/


	//console.log(res.data.resultset.result.text);
	//return res.data.resultset.result.text;
};

async function translate(word,api_param,dev = false)
{
	const auth = await getClientCredentials();
	//こっから内容
	var params = {
		access_token: auth.access_token,
		key: key, // API Key
		api_name: api_name,
		api_param: api_param,
		name: name, // ログインID
		type: 'json', // レスポンスタイプ
		text: word, // 翻訳テキスト
	};

	if(dev === true)
	{
		console.log("params :", params);
	}


	// クエリパラメータで渡さないと523エラーが返ってくる(´・ω・｀)
	var searchParams = new URLSearchParams();
	for (let key in params) {
		searchParams.append(key, params[key]);
	}

	const res = await axios.post(url + '/api/', searchParams);

	if(dev === true)
	{
		console.log("Res : ",res);
	}

	//console.log(res.data.resultset.result.text);
	return res.data.resultset.result.text;

}

async function main()
{
	var word = "やりますねぇ"
	var start = new Date();
	api_param = api_param_ja2en;
	console.log("Translate_before: " + word);
	for(var i = 0; i <= process.argv.length; i++)
	{
		if(process.argv[i] === "-dev")
		{
			console.log("Translate_after: " + await translate(word,api_param = api_param,true));
			break;
		}else if(i === process.argv.length)
		{
			console.log("Trabslate_after: " + await translate(word,api_param = api_param,false));
			break;
		}
	}
	console.info("Excution Time: %dms",new Date - start);
}

if(process.argv[1] === thisFile)
{
	main();
}
export default 
{
	translate
};

