(function() {
    'use strict';

    function startPlugin() {
        if(window.plugin_lampa_uid_ready) return;
        window.plugin_lampa_uid_ready = true;

        function add() {

            // Функция для получения Lampa UID
            function getLuid() {
                if(window.LampaUID) return window.LampaUID;
                console.warn("Lampa UID не найден!");
                return "unknown_luid";
            }

            // Отображение UID снизу
            function showLuid() {
                if(document.getElementById("lampa-uid-display")) return;

                var div = document.createElement("div");
                div.id = "lampa-uid-display";
                div.innerText = "Lampa UID: " + getLuid();
                div.style = `
                    position: fixed;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #000000aa;
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 16px;
                    z-index: 9999;
                    font-family: Arial, sans-serif;
                `;
                document.body.appendChild(div);
            }

            // Проверка UID через API
            function checkAuth() {
                var luid = getLuid();
                fetch("http://localhost:8000/api/auth/" + luid)
                    .then(function(res){ return res.json(); })
                    .then(function(data){
                        var statusDiv = document.getElementById("lampa-auth-status");
                        if(!statusDiv){
                            statusDiv = document.createElement("div");
                            statusDiv.id = "lampa-auth-status";
                            statusDiv.style = `
                                position: fixed;
                                bottom: 40px;
                                left: 50%;
                                transform: translateX(-50%);
                                background: #000000aa;
                                color: #fff;
                                padding: 5px 10px;
                                border-radius: 5px;
                                font-size: 16px;
                                z-index: 9999;
                                font-family: Arial, sans-serif;
                            `;
                            document.body.appendChild(statusDiv);
                        }
                        statusDiv.innerText = data.message.includes("Успешно") ? "Авторизация: Есть" : "Авторизация: Нет";
                    })
                    .catch(function(err){
                        console.error("Ошибка проверки UID:", err);
                    });
            }

            // Инициализация
            showLuid();
            checkAuth();
        }

        if(window.appready) add(); 
        else {
            Lampa.Listener.follow('app', function(e){
                if(e.type == 'ready') add();
            });
        }
    }

    startPlugin();

})();
