var gameSetting = {
	default_dir: 0,
	dir: 0, //right: 0, left: 1, up: 2, down: 3
	speed: 5,
	snake: $('.gameField .wHead'),
	gameField: $('.gameField'),
	snakeSize: 30,
	fieldHeight: 540,
	fieldWidth: 540,
	keyAccept: false,
	boundary: true,
	gameEnd: false,
	overAte: 0,
	win: false,
	finished: false,
	infinMode: false,
	score: 0,
	remainT: 60,
	level: 1,
	maxLevel: 10,
	accTime: 0,
	combos: 0,
	comboTotalT: 3000,
	bonusPoint: 2,
	fruit:{
		top: 0, 
		left: 0,
		size: 30,
		isGolden: false
	},
	exit: {
		show: false,
		top: 0,
		left: 0
	}
};

gameSetting.totalSize = parseInt(gameSetting.fieldHeight * gameSetting.fieldWidth / gameSetting.snakeSize / gameSetting.snakeSize) - 2;

var countTimePointer;
var combosTimer;

var wormPos = {
	top: 0,
	left: gameSetting.snakeSize,
	seq: ["wb1"],
	size: 0,
	wb1:{top: 0, left: 0},
}

var levels = {
	'1': {p: 100, t: 30},
	'2': {p: 200, t: 50},
	'3': {p: 300, t: 70},
	'4': {p: 400, t: 80},
	'5': {p: 500, t: 90},
	/*'6': 700,
	'7': 900,
	'8': 1100,
	'9': 1300,
	'10': 1500*/
}

gameSetting.initGame = function() {
	//remove the remaining bodies
	// $('body').css({
	// 	'min-height': gameSetting.fieldHeight + 20,
	// 	'min-width': gameSetting.fieldWidth + 10,
	// });
	$('#gameSpeed').val(gameSetting.speed);
	$('#hasBound').val(gameSetting.boundary?1:0);
	var usingMobile = navigator.userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i);
	if (usingMobile) {
		$('[data-for="deviceNote"]').show();
	} else {
		$('[data-for="deviceNote"]').hide();
	}
	gameSetting.bindEvents();
}

gameSetting.startGame = function(){
	console.log('init games!');
	$('.infoPopUp, .fullPopUpBg').hide();
	$('.scoreBoard, .gameField').show();
	if(wormPos.size > 0){
		for(var i = 0; i < wormPos.size; i++){
			$('#wb'+(i+2)).remove();
		}
	}

	$('.scoreBoard').toggleClass('infinMode', gameSetting.infinMode);
	
	if(gameSetting.win){
		//reinitialise the param for next level
		gameSetting.level += 1;
		$('#levelNum').text(gameSetting.level);
		//inherit some score if any over score in the last level
		gameSetting.score = parseInt((gameSetting.score - levels[gameSetting.level - 1].p)/2);
		if (gameSetting.score < 0) {
			gameSetting.score = 0;
		}
	}else{
		//reinitialise the param for a new game
		$('#levelNum').text(1);
		gameSetting.level = 1;
		gameSetting.score = 0;
	}
	
	//reinitialise the param
	gameSetting.combos = 0;
	gameSetting.accTime = 0;
	gameSetting.overAte = 0;
	gameSetting.dir = 0;
	gameSetting.default_dir = 0;
	gameSetting.gameEnd = false;
	gameSetting.win = false;
	gameSetting.remainT = levels[gameSetting.level].t;
	gameSetting.keyAccept = true;
	gameSetting.exit.show = false;
	wormPos = {
		top: 0,
		left: gameSetting.snakeSize,
		seq: ["wb1"],
		size: 0,
		wb1:{top: 0, left: 0},
	}
	
	//initialize the point and lv
	$('#cbNum').text(0);
	$('[data-for="scorePoint"]').text(gameSetting.score);
	$('#timeRemain').text(gameSetting.remainT);
	$('#maxPoint').text(levels[gameSetting.level].p);
	$('#cbId').width(0);
	$('.gameField .cave').hide();
	
	//create ball snake;
	$('.gameField .wHead').css({top:'0px',left:'20px'});
	$('.gameField .wBody').css({top:'0px',left:'0px'});
	$('#wb0').css("transform","rotate(90deg)");
	if(gameSetting.snake.length == 0){
		gameSetting.snake = $('.gameField .wHead');
		gameSetting.gameField = $('.gameField');
		gameSetting.gameField.css({
			width: gameSetting.fieldWidth + 'px', 
			height: gameSetting.fieldHeight + 'px',
		});
		$('.scoreBoard').css({
			'width': gameSetting.fieldWidth + 2,
		});
		$('.cave').css('top', gameSetting.fieldHeight - 20);
	}
	$('.endingPopUp').css({
		top: (gameSetting.fieldHeight + 200)/2 + 'px',
		display: 'none'
	});
	gameSetting.genFood();
	setTimeout(gameSetting.nextFrame, 500/gameSetting.speed);
	countTimePointer = setTimeout(gameSetting.countDown, 1000);
}

