var app = angular.module("app", ['ngRoute' , 'Session' ])
    .config(['$routeProvider', function ($routeProvider) {
        for (var path in window.routes) {
            $routeProvider.when(path, window.routes[path]);
        }
        $routeProvider.otherwise({ redirectTo: '/dashboard' });
    }])
    .run(function ($rootScope, $location , SessionService ) {        
        $rootScope.$on("$locationChangeStart", function (event, next, current ) {
            for (var i in window.routes) {
                if (next.indexOf(i) != -1) {
                    if (window.routes[i].requireLogin  && !SessionService.getUsuarioAutenticado() ) {                       
                        $location.path("/login");
                        event.preventDefault();
                    }
                }
            }
        });
    });

window.routes = {
    "/login": {
        templateUrl: "views/login.html",
        controller: "loginController",
        requireLogin: false
    },
    "/dashboard": {
        templateUrl: "views/dashboard.html",
        controller: "dashboardController",
        requireLogin: true
    }
};

app.factory('Notifi', function () {
    return {
        notificar: function (notificacion) {
            $.notify({
                title: notificacion.title,
                message: notificacion.message
            }, {
                type: notificacion.type,
                placement: {
                    from: "bottom",
                    align: "right" 
                }, 
                showProgressbar: true,
                allow_dismiss: true,
                delay: 5000,
                offset: 1,
                timer: 100
            });
        }
    };
});

var socket = io.connect('http://localhost:8000', { 'forceNew': true });

