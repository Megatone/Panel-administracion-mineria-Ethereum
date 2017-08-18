app.controller("loginController", function ($scope , SessionService , Notifi) {
    
    $scope.inputsLogin = {
        nombre : 'admin',
        password : 'admin'
    };   

    socket.on('loginResponse', function (res) {         
        if (res.message == "success") {
            SessionService.setToken(res.token);
            SessionService.setUsuario(res.usuario);
            SessionService.setUsuarioAutenticado(true);            
            var incidencia = { type: 'success', title: 'Inicio de Sesión : ', message: 'Bienbenido ' };
            Notifi.notificar(incidencia);                
        } else {
            SessionService.resetToken();
            SessionService.resetUsuario();
            SessionService.setUsuarioAutenticado(false);
            var incidencia = { type: 'danger', title: 'Error Autenticación : ', message: 'La contraseña no es correcta' };
            Notifi.notificar(incidencia);
        }
    });
  
    $scope.login = function() {   
        var hash = CryptoJS.MD5($scope.inputsLogin.password).toString();      
        socket.emit('login', { "nombre": $scope.inputsLogin.nombre, "password": hash });
    };
});
  