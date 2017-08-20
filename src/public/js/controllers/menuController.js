app.controller("menuController", function ($scope, $rootScope, Notifi, SessionService) {

    $scope.cerrarSesion = function () {
        SessionService.resetToken();
        SessionService.resetUsuario();
        SessionService.setUsuarioAutenticado(false);
        var incidencia = { type: 'success', title: 'Cerrar Sesión : ', message: 'La sesión ha finalizado correctamente.' };
        Notifi.notificar(incidencia);
    };
});