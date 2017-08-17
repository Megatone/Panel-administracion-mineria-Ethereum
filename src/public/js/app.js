var app = angular.module("app", []);


app.controller("controller", function ($scope) {

    var socket = io.connect('http://localhost:8000', { 'forceNew': true });

    socket.on('loginResponse', function (res) {
        console.log(res);
        if (res.message == "success") {
            console.log("OLEEE TU WEBA")
        } else {
            console.log("FAIL");
        }
    });

    $scope.login = function() {
        var userLogin = document.getElementById("userLogin").value;
        var userPassword = document.getElementById("userPassword").value;
        socket.emit('login', { "nombre": userLogin, "password": userPassword });
    }
});
