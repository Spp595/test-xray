(function () {
    'use strict';

    function LampaUIDInterface() {
        var html;
        var network = new Lampa.Reguest();

        this.create = function () {
            // Создаем контейнер для UID и статуса
            html = $('<div class="lampa-uid-widget">' +
                     '<div id="lampa-uid" style="margin-bottom:5px;"></div>' +
                     '<div id="lampa-auth-status"></div>' +
                     '</div>');
        };

        // Получение Lampa UID
        this.getLuid = function () {
            if(window.LampaUID) return window.LampaUID;
            console.warn("Lampa UID не найден!");
            return "unknown_luid";
        };

        // Отображение UID
        this.showLuid = function () {
            $('#lampa-uid').text("Lampa UID: " + this.getLuid());
        };

        // Проверка авторизации через API
        this.checkAuth = function () {
            var luid = this.getLuid();
            network.clear();
            network.timeout(5000);
            network.silent("https://api.sp595.ru/api/auth/" + luid, 
                function (result) {
                    var message = result.message || '';
                    $('#lampa-auth-status').text(message.includes("Успешно") ? "Авторизация: Есть" : "Авторизация: Нет");
                },
                function () {
                    console.log("Ошибка проверки UID");
                    $('#lampa-auth-status').text("Ошибка проверки UID");
                }
            );
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            if(html) {
                html.remove();
                html = null;
            }
        };
    }

    var lampaUIDInterface = new LampaUIDInterface();

    $(document).ready(function () {
        setTimeout(function () {
            // Создаем интерфейс и добавляем в DOM
            lampaUIDInterface.create();
            var widget = lampaUIDInterface.render();
            // Добавляем виджет в header (или куда нужно)
            $('.head__time').after(widget);

            // Отображаем LUID и проверяем авторизацию
            lampaUIDInterface.showLuid();
            lampaUIDInterface.checkAuth();
        }, 2000); // задержка, чтобы LampaUID точно сгенерировался
    });

})();