gameSetting.nextFrame = function(){
	//right: 0, left: 1, up: 2, down: 3
	if(gameSetting.dir < 0){
		//pausing
	}else{
		if(!gameSetting.infinMode && gameSetting.score >= levels[gameSetting.level].p && !gameSetting.exit.show){			
			gameSetting.genDoor('exit');
		}
		gameSetting.eatFruit();
		if(!gameSetting.gameEnd){
			var lastWb = wormPos[wormPos.seq[wormPos.size]];
			lastWb.left = wormPos.left;
			lastWb.top = wormPos.top;
			wormPos.seq.unshift(wormPos.seq.pop());
			if(gameSetting.dir == 0){
				//move right
				wormPos.left += gameSetting.snakeSize;
				if(wormPos.left > gameSetting.fieldWidth - gameSetting.snakeSize){
					if(!gameSetting.boundary){
						//move to left side
						wormPos.left = 0;
					}else{
						//game over
						gameSetting.gameEnd = true;
					}
				}
			}else if(gameSetting.dir == 1){
				//move left
				wormPos.left -= gameSetting.snakeSize;
				if(wormPos.left < 0){
					if(!gameSetting.boundary){
						//move to right side
						wormPos.left = gameSetting.fieldWidth - gameSetting.snakeSize;
					}else{
						//game over
						gameSetting.gameEnd = true;
					}
				}
			}else if(gameSetting.dir == 2){
				//move upward
				wormPos.top -= gameSetting.snakeSize;
				if(wormPos.top < 0){
					if(!gameSetting.boundary){
						//move to bottom side
						wormPos.top = gameSetting.fieldHeight - gameSetting.snakeSize;
					}else{
						//game over
						gameSetting.gameEnd = true;
					}
				}
			}else if(gameSetting.dir == 3){
				//move upward
				wormPos.top += gameSetting.snakeSize;
				if(wormPos.top > gameSetting.fieldHeight - gameSetting.snakeSize){
					if(!gameSetting.boundary){
						//move to top side
						wormPos.top = 0;
					}else{
						//game over
						gameSetting.gameEnd = true;
					}
				}
			}
			gameSetting.dectectBodyTouch()
			if(!gameSetting.gameEnd){
				gameSetting.updateSnakePo();
			}
		}		
	}
	if(!gameSetting.gameEnd){
		gameSetting.keyAccept = true;
		setTimeout(gameSetting.nextFrame, 500/gameSetting.speed);
	}else{
		gameSetting.over();
	}
}

gameSetting.updateSnakePo = function(){
	//console.log('Position updated');
	gameSetting.snake.css({top: wormPos.top + 'px', left: wormPos.left + 'px'});
	$('.gameField #' + wormPos.seq[0]).css({top: wormPos[wormPos.seq[0]].top + 'px', left: wormPos[wormPos.seq[0]].left + 'px'});	
}

gameSetting.over = function(){
	gameSetting.keyAccept = false;
	clearTimeout(countTimePointer);
	clearTimeout(combosTimer);
	if(gameSetting.win){
		if (gameSetting.level == Object.keys(levels).length) {
			//game finish!
			gameSetting.showEnd('Congratulations!', '&#9166; Infinite mode!', true);
			gameSetting.finished = true;
			gameSetting.infinMode = true;
			gameSetting.level = 1;
			gameSetting.score = 0;
			return;
		}
		console.log('You win!');
		gameSetting.showEnd('You win!', '&#9166; NEXT');
	}else{
		console.log('You lose!');
		gameSetting.showEnd('You lose!', '&#9166; RESTART');
	}
}

gameSetting.showEnd = function(title, btnText, showDesc=false) {
	$('.endingPopUp .gameEnd').text(title);
	$('.endingPopUp .restart').html(btnText);
	$('.endingPopUp .endDesc').toggle(showDesc);
	$('.endingPopUp .configDesc, .endingPopUp .gameConfig').toggle(!showDesc);
	$('.endingPopUp').show();
}

