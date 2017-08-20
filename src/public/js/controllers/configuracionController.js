app.controller("configuracionController", function ($scope, Notifi, ModalService) {

    $scope.configuration = {
        id: 1,
        account: '',
        poolServer1: '',
        portPoorlServer1: 0,
        poolServer2: '',
        portPoolServer2: 0,
        timeout: 5000
    };

    inicializar();

    function inicializar() {
        socket.emit("obtenerConfiguracion");
        socket.removeListener("obtenerConfiguracionResponse");
        socket.removeListener("guardarConfiguracionResponse");
        socket.removeListener("reinicioMinerosResponse");
    };

    socket.on("obtenerConfiguracionResponse", function (data) {
        $scope.configuration = data;
    });

    socket.on("guardarConfiguracionResponse", function(){
        var incidencia = { type: 'success', title: 'Configuración : ', message: 'La configuración ha sido guardada con exito' };
        Notifi.notificar(incidencia);
    });

    socket.on("reinicioMinerosResponse", function(){
        var incidencia = { type: 'success', title: 'Configuración : ', message: 'Se ha mandado la orden de reiniciar los mineros para que obtengan la ultima configuración.' };
        Notifi.notificar(incidencia);
    });

    $scope.guardarConfiguracion = function () {
        ModalService.showModal({
            templateUrl: "/views/modales/modalActualizarConfiguracion.html",
            controller: "modalActualizarConfiguracionController"
        }).then(function (modal) {
            modal.element.show();
            modal.close.then(function (result) {  
                socket.emit("guardarConfiguracion", {configuracion : $scope.configuration , reinicioMineros : result});              
            });
        });
    };

});