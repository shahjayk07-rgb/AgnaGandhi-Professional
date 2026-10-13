/** Agna Gandhi website enquiry + lightweight follow-up CRM.
 * Run setup() once, then deploy as a Web App (execute as you; access: anyone).
 * Store only initial, non-confidential enquiries. Do not invite confidential material.
 */
const CONFIG = {
  NOTIFY_TO: 'enquiries@agnagandhi.com',
  SPREADSHEET_PROPERTY: 'ENQUIRY_SPREADSHEET_ID',
  SHEET_NAME: 'Website Enquiries',
  MAX_DETAILS: 1800,
  MAX_FIELD: 200,
  REMINDER_HOUR: 9,
  STATUSES: ['New', 'Contacted', 'Follow-up Due', 'In Discussion', 'Closed', 'Not Proceeding']
};
const HEADERS = [
  'Enquiry ID', 'Received At', 'Status', 'Full Name', 'Email', 'Company / Organisation',
  'Contact Number', 'Matter Type', 'Non-confidential Description', 'Source',
  'Assigned To', 'Last Contact Date', 'Next Follow-up Date', 'Follow-up Notes', 'Last Reminder Sent'
];

function setup() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(CONFIG.SPREADSHEET_PROPERTY);
  let ss;
  if (id) ss = SpreadsheetApp.openById(id);
  else {
    ss = SpreadsheetApp.create('Agna Gandhi — Website Enquiries');
    props.setProperty(CONFIG.SPREADSHEET_PROPERTY, ss.getId());
  }
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  ensureHeaders_(sheet);
  formatSheet_(sheet);
  createDailyReminderTrigger_();
  Logger.log('Enquiry spreadsheet: ' + ss.getUrl());
  return ss.getUrl();
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  } else {
    const existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(String);
    HEADERS.forEach((h) => {
      if (existing.indexOf(h) === -1) {
        const col = sheet.getLastColumn() + 1;
        sheet.getRange(1, col).setValue(h);
        existing.push(h);
      }
    });
  }
  sheet.setFrozenRows(1);
}

function formatSheet_(sheet) {
  const lastCol = HEADERS.length;
  sheet.getRange(1, 1, 1, lastCol).setFontWeight('bold').setBackground('#711820').setFontColor('#ffffff').setWrap(true);
  sheet.setRowHeight(1, 42);
  [170,170,130,180,220,200,155,220,380,170,160,150,160,320,170].forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  sheet.getRange('I:I').setWrap(true);
  sheet.getRange('N:N').setWrap(true);
  sheet.getRange('B:B').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('L:M').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('O:O').setNumberFormat('yyyy-mm-dd hh:mm');
  const statusRule = SpreadsheetApp.newDataValidation().requireValueInList(CONFIG.STATUSES, true).setAllowInvalid(false).build();
  sheet.getRange(2, 3, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(statusRule);
  if (!sheet.getFilter() && sheet.getLastRow() > 0) sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 2), lastCol).createFilter();
}

