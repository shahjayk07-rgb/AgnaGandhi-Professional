# Analytics setup — Google Analytics 4

## What is tracked
- Page views and GA4 traffic attribution (source/medium, campaign parameters and referrer where available)
- Navigation link clicks
- Main CTA clicks
- Outbound link clicks, email-link clicks and phone-link clicks
- Enquiry form start and submit-attempt events (no field values are sent)
- Scroll depth milestones at 25%, 50%, 75% and 90%
- The hidden Navkar modal opening and closing

## Activate GA4
1. Create or open the Google Analytics 4 property for the website.
2. The Web data stream is configured for `https://agnagandhi.com`.
3. In `site-config.js`, the Measurement ID is now configured in `site-config.js` as `G-XBPD29KZ6H`.
4. Deploy the full website package, then open the live website and use GA4 Realtime/DebugView to verify page views and test events. The web stream was created for `https://agnagandhi.com`; ensure that is the domain actually serving the deployed site.
5. Submit a test enquiry form only with dummy information; the configured Apps Script endpoint receives the form submission and is intended to save it in the private Google Sheet. Confirm the backend deployment and test with dummy information before launch.

## Reading incoming flow in GA4
- **Reports → Acquisition → Traffic acquisition:** see sessions by source / medium / campaign.
- **Reports → Engagement → Pages and screens:** see the pages people visit.
- **Reports → Engagement → Events:** compare `navigation_click`, `cta_click`, `outbound_click`, `enquiry_form_start`, `enquiry_form_submit_attempt`, `scroll_depth`, `navkar_modal_open`, and `navkar_modal_close`.
- Use UTM-tagged links for campaigns, e.g. `?utm_source=linkedin&utm_medium=social&utm_campaign=agna_profile` (adapt the values to the actual campaign).

## Privacy and data minimisation
- Analytics loads the GA4 tag because a real Measurement ID is configured in `site-config.js`.
- Event tracking intentionally does not transmit enquiry names, email addresses, phone numbers, or descriptions.
- Before enabling, review the privacy notice, consent requirements for the audience/jurisdictions, GA data-retention settings, and any required cookie/consent mechanism. The current package does not implement a consent banner.
- Do not add sensitive or confidential information to URLs, UTM parameters, page titles, or event parameters.

## Important limitations
- Analytics collection begins when this configured package is deployed to the domain associated with the stream and visitors load it; this package does not provide historical counts.
- The `enquiry_form_submit_attempt` event means the visitor attempted to submit the form; it does not by itself confirm that the backend saved the record or that the notification email was delivered.
- The GA4 Measurement ID is configured locally. Analytics collection will begin only when this updated site is deployed and visitors load it; no historical data is available.
