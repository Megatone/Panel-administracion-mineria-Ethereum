
var app = require('express')();
var mysql = require('mysql')
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 8080;

console.log("Iniciando Servidor Puerto : " + port);
server.listen(port);

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password : 'toor',
    database: 'botnet'
}) 

db.connect(function(err){
    console.log( err ? err :"Conexión establecida con la Base de Datos"); 
});

io.sockets.on('connection', function(socket){        
});


