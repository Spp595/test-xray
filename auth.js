// Минимальный плагин Lampa
export default class LampaUIDPlugin {
    constructor() {
        this.api_url = "https://api.sp595.ru/api/auth";
    }

    init() {
        // Показываем Lampa UID
        this.showLuid();

        // Проверяем авторизацию
        this.checkAuth();
    }

    getLuid() {
        // Lampa сама генерирует LUID и хранит его в window.LampaUID
        if(window.LampaUID) {
            return window.LampaUID;
        } else {
            console.warn("Lampa UID не найден!");
            return "unknown_luid";
        }
    }

    showLuid() {
        let existing = document.getElementById("lampa-uid-display");
        if(existing) return;

        let div = document.createElement("div");
        div.id = "lampa-uid-display";
        div.innerText = "Lampa UID: " + this.getLuid();
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

    async checkAuth() {
        let luid = this.getLuid();
        try {
            let res = await fetch(`${this.api_url}/${luid}`);
            let data = await res.json();
            let statusDiv = document.getElementById("lampa-auth-status");

            if(!statusDiv) {
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
        } catch(e) {
            console.error("Ошибка проверки LUID:", e);
        }
    }
}

// Автоинициализация
window.LampaUIDPlugin = new LampaUIDPlugin();
window.LampaUIDPlugin.init();
