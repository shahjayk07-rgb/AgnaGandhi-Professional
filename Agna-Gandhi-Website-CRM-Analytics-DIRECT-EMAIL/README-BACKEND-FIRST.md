# Agna Gandhi website — backend package

The existing website design and content are retained. This build adds a mandatory contact number and a Google Sheets + Apps Script enquiry tracker with follow-up fields and daily reminder emails.

Start with `GOOGLE-SHEETS-BACKEND-SETUP.md`. The backend is not live until you create the Apps Script project, run `setup()`, deploy the web app, and paste its deployed `/exec` URL into `Agna-Gandhi-Professional-Website/site-config.js`.

Do not make the spreadsheet public. Do not deploy the updated website until the backend endpoint is configured and a test enquiry successfully creates a row and notification.
