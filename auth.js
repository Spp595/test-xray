var plugin_auth = function() {
    var self = this;

    self.api_url = "http://localhost:8000/api/auth";

    // Получаем Lampa UID (предположим, Lampa хранит его в window.LampaUID)
    self.getLuid = function() {
        if(window.LampaUID) {
            return window.LampaUID;
        } else {
            console.warn("Lampa UID не найден!");
            return "unknown_luid";
        }
    };

    // Проверка наличия LUID в базе
    self.checkAuth = function(callback) {
        var luid = self.getLuid();
        fetch(`${self.api_url}/${luid}`)
            .then(res => res.json())
            .then(data => {
                callback(data.message.includes("Успешно"), data.message);
            })
            .catch(err => callback(false, err));
    };

    // Отображение LUID снизу экрана
    self.showLuid = function() {
        var existing = document.getElementById("lampa-uid-display");
        if(existing) return;

        var div = document.createElement("div");
        div.id = "lampa-uid-display";
        div.innerText = "Lampa UID: " + self.getLuid();
        div.style = `
            position: fixed; bottom: 10px; left: 50%; transform: translateX(-50%);
            background: #000000aa; color: #fff; padding: 5px 10px; border-radius: 5px;
            font-size: 16px; z-index: 9999; font-family: Arial, sans-serif;
        `;
        document.body.appendChild(div);
    };

    // Инициализация плагина
    self.init = function() {
        self.showLuid();

        self.checkAuth(function(success, msg){
            console.log("Проверка LUID:", success, msg);

            // Статус авторизации
            var statusDiv = document.getElementById("lampa-auth-status");
            if(!statusDiv) {
                statusDiv = document.createElement("div");
                statusDiv.id = "lampa-auth-status";
                statusDiv.style = `
                    position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
                    background: #000000aa; color: #fff; padding: 5px 10px; border-radius: 5px;
                    font-size: 16px; z-index: 9999; font-family: Arial, sans-serif;
                `;
                document.body.appendChild(statusDiv);
            }
            statusDiv.innerText = success ? "Авторизация: Есть" : "Авторизация: Нет";
        });
    };
};

// Инициализация
window.pluginAuthLampa = new plugin_auth();
window.pluginAuthLampa.init();
