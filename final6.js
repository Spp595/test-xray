(function () {
    'use strict';

    if (window.plugin_auth_lock_ready) return;
    window.plugin_auth_lock_ready = true;

    var network = new Lampa.Reguest();
    var enteredCode = '';
    var selectedIndex = 0;
    var buttons = [];

    function waitBody(callback){
        if(document.body) callback();
        else setTimeout(function(){ waitBody(callback); }, 100);
    }

    waitBody(function(){

        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = '#2b2b2b';
        overlay.style.color = '#fff';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '999999';
        overlay.style.fontFamily = 'Arial';

        document.body.appendChild(overlay);

        function getLuid(){
            return Lampa.Storage.get('lampa_uid') || localStorage.getItem('lampa_uid') || 'unknown';
        }

        function render(){

            overlay.innerHTML =
                '<div style="font-size:36px;margin-bottom:20px;">Авторизация</div>' +
                '<div style="margin-bottom:10px;">LUID: <b>'+getLuid()+'</b></div>' +
                '<div id="code" style="font-size:32px;letter-spacing:10px;margin-bottom:30px;">______</div>' +
                '<div id="keyboard" style="width:260px;display:flex;flex-wrap:wrap;justify-content:center;"></div>' +
                '<div id="msg" style="margin-top:20px;color:#ff6b6b;"></div>';

            var keyboard = document.getElementById('keyboard');
            buttons = [];

            var keys = ['1','2','3','4','5','6','7','8','9','C','0','OK'];

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

                keyboard.appendChild(btn);
                buttons.push(btn);
            });

            updateFocus();
        }

        function updateDisplay(){
            var masked = enteredCode.padEnd(6,'_');
            document.getElementById('code').innerText = masked;
        }

        function updateFocus(){
            buttons.forEach(function(btn,i){
                btn.style.background = (i === selectedIndex) ? '#888' : '#444';
            });
        }

        function handleSelect(){

            var value = buttons[selectedIndex].innerText;

            if(value === 'C'){
                enteredCode = '';
                updateDisplay();
                return;
            }

            if(value === 'OK'){
                if(enteredCode.length === 6) sendCode();
                return;
            }

            if(enteredCode.length < 6){
                enteredCode += value;
                updateDisplay();
            }
        }

        function sendCode(){

            var luid = getLuid();
            var url = 'https://api.sp595.ru/api/auth/' + luid + '/' + enteredCode;

            network.silent(url, function(result){

                if (typeof result === 'string'){
                    try{ result = JSON.parse(result); }catch(e){}
                }

                if(result && result.success === true){
                    overlay.innerHTML =
                        '<div style="font-size:36px;color:#4CAF50;">Авторизация успешна</div>' +
                        '<div style="margin-top:20px;">Перезагрузите страницу</div>';
                }else{
                    document.getElementById('msg').innerText = 'Неверный код';
                    enteredCode = '';
                    updateDisplay();
                }

            }, function(){
                document.getElementById('msg').innerText = 'Ошибка запроса';
            });
        }

        document.addEventListener('keydown', function(e){

            var cols = 3;

            if(e.key === 'ArrowRight'){
                if(selectedIndex % cols < 2) selectedIndex++;
            }
            if(e.key === 'ArrowLeft'){
                if(selectedIndex % cols > 0) selectedIndex--;
            }
            if(e.key === 'ArrowDown'){
                if(selectedIndex + cols < buttons.length) selectedIndex += cols;
            }
            if(e.key === 'ArrowUp'){
                if(selectedIndex - cols >= 0) selectedIndex -= cols;
            }
            if(e.key === 'Enter'){
                handleSelect();
            }

            updateFocus();
        });

        function checkInitial(){

            var luid = getLuid();
            var url = 'https://api.sp595.ru/api/auth/' + luid;

            network.silent(url, function(result){

                if (typeof result === 'string'){
                    try{ result = JSON.parse(result); }catch(e){}
                }

                if(result && result.message === 'Успешно'){
                    overlay.remove();
                }else{
                    render();
                    updateDisplay();
                }

            }, function(){
                render();
                updateDisplay();
            });
        }

        setTimeout(checkInitial, 1500);

    });

})();
