(function () {
    'use strict';

    if (window.plugin_auth_lock_ready) return;
    window.plugin_auth_lock_ready = true;

    function start() {
        var network = new Lampa.Reguest();

        function getLuid() {
            return Lampa.Storage.get('lampa_uid') || localStorage.getItem('lampa_uid');
        }

        function showBlockScreen() {

            if ($('#auth-lock-screen').length) return;

            var overlay = $(
                '<div id="auth-lock-screen" style="' +
                'position:fixed;' +
                'top:0;left:0;' +
                'width:100%;height:100%;' +
                'background:rgba(0,0,0,0.85);' +
                'z-index:999999;' +
                'display:flex;' +
                'align-items:center;' +
                'justify-content:center;' +
                'flex-direction:column;' +
                'text-align:center;' +
                'color:white;' +
                'font-size:32px;' +
                '">' +
                '<div style="margin-bottom:20px;">Необходимо авторизоваться</div>' +
                '<div style="font-size:18px;opacity:0.7;">Обратитесь к администратору</div>' +
                '</div>'
            );

            $('body').append(overlay);

            // Полная блокировка управления
            $(document).on('keydown.authlock', function(e){
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        }

        function checkAuth() {
            var luid = getLuid();

            if (!luid) {
                showBlockScreen();
                return;
            }

            network.clear();
            network.timeout(5000);

            network.silent(
                'https://api.sp595.ru/api/auth/' + luid,
                function (result) {

                    if (typeof result === 'string') {
                        try {
                            result = JSON.parse(result);
                        } catch(e){}
                    }

                    if (!result || result.message !== 'Успешно') {
                        showBlockScreen();
                    }

                },
                function () {
                    showBlockScreen();
                }
            );
        }

        setTimeout(checkAuth, 2000);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();
