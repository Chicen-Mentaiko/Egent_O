//file2base64

const fs = require('fs');

try
{
	var file = fs.readFileSync(process.argv[2]);

	console.log(file.toString("base64"));
}catch
{
	console.error("Error:ファイル指定した?");
}