function doPost(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  // Honeypot: silently reject simple bots that fill hidden fields.
  if (String(p.website || '').trim()) return confirmation_('Thank you', 'Your submission has been received.');

  const name = clean_(p.name, 120);
  const email = clean_(p.email, 160).toLowerCase();
  const organisation = clean_(p.organisation, 160);
  const phone = clean_(p.phone, 25);
  const phoneDigits = phone.replace(/\D/g, '');
  const matter = clean_(p.matter, 100);
  const details = clean_(p.details, CONFIG.MAX_DETAILS);
  const consent = p.consent === 'yes';
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phoneDigits.length < 7 || phoneDigits.length > 15 || !/^[+0-9() .-]{7,25}$/.test(phone) || !matter || !details || !consent) {
    return confirmation_('Please review your enquiry', 'Some required information was missing or invalid. A valid contact number is required. Please return to the website and try again.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const id = PropertiesService.getScriptProperties().getProperty(CONFIG.SPREADSHEET_PROPERTY);
    if (!id) throw new Error('Run setup() once from the Apps Script editor first.');
    const ss = SpreadsheetApp.openById(id);
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) throw new Error('Enquiry sheet not found. Run setup() again.');
    ensureHeaders_(sheet);
    const timestamp = new Date();
    const enquiryId = 'AG-' + Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random() * 900);
    const rowData = {
      'Enquiry ID': enquiryId, 'Received At': timestamp, 'Status': 'New', 'Full Name': name,
      'Email': email, 'Company / Organisation': organisation, 'Contact Number': phone,
      'Matter Type': matter, 'Non-confidential Description': details,
      'Source': clean_(p.source || 'Website', 100), 'Assigned To': '', 'Last Contact Date': '',
      'Next Follow-up Date': '', 'Follow-up Notes': '', 'Last Reminder Sent': ''
    };
    const row = HEADERS.map(h => rowData[h] == null ? '' : rowData[h]);
    sheet.appendRow(row);
    const newRow = sheet.getLastRow();
    sheet.getRange(newRow, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(newRow, 12, 1, 2).setNumberFormat('yyyy-mm-dd');

    const subject = 'Website enquiry [' + enquiryId + '] — ' + matter;
    const body = [
      'A new initial, non-confidential enquiry was submitted through agnagandhi.com.', '',
      'Enquiry ID: ' + enquiryId, 'Name: ' + name, 'Email: ' + email,
      'Contact number: ' + phone, 'Company / organisation: ' + (organisation || 'Not provided'),
      'Matter: ' + matter, '', 'Description:', details, '',
      'Recorded in Google Sheet: ' + ss.getUrl(), '',
      'Next step: review the enquiry and update Status / Next Follow-up Date in the private sheet.',
      'This initial enquiry does not create a lawyer-client relationship.'
    ].join('\n');
    MailApp.sendEmail({to: CONFIG.NOTIFY_TO, replyTo: email, subject: subject, body: body, name: 'Agna Gandhi Website'});
    return confirmation_('Enquiry submitted', 'Thank you. Your initial enquiry has been recorded. A notification has been sent to the website mailbox. Please do not send confidential documents until an appropriate channel has been agreed.');
  } catch (err) {
    console.error(err);
    return confirmation_('We could not submit your enquiry', 'Please try again later or contact enquiries@agnagandhi.com from your email application. Do not include confidential information.');
  } finally {
    lock.releaseLock();
  }
}

/** Daily reminder for follow-ups due today or overdue. Runs as the spreadsheet owner. */
function sendFollowUpReminders() {
  const id = PropertiesService.getScriptProperties().getProperty(CONFIG.SPREADSHEET_PROPERTY);
  if (!id) throw new Error('Run setup() first.');
  const ss = SpreadsheetApp.openById(id);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;
  const values = sheet.getDataRange().getValues();
  const header = values[0].map(String);
  const idx = {}; header.forEach((h, i) => idx[h] = i);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const status = String(row[idx['Status']] || '');
    const next = row[idx['Next Follow-up Date']];
    if (!(next instanceof Date) || ['Closed', 'Not Proceeding'].includes(status)) continue;
    const dueDay = new Date(next.getFullYear(), next.getMonth(), next.getDate());
    if (dueDay > today) continue;
    const lastReminder = row[idx['Last Reminder Sent']];
    if (lastReminder instanceof Date && lastReminder >= today) continue;
    due.push({rowNumber:r+1, id:row[idx['Enquiry ID']], name:row[idx['Full Name']], phone:row[idx['Contact Number']], email:row[idx['Email']], status, date:dueDay, notes:row[idx['Follow-up Notes']]});
  }
  if (!due.length) return;
  const lines = due.map(x => `${x.id} | ${x.name} | ${x.phone} | ${x.email} | Status: ${x.status} | Due: ${Utilities.formatDate(x.date, Session.getScriptTimeZone(), 'yyyy-MM-dd')} | Notes: ${x.notes || '—'}`);
  MailApp.sendEmail({to: CONFIG.NOTIFY_TO, subject: `Follow-up reminders: ${due.length} due`, body: 'These website enquiry follow-ups are due today or overdue:\n\n' + lines.join('\n\n') + '\n\nOpen the private tracker: ' + ss.getUrl()});
  due.forEach(x => sheet.getRange(x.rowNumber, idx['Last Reminder Sent'] + 1).setValue(now));
}

function createDailyReminderTrigger_() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sendFollowUpReminders').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendFollowUpReminders').timeBased().everyDays(1).atHour(CONFIG.REMINDER_HOUR).create();
}

function clean_(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max || CONFIG.MAX_FIELD);
}
function confirmation_(title, message) {
  const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml_(title) + '</title><style>body{font-family:Arial,sans-serif;background:#f7f3ec;color:#171615;margin:0;padding:8vh 20px}.card{max-width:620px;margin:auto;background:#fffdf9;border:1px solid #ddd3c6;padding:32px}h1{font-size:28px}p{line-height:1.6}a{color:#781923}</style></head><body><main class="card"><h1>' + escapeHtml_(title) + '</h1><p>' + escapeHtml_(message) + '</p><p><a href="https://agnagandhi.com/enquiry.html">Return to Agna Gandhi’s website</a></p></main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle(title);
}
function escapeHtml_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
