# MEDERGENCY — Life Deserves Care

A responsive multi-page frontend built with HTML5, CSS3 and vanilla JavaScript. No frontend frameworks or runtime dependencies.

## Run

Use Node.js 20+ and run `npm run dev`, then open http://127.0.0.1:4173. Run `npm run build` to create static public output in `dist/`.

## Demo journey

Find Doctors → View Profile → Choose Video/Audio, date and slot → Patient Details → Review → Simulated Payment → Confirmation → Waiting Room → Mock Call → Completed → Sample Prescription.

Use fictional patient details. Sign in with the demo shortcut or a sample Indian mobile number and OTP `123456`. Payments accept supplied sample values and do not send requests or store payment fields. Calls do not access a camera or microphone. Chat messages stay in memory. Prescriptions contain no treatment and support printing / Save as PDF.

Appointments (sample patient name only), saved doctors, demo profile, notification history and preferences use namespaced LocalStorage. Booking details temporarily use SessionStorage and are removed after confirmation. Settings provides a demo data reset. This is not secure storage for sensitive information.

## Architecture

- `js/data.js`: illustrative doctor records, FAQs and slots.
- `js/storage.js`: namespaced browser storage and escaping.
- `js/ui.js`: shared header, footer, icons, cards, modals and form validation.
- `js/main.js`: page dispatch, homepage, directory filters, general pages and optional WebMCP directory filtering.
- `js/booking.js`: profile, booking and consultation flow.
- `js/account.js`: patient account, demo authentication, records, settings and support.
- `css/style.css`, `css/responsive.css`: shared tokens, components and responsive rules.

There are 24 connected HTML entry pages. The English interface is implemented; other languages are visibly marked as planned. No external authentication, medical service, SMS, payment provider or support delivery is connected. Live deployment would require all these backend integrations plus professionally reviewed privacy, legal and clinical processes.

## Brand and imagery

No original logo was present in the supplied attachments or project. A plain text wordmark is used, not a recreation of an original logo. Replace it with the exact supplied brand asset when available. The main physician portrait was generated using the built-in image generator and is an illustrative fictional person. Other doctors use graceful initials placeholders.

Image prompt: Welcoming Indian woman physician around 35, tied-back dark hair, white coat over pale blue blouse, stethoscope, seated in a bright modern clinic, warm camera-facing expression, natural daylight, pale cool blue background, authentic editorial photography, portrait 4:5 composition, no text or logos.

## Verification

JavaScript syntax checks and static output build are available with `npm run check` and `npm run build`. Responsive layouts include 320px phones through wide desktops. Browser verification details are recorded in VALIDATION.md.
