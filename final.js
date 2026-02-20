(function () {
    'use strict';

    if (window.plugin_lampa_uid_ready) return;
    window.plugin_lampa_uid_ready = true;

    function start() {
        var network = new Lampa.Reguest();

        var html = $('<div style="margin-left:15px;font-size:14px;">' +
                     '<div id="lampa-uid"></div>' +
                     '<div id="lampa-auth-status"></div>' +
                     '</div>');

        $('.head__time').after(html);

        function getLuid() {
            return Lampa.Storage.get('lampa_uid') || localStorage.getItem('lampa_uid');
        }

        function showLuid() {
            var luid = getLuid() || 'не найден';
            $('#lampa-uid').text('Lampa UID: ' + luid);
        }

        function checkAuth() {
            var luid = getLuid();

            if (!luid) {
                $('#lampa-auth-status').text('UID не найден');
                return;
            }

            network.clear();
            network.timeout(5000);

            network.silent(
                'https://api.sp595.ru/api/auth/' + luid,
                function (result) {

                    console.log('Ответ сервера:', result);

                    // если пришла строка — парсим
                    if (typeof result === 'string') {
                        try {
                            result = JSON.parse(result);
                        } catch (e) {
                            console.log('Ошибка парсинга JSON');
                        }
                    }

                    if (result && result.message === 'Успешно') {
                        $('#lampa-auth-status')
                            .text('Авторизация: Есть')
                            .css('color', '#4CAF50');
                    } else {
                        $('#lampa-auth-status')
                            .text('Авторизация: Нет')
                            .css('color', '#F44336');
                    }
                },
                function (err) {
                    console.log('Ошибка запроса:', err);
                    $('#lampa-auth-status')
                        .text('Ошибка запроса')
                        .css('color', '#F44336');
                }
            );
        }

        setTimeout(function () {
            showLuid();
            checkAuth();
        }, 2000);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();
