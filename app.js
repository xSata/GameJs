var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req,res){
		res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");


var HEIGHT = 500;
var WIDTH = 500;
var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Player = function(id){
	var self = {	
		id:id,
		x: 0,
		spdX: 30,
		y: 0,
		spdY: 5,
		name: 'P',
		hp:10,
		width:20,
		height:20,
		color: 'green',
	}
	self.updatePosition = function(){
		
		self.x += self.spdX;
		self.y += self.spdY;
		
	}
	return self;
}





var io = require('socket.io')(serv,{});

io.sockets.on('connection',function(socket){
	console.log('socket connection');
	socket.id = Math.random();


	SOCKET_LIST[socket.id] = socket;
	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;

	socket.on('playerPosition',function(data){
		player.updatePosition();
		if(data.playerX < player.width/2)
			data.playerX  = player.width/2;
		if(data.playerX > WIDTH - player.width/2)
			data.playerX = WIDTH - player.width/2;
		if(data.playerY < player.height/2)
			data.playerY = player.height/2;
		if(data.playerY > HEIGHT - player.height/2)
			data.playerY = HEIGHT - player.height/2;

		player.x = data.playerX;
		player.y = data.playerY;
		
		console.log('PositionX: '+ data.playerX + ' PositionY: '+ data.playerY);
	});

		
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});


});






setInterval(function(){
		

	var pack = [];
	for(var i in PLAYER_LIST){
		var player = PLAYER_LIST[i];
		pack.push({
			x:player.x,
			y:player.y,
			width:20,
			height:20,
			color: 'green',
		});
	}

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}

	

},1000/25);
