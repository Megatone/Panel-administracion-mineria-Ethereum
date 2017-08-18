var express = require('express');
var app = express();
var mysql = require('mysql');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sanitizer = require('sanitizer');
var port = 8000;
var privateKey = "CLaveUltraSecretaDeServidor";
var md5 = require('md5');
var mina = "Mina";

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

    console.log("ALguien se conecto mediante sockets -> " + socket.id);

    //eventos socket Panel Administracion
    socket.on('login', function (data) {

        var clean_nombre = sanitizer.sanitize(data.nombre);
        var clean_password = sanitizer.sanitize(data.password);
        console.log("Estan iniciando sesion con credenciales");

        var query = "SELECT id, nombre FROM tblUsuarios WHERE nombre = ? and password = ?";
        var params = [clean_nombre, clean_password];

        db.query(query, params, function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                console.log(results[0]);
                var token = generarTokenLogin(socket.id);
                var query = "UPDATE tblUsuarios SET token = '" + token + "' WHERE id = " + results[0].id;
                db.query(query, function (error) {
                    if (error) throw error;
                    console.log("Asignamos Token -> " + token);
                    socket.emit("loginResponse", { message: "success", token: token, usuario: results[0] })
                });

            } else {
                console.log("login failed");
                socket.emit("loginResponse", { message: "error" })
            }
        });
    });

    socket.on('conectarPanelConLaMina', function (data) {       
        validarTokenUsuario(data, socket.id, function () {          
            socket.join(mina);
        });
    });  
    
    socket.on('obtenerConfiguracion' , function(data){
        validarTokenUsuario(data, socket.id,function(){
            
        });
    });

    //eventos socket Mineros c#

    socket.on('inicializarMinero' , function(data){
        //si no existe el minero lo insertamos
        // actualizamos la informacion de conexion 
        //retornamos la informacion para conectar con la Mina y empezar a minar
    });

    socket.on('conectarMineroConLaMina' , function(data){
        socket.join(mina);
    });

});


//Funciones Login

function generarTokenLogin(idSocket) {
    return md5(privateKey + idSocket);
};

function validarTokenUsuario(data, idSocket, _callback) {
    var clean_token = sanitizer.sanitize(data.token);
    var clean_idUsuario = sanitizer.sanitize(data.idUsuario);    
    var query = "SELECT token FROM tblUsuarios WHERE id = ?";
    db.query(query, [clean_idUsuario], function (error, results, fields) {      
        if (error) throw error;
        if (results.length > 0) {
            if (results[0].token === clean_token && clean_token === generarTokenLogin(idSocket)) {
                _callback();
            }
        }
    });
};


server.listen(port, function () {
    console.log("Iniciando Servidor Puerto : " + port);
});