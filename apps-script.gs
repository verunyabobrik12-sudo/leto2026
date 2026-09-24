/**
 * Приём заявок с лендинга «Возвращение в лето».
 * Пишет каждую заявку в Google-таблицу и дублирует письмом на почту.
 *
 * Как подключить — см. README.md, раздел «Заявки».
 */

// Куда дублировать заявки письмом. Можно указать несколько через запятую.
var NOTIFY_EMAIL = 'ndtravel365@gmail.com';

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // При первом запуске добавляем шапку таблицы
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Дата', 'Имя', 'Телефон', 'Формат тура', 'Способ связи', 'Комментарий', 'Страница']);
      sheet.setFrozenRows(1);
    }

    var now = new Date();
    sheet.appendRow([
      now,
      p.name || '',
      p.phone || '',
      p.plan || '',
      p.channel || '',
      p.comment || '',
      p.page || ''
    ]);

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

function doGet() {
  return ContentService.createTextOutput('Приём заявок работает');
}
