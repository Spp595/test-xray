(function () {
    'use strict';

    if (window.test_push_plugin) return;
    window.test_push_plugin = true;

    setTimeout(function(){
        if (window.Lampa && Lampa.Noty) {
            Lampa.Noty.show('Плагин загружен!');
        } else {
            alert('Lampa не найдена');
        }
        console.log('Plugin loaded');
    }, 3000);

})();
