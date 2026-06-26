import rl from 'readline'
var google_color = [34,31,33,34,32,34]
var word = "waiting"
var waiting = []


for(var i = 1; i < 9; i++)
{
	for(var j = 1; j < 8;j++)
	{
		process.stdout.write("\u001b[" + i + j + "m" + i + j + "|")
	}
}
console.log("\u001b[0m\n")



for(var i  = 0; i < word.length; i++)
{
	var sentence =	"\u001b[" + google_color[0] + "mW" +
			"\u001b[" + google_color[1] + "ma" +
			"\u001b[" + google_color[2] + "mi" +
			"\u001b[" + google_color[3] + "mt" +
			"\u001b[" + google_color[4] + "mn" +
			"\u001b[" + google_color[5] + "mg" +
			"\u001b[" + google_color[0] + "m." +
			"\u001b[" + google_color[1] + "m." +
			"\u001b[" + google_color[2] + "m."

	waiting.push(sentence)
	var temp = google_color[0]
	google_color.shift()
	google_color.push(temp)

}

console.log(waiting[0])

/*
var spin_count = 0;


function spin()
{
	process.stdout.write('\x1B[?25l')
	rl.crearLine(process.stdout,0)
	rl.moveCursor(process.stdout,-9999,0)
	process.stdout,write(waiting[spin_count]);
	spin_count++;
	spin_count >= spin_count ? spin_count = 0 :null
}

export var loading(message) => setInverval(() =>{ spin();},200)
*/
