/**
 * Приём заявок с лендинга «Возвращение в лето».
 * Пишет каждую заявку в Google-таблицу и дублирует письмом на почту.
 *
 * Как подключить — см. README.md, раздел «Заявки».
 */

// Куда дублировать заявки письмом. Можно указать несколько через запятую.
var NOTIFY_EMAIL = 'ndtravel365@gmail.com';

// Если скрипт создан отдельно на script.google.com (а не из меню таблицы),
// вставьте сюда ID таблицы — часть её адреса между /d/ и /edit.
// Если скрипт открыт из таблицы через «Расширения → Apps Script», оставьте пустым.
var SHEET_ID = '';

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    var book = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    var sheet = book.getSheets()[0];

    // При первом запуске добавляем шапку таблицы
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Дата', 'Имя', 'Телефон', 'Формат тура', 'Способ связи', 'Комментарий', 'Страница']);
      sheet.setFrozenRows(1);
    }

    var now = new Date();
    // Две заявки в одну секунду не должны затереть друг друга
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
        now,
        asText(p.name),
        asText(p.phone),
        asText(p.plan),
        asText(p.channel),
        asText(p.comment),
        asText(p.page)
      ]);
    } finally {
      lock.releaseLock();
    }

    if (NOTIFY_EMAIL) {
      var body =
        'Новая заявка с лендинга «Возвращение в лето»\n\n' +
        'Имя: ' + (p.name || '—') + '\n' +
        'Телефон: ' + (p.phone || '—') + '\n' +
        'Формат тура: ' + (p.plan || '—') + '\n' +
        'Способ связи: ' + (p.channel || '—') + '\n' +
        'Комментарий: ' + (p.comment || '—') + '\n\n' +
        'Время: ' + Utilities.formatDate(now, 'Europe/Minsk', 'dd.MM.yyyy HH:mm') + '\n' +
        'Страница: ' + (p.page || '—');

      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'Заявка «Возвращение в лето»: ' + (p.name || 'без имени') + ', ' + (p.phone || ''),
        body: body
      });
    }

    return ContentService.createTextOutput('ok');
  } catch (err) {
    // Заявку всё равно не теряем: пишем ошибку в журнал выполнения
    console.error(err);
    return ContentService.createTextOutput('error');
  }
}

// Таблица читает «+375 …» как число, а «=…» как формулу. Апостроф в начале
// заставляет её сохранить значение как обычный текст.
function asText(value) {
  var s = String(value || '').slice(0, 2000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doGet() {
  return ContentService.createTextOutput('Приём заявок работает');
}
