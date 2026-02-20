(function () {
    'use strict';

    if (window.plugin_auth_lock_ready) return;
    window.plugin_auth_lock_ready = true;

    function start() {

        var network = new Lampa.Reguest();

        function getLuid() {
            return Lampa.Storage.get('lampa_uid') || localStorage.getItem('lampa_uid') || 'unknown';
        }

        function hardLock() {

            var luid = getLuid();

            // Останавливаем всё
            try { Lampa.Player.stop(); } catch(e){}

            // Удаляем весь интерфейс
            document.body.innerHTML = '';

            // Убираем прокрутку
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.body.style.overflow = 'hidden';
            document.body.style.background = '#2b2b2b';

            // Создаем новый корневой контейнер
            var lockScreen = document.createElement('div');
            lockScreen.style.position = 'fixed';
            lockScreen.style.top = '0';
            lockScreen.style.left = '0';
            lockScreen.style.width = '100%';
            lockScreen.style.height = '100%';
            lockScreen.style.background = '#2b2b2b';
            lockScreen.style.display = 'flex';
            lockScreen.style.flexDirection = 'column';
            lockScreen.style.alignItems = 'center';
            lockScreen.style.justifyContent = 'center';
            lockScreen.style.color = '#ffffff';
            lockScreen.style.fontFamily = 'Arial';
            lockScreen.style.textAlign = 'center';

            lockScreen.innerHTML =
                '<div style="font-size:42px;margin-bottom:30px;">Необходимо авторизоваться</div>' +
                '<div style="font-size:20px;opacity:0.8;margin-bottom:20px;">Ваш LUID:</div>' +
                '<div style="font-size:28px;font-weight:bold;letter-spacing:2px;">' + luid + '</div>';

            document.body.appendChild(lockScreen);

            // Полная блокировка клавиш
            document.addEventListener('keydown', function(e){
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, true);

            document.addEventListener('keypress', function(e){
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, true);
        }

        function checkAuth() {

            var luid = getLuid();

            if (!luid || luid === 'unknown') {
                hardLock();
                return;
            }

            network.clear();
            network.timeout(5000);

            network.silent(
                'https://api.sp595.ru/api/auth/' + luid,
                function (result) {

                    if (typeof result === 'string') {
                        try { result = JSON.parse(result); } catch(e){}
                    }

                    if (!result || result.message !== 'Успешно') {
                        hardLock();
                    }

                },
                function () {
                    hardLock();
                }
            );
        }

        setTimeout(checkAuth, 1500);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();
