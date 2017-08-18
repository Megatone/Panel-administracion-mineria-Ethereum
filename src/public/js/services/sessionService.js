angular.module('Session', []).service('SessionService', function () {
    var estaAutenticado = false;
    var token = undefined;
    var usuario = {
        id:5,
        nombre :'a'
    };

    this.setUsuario = function(_usuario){
        this.usuario = _usuario;
    };

    this.getUsuario = function(){
        return this.usuario;        
    };
    this.resetUsuario = function(){
        this.usuario = undefined;
    };

    this.setUsuarioAutenticado = function(_result){
        this.estaAutenticado = _result; 
        window.location = this.estaAutenticado ? "#!/dashboard" : "#!/login";      
    };

    this.getUsuarioAutenticado = function () {
        return this.estaAutenticado;
    };

    this.setToken = function(_token){        
        this.token = _token;
    };

    this.getToken = function(){        
        return this.token;
    };

    this.resetToken = function(){
        this.token = undefined;
    };

    this.cerrarSesion = function () {
        this.usuario = undefined;
        this.estaAutenticado = false; 
        this.token = false;   
        window.location = "#/login";
    };
});