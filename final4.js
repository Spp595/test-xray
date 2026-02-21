(function () {
    'use strict';

    if (window.plugin_auth_lock_ready) return;
    window.plugin_auth_lock_ready = true;

    var network = new Lampa.Reguest();
    var enteredCode = '';

    // ===== БЛОК ЭКРАНА =====
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

    document.body.appendChild(overlay);

    // Блокируем управление
    document.addEventListener('keydown', function(e){
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    function getLuid() {
        return Lampa.Storage.get('lampa_uid') || localStorage.getItem('lampa_uid') || 'unknown';
    }

    function renderLock() {
        var luid = getLuid();

        overlay.innerHTML =
            '<div style="font-size:40px;margin-bottom:20px;">Авторизация</div>' +
            '<div style="margin-bottom:15px;">LUID: <b>' + luid + '</b></div>' +
            '<div id="code-display" style="font-size:32px;letter-spacing:10px;margin-bottom:20px;">______</div>' +
            '<div id="keyboard" style="display:grid;grid-template-columns:repeat(3,80px);gap:10px;"></div>' +
            '<div id="auth-message" style="margin-top:20px;color:#ff6b6b;"></div>';

        var keyboard = document.getElementById('keyboard');

        for (let i = 1; i <= 9; i++) {
            createKey(i);
        }
        createKey('C');
        createKey(0);
        createKey('OK');

        function createKey(value) {
            var btn = document.createElement('div');
            btn.innerText = value;
            btn.style.background = '#444';
            btn.style.padding = '20px';
            btn.style.cursor = 'pointer';
            btn.style.borderRadius = '6px';
            btn.onclick = function(){
                handleInput(value);
            };
            keyboard.appendChild(btn);
        }
    }

    function updateDisplay() {
        var display = document.getElementById('code-display');
        var masked = enteredCode.padEnd(6, '_');
        display.innerText = masked;
    }

    function handleInput(value) {

        if (value === 'C') {
            enteredCode = '';
            updateDisplay();
            return;
        }

        if (value === 'OK') {
            if (enteredCode.length === 6) {
                sendCode();
            }
            return;
        }

        if (enteredCode.length < 6) {
            enteredCode += value;
            updateDisplay();
        }
    }

    function sendCode() {

        var luid = getLuid();
        var url = 'https://api.sp595.ru/api/auth/' + luid + '/' + enteredCode;

        network.clear();
        network.timeout(5000);

        network.silent(url, function(result){

            if (typeof result === 'string') {
                try { result = JSON.parse(result); } catch(e){}
            }

            if (result && result.message === 'Успешно') {
                overlay.remove();
            } else {
                showError('Неверный код');
            }

        }, function(){
            showError('Ошибка запроса');
        });
    }

    function showError(text){
        document.getElementById('auth-message').innerText = text;
        enteredCode = '';
        updateDisplay();
    }

    function checkInitialAuth() {

        var luid = getLuid();
        var url = 'https://api.sp595.ru/api/auth/' + luid;

        network.silent(url, function(result){

            if (typeof result === 'string') {
                try { result = JSON.parse(result); } catch(e){}
            }

            if (result && result.message === 'Успешно') {
                overlay.remove();
            } else {
                renderLock();
                updateDisplay();
            }

        }, function(){
            renderLock();
            updateDisplay();
        });
    }

    function start() {
        checkInitialAuth();
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function(e){
            if (e.type === 'ready') start();
        });
    }

})();
