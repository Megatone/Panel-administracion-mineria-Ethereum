app.controller("dashboardController", function ($scope, SessionService, Notifi) {

    inicializar();

    function inicializar() {        
        $scope.Usuario = SessionService.getUsuario();      
        socket.emit('conectarPanelConLaMina', { token : SessionService.getToken() , idUsuario : $scope.Usuario.id });
    };


    

});