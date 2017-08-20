app.controller("configuracionController" , function($scope ,  Notifi){

    $scope.configuration ={
        id : 1,
        account : '',      
        poolServer1 : '',
        portPoorlServer1 : 0,
        poolServer2 : '',
        portPoolServer2 : 0,     
        timeout : 5000
    };

    inicializar();

    function inicializar(){
       socket.emit("obtenerConfiguracion");
      socket.removeListener("obtenerConfiguracionResponse");
    };

    socket.on("obtenerConfiguracionResponse" , function(data){
        $scope.configuration = data;
    });
    $scope.guardarConfiguracion = function(){
        socket.emit("guardarConfiguracion", $scope.configuration);
        var incidencia = { type: 'success', title: 'Configuración : ', message: 'La configuración ha sido guardada con exito' };
        Notifi.notificar(incidencia);  
    };

});