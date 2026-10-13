# Agna Gandhi Professional Website

Responsive professional website package with homepage, navigation/service destinations, educational insights, enquiry form, disclaimer/privacy pages, AG SVG wordmark, favicon, GA4 tracking, and Google Sheets enquiry-backend configuration.

## Required before launch
1. Confirm the Google Workspace mailbox `enquiries@agnagandhi.com` is active.
2. Confirm the Apps Script web app is deployed and accessible to public website visitors.
3. Verify the endpoint saves a test enquiry to the private Google Sheet and sends a notification.
4. Confirm Agna's services and professional facts before publication, and have content reviewed against applicable professional conduct rules.
5. Test all links, form submission, and analytics on desktop/mobile before publishing.

No portrait of Agna is used. The hero and monogram artwork are CSS/SVG illustrations and can be replaced with approved photography later.


## Hidden Navkar Mantra reveal
Click the About navigation link nine times in a row on the same page to reveal the Mahavir Swami image and Navkar Mantra dialog. Click the close icon, click outside the dialog, or press Escape to dismiss it. This is a small devotional easter egg and does not change normal page navigation until the ninth click.


## Analytics
Google Analytics 4 is configured with Measurement ID `G-XBPD29KZ6H` in `site-config.js`. The stream was created for `https://agnagandhi.com`. See `ANALYTICS-SETUP.md` for tracked events and privacy considerations; validate live tracking using GA4 Realtime after deploying this package to the matching domain.

## Google Workspace email integration

The enquiry form is configured to submit to the Google Apps Script web app URL in `site-config.js`. The form requires a contact number and includes basic client-side validation. Confirm server-side validation, spam controls, sheet access restrictions, and email notification delivery before launch.


## Enquiry backend
The contact number is mandatory. See `../GOOGLE-SHEETS-BACKEND-SETUP.md` for Google Sheets and Apps Script setup, deployment, follow-up tracking, and reminder configuration. The current Apps Script endpoint is populated in `site-config.js`; it still needs an end-to-end test from the deployed website.
