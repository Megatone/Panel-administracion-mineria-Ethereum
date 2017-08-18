
(function(){
    /* Menu Toggle */
    $('body').on('click touchstart', '#menu-toggle', function(e){
        e.preventDefault();
        $('html').toggleClass('menu-active');
        $('#sidebar').toggleClass('toggled');
        //$('#content').toggleClass('m-0');
    });
     
    /* Active Menu */
    $('#sidebar .menu-item').hover(function(){
        $(this).closest('.dropdown').addClass('hovered');
    }, function(){
        $(this).closest('.dropdown').removeClass('hovered');
    });

    /* Prevent */
    $('.side-menu .dropdown > a').click(function(e){
        e.preventDefault();
    });


})();

