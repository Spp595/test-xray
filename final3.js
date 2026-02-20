(function () {
    'use strict';

    if (window.plugin_auth_lock_ready) return;
    window.plugin_auth_lock_ready = true;

    var network = new Lampa.Reguest();

    // ========================
    // 1️⃣ Создаём overlay сразу
    // ========================
    var overlay = document.createElement('div');
    overlay.id = 'auth-lock-screen';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = '#2b2b2b';
    overlay.style.color = '#ffffff';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontFamily = 'Arial';
    overlay.style.textAlign = 'center';
    overlay.style.zIndex = '999999';
    overlay.style.fontSize = '32px';
    overlay.innerHTML = '<div style="margin-bottom:20px;">Проверка авторизации...</div>';
    document.body.appendChild(overlay);

    // Блокируем все клавиши
    document.addEventListener('keydown', function(e){ e.preventDefault(); e.stopPropagation(); return false; }, true);
    document.addEventListener('keypress', function(e){ e.preventDefault(); e.stopPropagation(); return false; }, true);

    // ========================
    // 2️⃣ Получаем LUID
    // ========================
    function getLuid() {
        return Lampa.Storage.get('lampa_uid') || localStorage.getItem('lampa_uid') || 'unknown';
    }

    function showLockScreen() {
        var luid = getLuid();
        overlay.innerHTML =
            '<div style="font-size:42px;margin-bottom:30px;">Необходимо авторизоваться</div>' +
            '<div style="font-size:20px;opacity:0.8;margin-bottom:20px;">Ваш LUID:</div>' +
            '<div style="font-size:28px;font-weight:bold;letter-spacing:2px;">' + luid + '</div>';
    }

    function removeLockScreen() {
        try { overlay.remove(); } catch(e){}
        document.removeEventListener('keydown', this, true);
        document.removeEventListener('keypress', this, true);
    }

    // ========================
    // 3️⃣ Проверка авторизации
    // ========================
    function checkAuth() {
        var luid = getLuid();
        if (!luid || luid === 'unknown') {
            showLockScreen();
            return;
        }

        network.clear();
        network.timeout(5000);

        network.silent(
            'https://api.sp595.ru/api/auth/' + luid,
            function(result){
                if (typeof result === 'string') {
                    try { result = JSON.parse(result); } catch(e){}
                }

                if (result && result.message === 'Успешно') {
                    removeLockScreen(); // показываем интерфейс
                } else {
                    showLockScreen(); // остаётся блокировка
                }
            },
            function(){
                showLockScreen(); // ошибка запроса
            }
        );
    }

    // ========================
    // 4️⃣ Старт проверки после app ready
    // ========================
    function start() {
        checkAuth();
        // можно каждые 10 сек проверять
        setInterval(checkAuth, 10000);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function(e){
            if (e.type === 'ready') start();
        });
    }

})();
