app.controller("dashboardController", function ($scope, SessionService, Notifi) {

    $scope.information = {        
        data: {
            account: "0xde539131b38cc062cade4b7484fa10a20f1b0f41",
            hashrate: 0,
            mineros : [],
            numMineros : 0
        }
    };   

    

    inicializar();

    function inicializar() {        
        $scope.Usuario = SessionService.getUsuario();      
        socket.emit('informacionMina');
        socket.on("informacionMina" , function(data){
            $scope.information.data.mineros = data.mineros;
            $scope.information.data.hashrate  = parseFloat(data.totalHashrate);
            $scope.information.data.numMineros = data.numMineros;

            $scope.$apply();
        });
        socket.on("mineroConecto" , function(data){
            var incidencia = { type: 'success', title: 'Minero : ', message: 'El Minero ' + data.nombre +' se conecto a la Mina' };
            Notifi.notificar(incidencia);  
        });

        socket.on("mineroDesconecto" , function(data){
            var incidencia = { type: 'danger', title: 'Minero : ', message: 'El Minero ' + data.nombre +' se desconecto de la Mina' };
            Notifi.notificar(incidencia);  
        });
    };


    $scope.copyAddress = function(){   
        copyToClipboard($scope.information.data.account);  
        var incidencia = { type: 'success', title: 'Copiar : ', message: 'Direccion Ethereum "'+$scope.information.data.account+'" copiada al portapapeles' };
        Notifi.notificar(incidencia);  
    };


    function copyToClipboard(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            return clipboardData.setData("Text", text); 

        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
            } catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    };

});