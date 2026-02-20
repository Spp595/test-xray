(function () {
    'use strict';

    if (window.plugin_lampa_uid_ready) return;
    window.plugin_lampa_uid_ready = true;

    function LampaUIDInterface() {
        var html;
        var network = new Lampa.Reguest();

        this.create = function () {
            html = $('<div class="lampa-uid-widget" style="margin-left:15px;">' +
                     '<div id="lampa-uid" style="font-size:14px;"></div>' +
                     '<div id="lampa-auth-status" style="font-size:13px;"></div>' +
                     '</div>');
        };

        // Получение Lampa UID
        this.getLuid = function () {
            var uid = '';

            if (window.Lampa && Lampa.Storage) {
                uid = Lampa.Storage.get('lampa_uid') || Lampa.Storage.field('lampa_uid');
            }

            if (!uid) {
                uid = localStorage.getItem('lampa_uid');
            }

            if (!uid) {
                console.warn('Lampa UID не найден');
                return 'unknown_luid';
            }

            return uid;
        };

        // Показ UID
        this.showLuid = function () {
            $('#lampa-uid').text('Lampa UID: ' + this.getLuid());
        };

        // Проверка авторизации
        this.checkAuth = function () {
            var luid = this.getLuid();
            var self = this;

            if (!luid || luid === 'unknown_luid') {
                $('#lampa-auth-status').text('UID не найден');
                return;
            }

            network.clear();
            network.timeout(5000);
            network.silent(
                'https://api.sp595.ru/api/auth/' + luid,
                function (result) {
                    var message = result && result.message ? result.message : '';
                    var success = message.indexOf('Успешно') !== -1;

                    $('#lampa-auth-status')
                        .text(success ? 'Авторизация: Есть' : 'Авторизация: Нет')
                        .css('color', success ? '#4CAF50' : '#F44336');
                },
                function () {
                    $('#lampa-auth-status')
                        .text('Ошибка проверки')
                        .css('color', '#F44336');
                }
            );
        };

        this.render = function () {
            return html;
        };
    }

    function start() {
        var lampaUIDInterface = new LampaUIDInterface();
        lampaUIDInterface.create();

        var widget = lampaUIDInterface.render();

        // Добавляем рядом с временем
        $('.head__time').after(widget);

        // Небольшая задержка чтобы UID успел появиться
        setTimeout(function () {
            lampaUIDInterface.showLuid();
            lampaUIDInterface.checkAuth();
        }, 2000);
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }

})();