gameSetting.growSnake = function(){
	wormPos.size += 1;
	var sn = wormPos.size + 1;
	gameSetting.gameField.prepend('<div class = "worm wBody" id="wb' + sn + '" style="top: ' + wormPos.top + 'px; left: ' + wormPos.left + 'px;"></div>');
	wormPos['wb' + sn] = {top: wormPos.top, left: wormPos.left};
	wormPos.seq.push('wb' + sn);
}

gameSetting.genDoor = function(type){
	if(type == 'exit'){
		gameSetting.exit.show = true;
		var positions = [wormPos.left + ',' + wormPos.top];
		wormPos.seq.forEach(function(item){
			positions.push(wormPos[item].left + ',' + wormPos[item].top);
		});
		positions.push(gameSetting.fruit.left + ',' + gameSetting.fruit.top);
		var dTop = Math.random()*10000 % gameSetting.fieldHeight;
		var dLeft = Math.random()*10000 % gameSetting.fieldWidth;
		dLeft = dLeft - dLeft % gameSetting.snakeSize;
		dTop = dTop - dTop % gameSetting.snakeSize;
		var dPos = dLeft + ',' + dTop;
		while(positions.indexOf(dPos) > -1){
			dTop = Math.random()*10000 % gameSetting.fieldHeight;
			dLeft = Math.random()*10000 % gameSetting.fieldWidth;
			dLeft = dLeft - dLeft % gameSetting.snakeSize;
			dTop = dTop - dTop % gameSetting.snakeSize;
			dPos = dLeft + ',' + dTop;
		}
		gameSetting.exit.top = dTop;
		gameSetting.exit.left = dLeft;
		$('.gameField .cave').show();
		$('.gameField .cave').css({top: dTop + 'px', left: dLeft + 'px'});
	}
}

gameSetting.genFood = function(){
	//generate food inside the box but not touching the snake
	var positions = [wormPos.left + ',' + wormPos.top];
	wormPos.seq.forEach(function(item){
		positions.push(wormPos[item].left + ',' + wormPos[item].top);
	});
	var fTop = Math.random()*10000 % (gameSetting.fieldHeight - gameSetting.fruit.size);
	var fLeft = Math.random()*10000 % (gameSetting.fieldWidth - gameSetting.fruit.size);
	fLeft = fLeft - fLeft % gameSetting.fruit.size;
	fTop = fTop - fTop % gameSetting.fruit.size;
	var fPos = fLeft + ',' + fTop;
	while(positions.indexOf(fPos) > -1){
		fTop = Math.random()*10000 % (gameSetting.fieldHeight - gameSetting.fruit.size);
		fLeft = Math.random()*10000 % (gameSetting.fieldWidth -gameSetting.fruit.size);
		fLeft = fLeft - fLeft % gameSetting.fruit.size;
		fTop = fTop - fTop % gameSetting.fruit.size;
		fPos = fLeft + ',' + fTop;
	}
	gameSetting.fruit.top = fTop;
	gameSetting.fruit.left = fLeft;
	//console.log(positions);
	//console.log(fPos);
	$('.gameField .fruit').css({top: fTop + 'px', left: fLeft + 'px'});
	if(gameSetting.combos > gameSetting.bonusPoint){
		if($('.gameField .fruit').attr('class').indexOf('fruit0') > -1){
			$('.gameField .fruit').removeClass('fruit0').addClass('fruit1');
		}
		gameSetting.fruit.isGolden = true;
	}else{
		$('.gameField .fruit').removeClass('fruit1').addClass('fruit0');
		gameSetting.fruit.isGolden = false;
	}
}

gameSetting.eatFruit = function(){
	var ate = false;
	if (gameSetting.dectectBodyTouch()) {
		return;
	}
	
	//detect reach door
	if(gameSetting.exit.show){
		var doorPo = gameSetting.exit.left + ',' + gameSetting.exit.top;
		var snakePo = wormPos.left + ',' + wormPos.top;
		if(snakePo == doorPo){
			gameSetting.gameEnd = true;
			gameSetting.win = true;
			return;
		}
	}
	
	if(wormPos.left == gameSetting.fruit.left && wormPos.top == gameSetting.fruit.top){
		if(gameSetting.accTime == 0){
			gameSetting.combos = 1;
			gameSetting.accumulate(0);
		}else{
			gameSetting.combos++;
			gameSetting.accTime = gameSetting.comboTotalT;
		}
		var score = 20;
		if (gameSetting.fruit.isGolden) {
			score = 30;
		}
		score += gameSetting.combos - 1;
		gameSetting.upDateScore(score);
		//regen fruit
		gameSetting.genFood();
		ate = true;
	}
	
	//grow snake if fruit was bit
	if(ate){
		gameSetting.growSnake();
		if(gameSetting.exit.show){
			//grow twice if eat too much
			gameSetting.overAte++;
			for(var i = 0; i < gameSetting.overAte; i++){
				gameSetting.growSnake();
			}
		}
	}
}

