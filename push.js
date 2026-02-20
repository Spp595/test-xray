(function () {
    'use strict';

    if (window.plugin_test_notify_ready) return;
    window.plugin_test_notify_ready = true;

    function start() {
        // Простое уведомление Lampa
        Lampa.Noty.show('Тестовый плагин загружен успешно');
        console.log('Test plugin loaded');
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                start();
            }
        });
    }

})();
