# Agna Gandhi website — Google Sheets enquiry CRM setup

This package includes the existing website plus a Google Apps Script backend. It is **not live** until the Apps Script is deployed and its `/exec` URL is added to `Agna-Gandhi-Professional-Website/site-config.js`.

## Included features
- Mandatory contact number with browser and server-side validation (7–15 digits after punctuation is removed; supports country codes).
- Each enquiry is saved to a private Google Sheet with a unique ID and timestamp.
- Email notification to `enquiries@agnagandhi.com`, including the enquiry ID and a link to the private tracker.
- Follow-up fields in the sheet: status, assigned person, last contact date, next follow-up date, notes and last reminder sent.
- Daily email reminder for follow-ups due today or overdue; closed and not-proceeding records are excluded.
- Status dropdown, frozen header, filters and formatted columns.
- Basic honeypot and server-side validation.

## 1. Create the backend
1. Sign in with the Google Workspace account that owns `enquiries@agnagandhi.com`.
2. Open https://script.google.com/ and create a project named `Agna Gandhi Website Enquiries`.
3. Copy the supplied `Code.gs` contents into the Apps Script editor and save.
4. In **Project Settings**, set the time zone to **Asia/Kolkata**.
5. Select `setup` in the function dropdown and click **Run**.
6. Approve the requested Google Sheets, email and trigger permissions.
7. Open **Execution log** and copy the spreadsheet URL. The script creates `Agna Gandhi — Website Enquiries` and the `Website Enquiries` tab.
8. Keep the spreadsheet private. Share it only with people authorised to manage enquiries; never enable public or “anyone with the link” access.

The sheet contains these fields: Enquiry ID, Received At, Status, Full Name, Email, Company / Organisation, Contact Number, Matter Type, Non-confidential Description, Source, Assigned To, Last Contact Date, Next Follow-up Date, Follow-up Notes and Last Reminder Sent.

## 2. Deploy as a web app
1. In Apps Script click **Deploy → New deployment**.
2. Select **Web app** as the deployment type.
3. Description: `Website enquiry endpoint`.
4. **Execute as:** Me.
5. **Who has access:** Anyone, so public visitors can submit the form. This makes the endpoint publicly callable; the spreadsheet itself must remain private.
6. Click **Deploy**, authorise if prompted, and copy the URL ending in `/exec`. Do not use the `/dev` test URL.

## 3. Connect the website
1. Open `Agna-Gandhi-Professional-Website/site-config.js`.
2. Replace `PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with your deployed URL, keeping the quotes. Example format only: `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`.
3. Save the file and deploy/upload the updated website to the same hosting location as the existing site.

## 4. Test before launch
- Submit a test enquiry using your own email and phone number, with non-confidential sample text.
- Confirm a confirmation page appears, exactly one row is added, and a notification reaches `enquiries@agnagandhi.com`.
- Try submitting without a contact number; browser validation should block it. Server-side validation also rejects invalid submissions.
- In the Sheet, set a test record's Next Follow-up Date to today and run `sendFollowUpReminders` manually once from Apps Script to test reminder email. Remove the test record afterwards.
- The daily reminder trigger is created by `setup()`. It runs around 9 AM in the Apps Script project's timezone (set that to Asia/Kolkata).
- If Apps Script code changes after deployment, use **Deploy → Manage deployments → Edit → New version → Deploy**.

## Privacy and operational cautions
- The form is for an initial, non-confidential enquiry only. It must not solicit privileged material, sensitive personal information or case documents.
- The Sheet contains personal data (names, emails, phone numbers and enquiry text). Restrict access, secure the Google account with 2-Step Verification, and set an appropriate retention/deletion policy.
- Public Apps Script web apps can be abused. The honeypot and validation are basic protections, not a full CAPTCHA or rate limiter. Monitor usage and quotas.
- The daily reminder is a notification tool, not a substitute for checking the tracker.
- This is a lightweight enquiry tracker, not a full CRM or secure case-management system. Review the privacy notice and applicable professional-conduct requirements before launch.
