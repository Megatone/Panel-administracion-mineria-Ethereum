var express = require('express');
var app = express();
var mysql = require('mysql');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sanitizer = require('sanitizer');
var port = 8000;
var privateKey = "CLaveUltraSecretaDeServidor";
var md5 = require('md5');

var room = "mina";
var panel = "panel";

app.use(express.static('public'));

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'toor',
    database: 'EthereumMine'
});
var socketsPanel = [];
var socketsMineros = [];


db.connect(function (err) {
    console.log(err ? err : "Conexión establecida con la Base de Datos");
});

io.sockets.on('connection', function (socket) {

    console.log("ALguien se conecto mediante sockets -> " + socket.id);

    //eventos socket Panel Administracion
    socket.on('login', function (data) {
        login(data, socket);
    });

    socket.on('obtenerConfiguracion', function (data) {
        if (validarUsuarioPanel(socket.id)) {
            var query = "SELECT * FROM tblConfiguracion LIMIT 1";
            db.query(query, function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    socket.emit("obtenerConfiguracionResponse", results[0]);
                }
            });
        }
    });

    socket.on('guardarConfiguracion', function (data) {
        if (validarUsuarioPanel(socket.id)) {
            var clean_account = sanitizer.sanitize(data.account);
            var clean_poolServer1 = sanitizer.sanitize(data.poolServer1);
            var clean_portPoolServer1 = sanitizer.sanitize(data.portPoolServer1);
            var clean_poolServer2 = sanitizer.sanitize(data.poolServer2);
            var clean_portPoolServer2 = sanitizer.sanitize(data.portPoolServer2);
            var clean_timeout = sanitizer.sanitize(data.timeout);

            var query = "UPDATE tblconfiguracion SET account = ? , poolServer1 = ? , portPoolServer1 = ? , poolServer2 = ? , portPoolServer2 = ? , timeout = ? LIMIT 1 ";
            var params = [clean_account ,clean_poolServer1 , clean_portPoolServer1 ,clean_poolServer2 , clean_portPoolServer2 , clean_timeout];
            db.query(query , params , function(error ){
                if(error) throw error;
            });
        }
    });

    //eventos socket Mineros c#
    socket.on('inicializarMinero', function (data) {
        inicializarMinero(data, socket);
    });

    socket.on('disconnect', function () {
        socketsPanel = socketsPanel.filter(e => e !== socket.id);
        if (socketsMineros.indexOf(socket.id) != -1) {
            var query = "SELECT * FROM tblMineros WHERE socket = ?";
            db.query(query, [socket.id], function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    emitMineroDesconecto(results[0]);
                }
            });
            socketsMineros = socketsMineros.filter(e => e !== socket.id);
            var query = "UPDATE tblMineros SET socket = '' , hashrate = 0 WHERE socket = ?";
            db.query(query, [socket.id], function (error) {
                if (error) throw error;
                emitirInformacionMina();
            });
        }
    });

    socket.on("ReporteHashrate", function (data) {
        var clean_hashrate = sanitizer.sanitize(data.hashrate);
        var query = "UPDATE tblMineros SET FULTMOD = NOW() , hashrate = ? WHERE socket = ?";
        db.query(query, [clean_hashrate, socket.id], function (error) {
            if (error) throw error;
            emitirInformacionMina();
        });
    });

    socket.on("informacionMina", function (data) {
        emitirInformacionMina();
    });

});



//funciones Reporte Info


function emitirInformacionMina() {
    var mineros = [];
    var numMineros = socketsMineros.length;
    var totalHashrate = 0;


    var query = "SELECT * FROM tblMineros WHERE socket <> ''";
    db.query(query, function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            mineros = results;
            var query = "SELECT IFNULL(SUM(hashrate),0) as totalHashrate FROM tblMineros WHERE socket <> ''";
            db.query(query, function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    totalHashrate = results[0].totalHashrate;
                    emitToPanel("informacionMina", { mineros: mineros, numMineros: numMineros, totalHashrate: totalHashrate });
                }
            });
        } else {
            emitToPanel("informacionMina", { mineros: mineros, numMineros: numMineros, totalHashrate: totalHashrate });
        }
    });


};

function emitMineroConecto(minero) {
    emitToPanel("mineroConecto", minero);
};

function emitMineroDesconecto(minero) {
    emitToPanel("mineroDesconecto", minero);
};

function emitToPanel(evento, data) {
/*    for (var i = 0; i <= socketsPanel.length - 1; i++) {
        io.sockets.connected[socketsPanel[i]].emit(evento, data);
    }
    */
    io.sockets.in(panel).emit(evento, data);
};


//Funciones Login

function login(data, socket) {
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
                socket.emit("loginResponse", { message: "success", token: token, usuario: results[0] });
                socketsPanel.push(socket.id);
                socket.join(panel);
                console.log("socketsPAnel" + socketsPanel);
            });

        } else {
            console.log("login failed");
            socket.emit("loginResponse", { message: "error" })
        }
    });
};

function generarTokenLogin(idSocket) {
    return md5(privateKey + idSocket);
};

function validarUsuarioPanel(idSocket) {
    return (socketsPanel.indexOf(idSocket) != -1);
};

//funciones Minero

function inicializarMinero(data, socket) {
    console.log("Inicializando  Minero -> " + data.nombre);
    var clean_token = sanitizer.sanitize(data.token);
    var clean_nombre = sanitizer.sanitize(data.nombre);
    var clean_direccionIP = sanitizer.sanitize(data.direccionIP);

    var query = "SELECT m.id, ? as nombre,  m.gpus,  ? as direccionIP, m.token ,c.account , c.poolServer1  ,c.portPoolServer1, c.poolServer2, c.portPoolServer2, c.timeout FROM tblmineros m inner join tblconfiguracion c ON  c.id = 1 WHERE token = ?";
    var params = [clean_nombre, clean_direccionIP, clean_token];

    db.query(query, params, function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            var query = "UPDATE tblmineros SET nombre= ?,FDESDE= NOW() ,FULTMOD= NOW() , direccionIP= ? ,  socket = ?  WHERE token = ?";
            var params = [clean_nombre, clean_direccionIP, socket.id, clean_token,];
            db.query(query, params, function (error) {
                socket.emit('ConfiguracionMinero', results[0]);
                socket.join(room);
                socketsMineros.push(socket.id);
                emitMineroConecto(results[0]);
                emitirInformacionMina();
            })
        } else {
            var query = "INSERT INTO tblmineros(nombre, FDESDE, FULTMOD, gpus, direccionIP, token) VALUES ( ? , NOW() , NOW() , 0 , '' , ? )";
            var params = [clean_nombre, clean_token];
            db.query(query, params, function (error) {
                if (error) throw error;
                console.log("Se Registro un Nuevo Minero en la Base de Datos");
                inicializarMinero(data, socket);
            });
        }
    });
};

server.listen(port, function () {
    console.log("Iniciando Servidor Puerto : " + port);
});