gameSetting.upDateScore = function(point){
	gameSetting.score += point;
	$('[data-for="scorePoint"]').text(gameSetting.score);
	$('#cbNum').text(gameSetting.combos);
}

gameSetting.countDown = function(){
	if (gameSetting.dir < 0) {
		countTimePointer = setTimeout(gameSetting.countDown, 100);
		return;
	}
	if (gameSetting.infinMode) {
		return;
	}
	gameSetting.remainT -=1;
	$('#timeRemain').text(gameSetting.remainT);
	if(gameSetting.gameEnd || gameSetting.remainT == 0){
		//end game
		gameSetting.gameEnd = true;
	}else{
		//continue count down
		countTimePointer = setTimeout(gameSetting.countDown, 1000);
	}
}

gameSetting.accumulate = function(state){
	//accumlateCountDown = timer;
	if (gameSetting.dir < 0) {
		combosTimer = setTimeout(function() {
			gameSetting.accumulate(state);
		}, 20);
		return;
	}
	if(state == 0){
		gameSetting.accTime = gameSetting.comboTotalT;
		$('#cbId').width((gameSetting.accTime/gameSetting.comboTotalT) * 200);
		combosTimer = setTimeout(function() {
			gameSetting.accumulate(1);
		}, 20);
	}else if(state == 1){
		if(gameSetting.accTime == 0){
			//stop;
			gameSetting.combos = 0;
			$('#cbNum').text(0);
			if($('.gameField .fruit').attr('class').indexOf('fruit1') > -1){
				$('.gameField .fruit').removeClass('fruit1').addClass('fruit0');
			}
		}else{
			gameSetting.accTime -= 20;
			$('#cbId').width((gameSetting.accTime/gameSetting.comboTotalT) * 200);
			combosTimer = setTimeout(function() {
				gameSetting.accumulate(1);
			}, 20);
		}
	}
}

gameSetting.dectectBodyTouch = function() {
	var positions = [];
	var snakePo = wormPos.left + ',' + wormPos.top;
	wormPos.seq.forEach(function(item){
		positions.push(wormPos[item].left + ',' + wormPos[item].top);
	});
	if(positions.indexOf(snakePo) > -1){
		gameSetting.gameEnd = true;
		return true;
	}
	return false;
}

