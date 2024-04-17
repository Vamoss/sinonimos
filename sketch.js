/******************
Code by Vamoss
Original code link:
https://openprocessing.org/sketch/2184412

Author links:
http://vamoss.com.br
http://twitter.com/vamoss
http://github.com/vamoss
******************/

//Ideia emerged from:
//https://chatbotslife.com/notes-on-remixing-noon-generative-text-and-markov-chains-84ff4ec23937

const fontSize = 40;
var message = "tecnologia não é neutra";
var wordsArr = [];
var synonymsArr = [];
var time, messageWidth;
var keyPressedMillis = 0, keyPressedSpeed;
var sinonimos_db;

function preload() {
	//from: https://github.com/Vamoss/sinonimos-local
	sinonimos_db = loadJSON("db_compiled.json");
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	textAlign(CENTER, CENTER);
	onMessageChanged();
}

function draw() {
	background(88, 24, 69);
	time = millis() / 10000;
	
	const center = height / 2;
	let x = (width - messageWidth) / 2;
	wordsArr.forEach((word, index) => {
		fill(255, 195, 15);
		textSize(fontSize);
		drawWord(word, x, center);
		var wordSpace = textWidth(word + " ");
		textSize(fontSize * 0.8);
		synonymsArr[index].forEach((synonym, index2) => {
			var i = Math.floor(index2 - synonymsArr[index].length / 2);
			if(i >= 0) i++;
			fill(255, 195, 15, max(255 - abs(i * 100), 60));
			drawWord(synonym, x, center + i * fontSize * 1.05, i);
		});
		x += wordSpace;
	});
	
	//key holding
	if (keyIsPressed){
		if(millis() - keyPressedMillis > keyPressedSpeed) {
    	keyPressed();
		}
		if(keyPressedSpeed > 100)
			keyPressedSpeed -= 50;
  }else{
		keyPressedSpeed = 1000;
	}

  textSize(30);
  fill(255, 195, 15, 100);
  text("Sinônimos by @Vamoss", width-180, height-30);
}

function drawWord(word, x, y, index) {
	if(!index) index = 0;
	var xIni = x;
	var yIni = y; 
	[...word].forEach(char => {
		var tW = textWidth(char)/2;
		x += tW;
		
		var x1 = x;
		var y1 = y + noise(x1 / 1000 + time, yIni / 1000) * 800 - 400;
		var x2 = x1 + tW;
		var y2 = y + noise(x2 / 1000 + time, yIni / 1000) * 800 - 400;
		var angle = atan2(y2 - y1, x2 - x1);

		var xx = x;
		var yy = y + noise(x / 1000 + time, yIni / 1000) * 800 - 400;
		var lineAngle = index/20 * (x - xIni)/40;
		push();
			translate(xIni, yIni);
				rotate(lineAngle);
			translate(-xIni, -yIni);
			translate(xx, yy);
			rotate(angle + lineAngle);
			text(char, 0, 0);
		pop();
		
		x += tW;
	});
}

function onMessageChanged(){
	wordsArr = message.split(" ");
	synonymsArr = [];
	wordsArr.forEach(word => {
		synonymsArr.push(sinonimos(word, true));
	});
	textSize(fontSize);
	messageWidth = textWidth(message);
}

/**
 * Coleta uma lista de sinônimos de uma palavra.
 * @param {string} palavra A palavra para buscar os sinônimos.
 * @param {boolean} [buscarVariantes=false] Se true, busca variantes da palavra.
 * @return {Array<string>} Lista de palavras sinônimas.
 */
function sinonimos(palavra, buscarVariantes = false) {
    palavra = palavra.toLocaleLowerCase();
    var index = sinonimos_db.palavras.indexOf(palavra);
    if(index == -1 && buscarVariantes){
        index = sinonimos_db.palavras.indexOf(masculiniza(palavra));
        if(index == -1)
            index = sinonimos_db.palavras.indexOf(singulariza(palavra));
        if(index == -1)
            index = sinonimos_db.palavras.indexOf(singulariza(masculiniza(palavra)));
    }
	if(index >= 0){
        return sinonimos_db.sinonimos[index].map(i => sinonimos_db.palavras[i]);
    }
    return [];
};

/**
 * Tenta encontrar a versão singular da palavra. Não funciona para todos os casos, é uma simplificação.
 * @param {string} palavra A palavra para tentar singularizar.
 * @return {string} Tentativa singularizada da palavra.
 */
function singulariza(palavra) {
    var l = palavra.length;
    if(palavra.slice(-2)=="ns"){
        //álbuns, jovens, sons, uns
        return palavra.substring(0, l-2) + "m";
    }else if(palavra.slice(-3)=="ões"){
        //relações, felicitações
        return palavra.substring(0, l-3) + "ão";
    }else if(palavra.slice(-2)=="es"){
        //valores, vezes
        return palavra.substring(0, l-2);
    }else if(palavra.slice(-3)=="eis"){
        //frágeis, répteis
        return palavra.substring(0, l-3) + "il";
    }else if(palavra.slice(-3)=="ais"){
        //essenciais, gerais, quais
        return palavra.substring(0, l-3) + "al";
    }else if(palavra.slice(-3)=="óis"){
        //sóis, anzóis, arbóis
        return palavra.substring(0, l-3) + "ol";
    }else if(palavra.slice(-2)=="is"){
        //fuzis, barris
        return palavra.substring(0, l-1) + "l";
    }else if(palavra.slice(-1)=="s"){
        //sintéticos, analíticos
        return palavra.substring(0, l-1);
    }
    return palavra;
};

/**
 * Tenta encontrar a versão masculina da palavra. Não funciona para todos os casos, é uma simplificação.
 * @param {string} palavra A palavra para tentar masculinizar.
 * @return {string} Tentativa masculinizada da palavra.
 */
function masculiniza(palavra) {
    var l = palavra.length;
    if(palavra.slice(-3)=="tra"){
        //neutra
        return palavra.substring(0, l-1) + "o";
    }else if(palavra.slice(-2)=="ra"){
        //vendedora, cantora
        return palavra.substring(0, l-1);
    }else if(palavra.slice(-1)=="a"){
        //boneca, menina
        return palavra.substring(0, l-1) + "o";
    }else if(palavra.slice(-2)=="as"){
        return palavra.substring(0, l-2) + "os";
    }
    return palavra;
};

function keyPressed(){
	keyPressedMillis = millis();
	
	const ignoredChars = [
		9,//TAB
		13,//ENTER
		16,//SHIFT
		17,//CTRL
		18,//ALT
		20,//CAPSLOCK
		37,//LEFT
		38,//TOP
		39,//RIGHT
		40,//DOWN
		54,//^
		91,//Windows key
		222,//'
		192,//~
	];
	if(ignoredChars.includes(keyCode)) return;
	
	if(keyCode==8){//backspace
		message = message.substring(0, message.length - 1);
	}else{
		message += key;
	}
	
	onMessageChanged();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}