/*
 * Согласие на cookie и подключение Яндекс Метрики.
 * Метрика загружается только после согласия на аналитические cookie.
 * Выбор хранится в браузере посетителя 1 год, затем сайт спросит снова.
 * Подключается на каждой странице: <script src="consent.js"></script> в <head>.
 */
(function () {
  var COUNTER = 113061341;
  var KEY = 'leto_cookie_consent';
  var YEAR = 365 * 24 * 60 * 60 * 1000;

  function readChoice() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && Date.now() - c.date < YEAR) return c;
    } catch (e) {}
    return null;
  }

  function saveChoice(analytics) {
    try { localStorage.setItem(KEY, JSON.stringify({ analytics: !!analytics, date: Date.now() })); } catch (e) {}
  }

  // Страница входа с рекламы (UTM-метки) — запоминаем на время визита, только с согласия на аналитику
  function rememberLanding() {
    try {
      if (/[?&](utm_|yclid=)/.test(location.search) && !sessionStorage.getItem("leto_landing")) {
        sessionStorage.setItem("leto_landing", location.href);
      }
    } catch (e) {}
  }

  function loadMetrika() {
    rememberLanding();
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
      k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + COUNTER, 'ym');
    ym(COUNTER, 'init', { ssr: true, webvisor: true, clickmap: true, ecommerce: 'dataLayer', referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true });
  }

  // Удалить cookie Метрики, если согласие отозвано
  function dropMetrikaCookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ym') === 0) {
        var host = location.hostname;
        document.cookie = name + '=; Max-Age=0; path=/';
        document.cookie = name + '=; Max-Age=0; path=/; domain=' + host;
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + host.split('.').slice(-2).join('.');
      }
    });
  }

  var choice = readChoice();
  if (choice && choice.analytics) loadMetrika();

  function build() {
    var box = document.createElement('div');
    box.className = 'cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Настройки cookie');
    box.innerHTML =
      '<p class="cookie-text">Мы используем cookie, чтобы сайт работал корректно, и — с вашего согласия — ' +
      'Яндекс Метрику, чтобы понимать, какие разделы полезны. <a href="politika-cookie.html">Подробнее</a></p>' +
      '<div class="cookie-settings" hidden>' +
      '  <label class="cookie-opt"><input type="checkbox" checked disabled> <span><b>Технические</b> — нужны для работы сайта, отключить нельзя</span></label>' +
      '  <label class="cookie-opt"><input type="checkbox" id="cookie-analytics"> <span><b>Аналитические</b> — Яндекс Метрика: статистика посещений</span></label>' +
      '</div>' +
      '<div class="cookie-actions">' +
      '  <button type="button" class="btn cookie-accept">Принять</button>' +
      '  <button type="button" class="cookie-btn cookie-reject">Отклонить</button>' +
      '  <button type="button" class="cookie-btn cookie-custom">Настроить</button>' +
      '  <button type="button" class="btn cookie-save" hidden>Сохранить выбор</button>' +
      '</div>';
    document.body.appendChild(box);

    var settings = box.querySelector('.cookie-settings');
    var cb = box.querySelector('#cookie-analytics');
    var saveBtn = box.querySelector('.cookie-save');
    var customBtn = box.querySelector('.cookie-custom');

    function apply(analytics) {
      var before = readChoice();
      saveChoice(analytics);
      box.hidden = true;
      if (analytics && !(before && before.analytics)) loadMetrika();
      if (!analytics && before && before.analytics) { dropMetrikaCookies(); try { sessionStorage.removeItem("leto_landing"); } catch (e) {} location.reload(); }
    }

    box.querySelector('.cookie-accept').addEventListener('click', function () { apply(true); });
    box.querySelector('.cookie-reject').addEventListener('click', function () { apply(false); });
    customBtn.addEventListener('click', function () {
      settings.hidden = false; saveBtn.hidden = false; customBtn.hidden = true;
    });
    saveBtn.addEventListener('click', function () { apply(cb.checked); });

    return {
      open: function (withSettings) {
        var c = readChoice();
        cb.checked = !!(c && c.analytics);
        settings.hidden = !withSettings; saveBtn.hidden = !withSettings; customBtn.hidden = !!withSettings;
        box.hidden = false;
      }
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var ui = build();
    if (!choice) ui.open(false); else document.querySelector('.cookie').hidden = true;
    // Ссылка «Настройки cookie» в подвале
    document.querySelectorAll('[data-cookie-settings]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); ui.open(true); });
    });
  });
})();