gameSetting.bindEvents = function() {
	function moveUp() {
		if(gameSetting.dir > -1){
			if(gameSetting.dir == 2 || gameSetting.dir == 3){
				//do nothing
				gameSetting.keyAccept = true;
			}else{
				gameSetting.dir = 2;
				$('#wb0').css("transform","rotate(0deg)");
			}
		}else{
			//start after pause
			if(gameSetting.default_dir != 3){
				gameSetting.dir = 2;
				$('#wb0').css("transform","rotate(0deg)");
			}else{
				gameSetting.dir = gameSetting.default_dir;
			}
		}
		$('.pauseBtn').removeClass('play').addClass('stop');
	}

	function moveDown() {
		if(gameSetting.dir > -1){
			if(gameSetting.dir == 2 || gameSetting.dir == 3){
				//do nothing
				gameSetting.keyAccept = true;
			}else{
				gameSetting.dir = 3;
				$('#wb0').css("transform","rotate(180deg)");
			}
		}else{
			//start after pause
			if(gameSetting.default_dir != 2){
				gameSetting.dir = 3;
				$('#wb0').css("transform","rotate(180deg)");
			}else{
				gameSetting.dir = gameSetting.default_dir;
			}
		}
		$('.pauseBtn').removeClass('play').addClass('stop');
	}

	function moveLeft() {
		if(gameSetting.dir > -1){
			if(gameSetting.dir == 0 || gameSetting.dir == 1){
				//do nothing
				gameSetting.keyAccept = true;
			}else{
				gameSetting.dir = 1;
				$('#wb0').css("transform","rotate(-90deg)");
			}
		}else{
			//start after pause
			if(gameSetting.default_dir != 0){
				gameSetting.dir = 1;
				$('#wb0').css("transform","rotate(-90deg)");
			}else{
				gameSetting.dir = gameSetting.default_dir;
			}
		}
		$('.pauseBtn').removeClass('play').addClass('stop');
	}
	
	function moveRight() {
		if(gameSetting.dir > -1){
			if(gameSetting.dir == 0 || gameSetting.dir == 1){
				//do nothing
				gameSetting.keyAccept = true;
			}else{
				gameSetting.dir = 0;
				$('#wb0').css("transform","rotate(90deg)");
			}
		}else{
			//start after pause
			if(gameSetting.default_dir != 1){
				gameSetting.dir = 0;
			}else{
				gameSetting.dir = gameSetting.default_dir;
				$('#wb0').css("transform","rotate(90deg)");
			}
		}
		$('.pauseBtn').removeClass('play').addClass('stop');
	}

	$(document).unbind('keydown').keydown(function(evt){
		//console.log(evt.keyCode);
		if(gameSetting.keyAccept){
			gameSetting.keyAccept = false;
			if(evt.keyCode == 37){
				//left arrow
				moveLeft();
			}
			else if(evt.keyCode == 38){
				//up arrow
				moveUp();
			}
			else if(evt.keyCode == 39){
				//right arrow
				moveRight();
			}
			else if(evt.keyCode == 40){
				//down arrow
				moveDown();
			}
			else if(evt.keyCode == 32){
				//Pause (Space)
				if(gameSetting.dir > -1){
					gameSetting.default_dir = gameSetting.dir;
					gameSetting.dir = -1;
					$('.pauseBtn').removeClass('stop').addClass('play');
				}else{
					gameSetting.dir = gameSetting.default_dir;
					$('.pauseBtn').removeClass('play').addClass('stop');
				}
			}
			// else if(evt.keyCode == 88){
			// 	//accelerate ('x')
			// 	gameSetting.speed++;
			// }else if(evt.keyCode == 90){
			// 	//slow down ('z')
			// 	gameSetting.speed--;
			// }
		}
		if ($('.infoPopUp').css('display') == 'block') {
			if(evt.keyCode == 13){
				//start the game
				$('.infoPopUp .foot').click();
			}
		} else if($('.endingPopUp').css('display') == 'block'){
			if(evt.keyCode == 13){
				//Enter to restar or next level
				$('.restart').click();
			}
		}
	});

	$('.infoPopUp .foot').click(function(e){
		e.stopPropagation();
		gameSetting.startGame();
		
		//init the game control panel
		var setting = {
			type: GameControl.DirectionBtnType.Grid,
			position: GameControl.Position.BottomRight,
			mobileOnly: true
		};
		GameControl.init(setting);
		
		GameControl.bindKeyPressEvent(GameControl.Keys.Up, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(gameSetting.keyAccept){
				gameSetting.keyAccept = false;
				moveUp();
			}
		});
		GameControl.bindKeyPressEvent(GameControl.Keys.Down, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(gameSetting.keyAccept){
				gameSetting.keyAccept = false;
				moveDown();
			}
		});
		GameControl.bindKeyPressEvent(GameControl.Keys.Left, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(gameSetting.keyAccept){
				gameSetting.keyAccept = false;
				moveLeft();
			}
		});
		GameControl.bindKeyPressEvent(GameControl.Keys.Right, function(e){
			e.stopPropagation();
			e.preventDefault();
			if(gameSetting.keyAccept){
				gameSetting.keyAccept = false;
				moveRight();
			}
		});
	});

	$('.endingPopUp .gameConfig').click(function(e){
		e.stopPropagation();
		$('.trans_fullPopUpBg, .configPopUp').show();
		$('[data-for="infinMode"]').toggle(gameSetting.finished);
		$('#infinMode').val(gameSetting.infinMode?1:0);
	});

	$('.trans_fullPopUpBg, .configPopUp .close').click(function(e){
		e.stopPropagation();
		$('.trans_fullPopUpBg, .configPopUp').hide();
	});

	$('#gameSpeed').change(function(){
		gameSetting.speed = parseInt(this.value);
	});

	$('#hasBound').change(function(){
		gameSetting.boundary = (this.value === '1');
	});

	$('#infinMode').change(function(){
		gameSetting.infinMode = (this.value === '1');
	});
	
	$('.restart').click(function(e){
		e.stopPropagation();
		gameSetting.startGame();
	});

	$('.pauseBtn').click(function(e){
		e.stopPropagation();
		if (gameSetting.gameEnd) {
			return;
		}
		if(gameSetting.dir > -1){
			gameSetting.default_dir = gameSetting.dir;
			gameSetting.dir = -1;
			$(this).removeClass('stop').addClass('play');
		}else{
			gameSetting.dir = gameSetting.default_dir;
			$(this).removeClass('play').addClass('stop');
		}
	});
}
