app.controller("estadisticasController" , function($scope){

    $scope.config = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: "Total Hashrate",
                backgroundColor: 'rgb(255, 255, 255)',
                borderColor: 'rgb(255, 255, 255)',
                data: [ ],
                fill: false,
            }]
        },
        options: {
            responsive: true,
            legend: {
                display: true,
                labels: {
                    fontColor: 'rgb(255, 255, 255)'
                }
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        fontColor: "white",                    
                        stepSize: 1,
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "white",                      
                        stepSize: 1,
                        beginAtZero: true
                    }
                }]
            }     
        }
    };

    inicializar();
  

    function inicializar(){
        socket.emit('informacionMina');
        var ctx = document.getElementById("canvas").getContext("2d");
        window.myLine = new Chart(ctx, $scope.config);
        socket.removeListener('informacionMina');
    };

    socket.on("informacionMina" , function(data){
        if( $scope.config.data.datasets[0].data.length == 100){
            $scope.config.data.datasets[0].data.splice(0,1);
            $scope.config.data.labels.splice(0,1);
        }
        $scope.config.data.datasets[0].data.push(parseFloat(data.totalHashrate));
        var d = new Date();
        $scope.config.data.labels.push(d.toLocaleTimeString());   
        window.myLine.update();   
    });



  

 


});