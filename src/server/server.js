
var express = require('express');
var app = express();
var mysql = require('mysql');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sanitizer = require('sanitizer');
var port = 8000;
app.use(express.static('public'));

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'toor',
    database: 'EthereumMine'
})


db.connect(function (err) {
    console.log(err ? err : "Conexión establecida con la Base de Datos");
});

io.sockets.on('connection', function (socket) {
    console.log("ALguien se conecto mediante sockets");
    socket.on('login', function (data) {

        var clean_nombre = sanitizer.sanitize(data.nombre);
        var clean_password = sanitizer.sanitize(data.password);
        console.log("Estan iniciando sesion con credenciales");

        var query = "SELECT id, nombre, password, FDesde, FHasta FROM tblUsuarios WHERE nombre = ? and password = ?";
        var params = [clean_nombre, clean_password];

        db.query(query, params, function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                console.log(results[0]);
                socket.emit("loginResponse", { message: "success" })
            } else {
                console.log("login failed");
                socket.emit("loginResponse", { message: "error" })
            }
        });
    });
});


server.listen(port, function () {
    console.log("Iniciando Servidor Puerto : " + port);
});