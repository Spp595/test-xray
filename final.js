(function () {
    'use strict';

    var network = new Lampa.Reguest();

    function getLuid() {
        return localStorage.getItem('lampa_uid') || 'unknown_luid';
    }

    function checkAuth(callback) {
        var luid = getLuid();

        network.clear();
        network.timeout(5000);

        network.silent(
            'https://api.sp595.ru/api/auth/' + luid,
            function (result) {
                if (result.message && result.message.includes('Успешно')) {
                    callback(true);
                } else {
                    callback(false);
                }
            },
            function () {
                callback(false);
            }
        );
    }

    function createOverlay() {
        document.body.innerHTML = '';
        document.body.style.background = '#2b2b2b';

        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = '#2b2b2b';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.color = 'white';
        overlay.style.fontFamily = 'Arial';
        overlay.style.zIndex = '999999';

        var title = document.createElement('div');
        title.innerText = 'НЕОБХОДИМА АВТОРИЗАЦИЯ';
        title.style.fontSize = '32px';
        title.style.marginBottom = '20px';

        var luidText = document.createElement('div');
        luidText.innerText = 'LUID: ' + getLuid();
        luidText.style.marginBottom = '30px';

        var codeDisplay = document.createElement('div');
        codeDisplay.style.fontSize = '28px';
        codeDisplay.style.letterSpacing = '10px';
        codeDisplay.style.marginBottom = '20px';

        var keyboard = document.createElement('div');
        keyboard.style.display = 'flex';
        keyboard.style.flexWrap = 'wrap';
        keyboard.style.width = '240px';
        keyboard.style.justifyContent = 'center';

        var keys = ['1','2','3','4','5','6','7','8','9','0','←','OK'];
        var buttons = [];
        var selectedIndex = 0;
        var enteredCode = '';

        function updateDisplay() {
            codeDisplay.innerText = enteredCode;
        }

        function updateFocus() {
            buttons.forEach(function(btn, i){
                btn.style.background = (i === selectedIndex) ? '#888' : '#444';
            });
        }

        function sendCode() {
            if (enteredCode.length !== 6) return;

            var luid = getLuid();

            network.clear();
            network.timeout(5000);

            network.silent(
                'https://api.sp595.ru/api/auth/' + luid + '/' + enteredCode,
                function (result) {
                    codeDisplay.innerText = 'Перезагрузите страницу';
                },
                function () {
                    codeDisplay.innerText = 'Ошибка соединения';
                }
            );
        }

        function handleSelect() {
            var value = keys[selectedIndex];

            if (value === '←') {
                enteredCode = enteredCode.slice(0, -1);
                updateDisplay();
            } 
            else if (value === 'OK') {
                sendCode();
            } 
            else {
                if (enteredCode.length < 6) {
                    enteredCode += value;
                    updateDisplay();
                }
            }
        }

        keys.forEach(function(key){
            var btn = document.createElement('div');
            btn.innerText = key;
            btn.style.width = '70px';
            btn.style.height = '60px';
            btn.style.margin = '5px';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.background = '#444';
            btn.style.borderRadius = '6px';
            btn.style.fontSize = '22px';
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', function(){
                selectedIndex = buttons.indexOf(btn);
                updateFocus();
                handleSelect();
            });

            buttons.push(btn);
            keyboard.appendChild(btn);
        });

        document.addEventListener('keydown', function(e){

            if (e.key >= '0' && e.key <= '9') {
                if (enteredCode.length < 6) {
                    enteredCode += e.key;
                    updateDisplay();
                }
            }

            if (e.key === 'Backspace') {
                enteredCode = enteredCode.slice(0, -1);
                updateDisplay();
            }

            if (e.key === 'ArrowRight') {
                selectedIndex = (selectedIndex + 1) % buttons.length;
                updateFocus();
            }
            if (e.key === 'ArrowLeft') {
                selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;
                updateFocus();
            }
            if (e.key === 'ArrowDown') {
                selectedIndex = (selectedIndex + 3) % buttons.length;
                updateFocus();
            }
            if (e.key === 'ArrowUp') {
                selectedIndex = (selectedIndex - 3 + buttons.length) % buttons.length;
                updateFocus();
            }
            if (e.key === 'Enter') {
                handleSelect();
            }
        });

        overlay.appendChild(title);
        overlay.appendChild(luidText);
        overlay.appendChild(codeDisplay);
        overlay.appendChild(keyboard);
        document.body.appendChild(overlay);

        updateFocus();
    }

    // 🔥 Блокируем экран сразу
    document.body.style.display = 'none';

    document.addEventListener('DOMContentLoaded', function(){
        checkAuth(function(auth){
            if (!auth) {
                createOverlay();
            } else {
                document.body.style.display = 'block';
            }
        });
    });

})();
