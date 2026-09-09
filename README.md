# MEDERGENCY

**Life Deserves Care** · Built for India. Designed for the World.

A responsive healthcare interface built with HTML5, CSS3 and vanilla JavaScript. No frontend frameworks or runtime dependencies.

## Run locally

With Node.js 20 or newer, run `npm run dev` and open http://127.0.0.1:4173. Run `npm run build` to produce the static site in `dist/`.

## Features

- Doctor discovery, specialty and availability filters, price and experience filters, sorting and saved doctors.
- Doctor profiles, video/audio selection, date and time availability, patient details and booking review.
- Payment-method selection and locally saved appointment confirmation without collecting money.
- Patient dashboard, consultation history, rescheduling, cancellation and notifications.
- Waiting room, session timer, consultation controls and room-local messages.
- Prescription records with doctor-review status, print and Save as PDF support.
- Local sign-in, six-digit access code, guest access, editable profile and language preferences.
- Support request storage, help center, FAQs, privacy information and account settings.
- Responsive layouts, keyboard focus, accessible menus and dialogs, reduced-motion support and error states.

## Structure

- `js/main.js` — page routing, homepage, directory and shared interactions.
- `js/ui.js` — navigation, wordmark, cards, icons, dialogs and validation.
- `js/booking.js` — appointment and consultation flow.
- `js/account.js` — profile, records, settings, notifications and support.
- `js/data.js` — directory entries, specialties, slots and FAQs.
- `js/scheduling.js` — past-time checks and local booking conflicts.
- `js/storage.js` — namespaced local persistence and text escaping.
- `css/style.css` and `css/responsive.css` — visual tokens, components and breakpoints.
- 24 HTML entry pages share the same components and design system.

## Service connections

The site currently runs entirely in the browser. Appointments are saved on the current device and have not been accepted by a clinician. Payment entries are not sent or retained. Calls do not access the camera or microphone. Chat stays in the current room. Support requests are saved locally, not delivered. Prescriptions remain unsigned and contain no medication or treatment.

Server-backed patient accounts, SMS verification, verified clinician records, live scheduling, payment collection, audio/video communication, prescription signing and support delivery require backend integrations before live healthcare use. Privacy, legal and clinical processes also need professional review before launch.

The local access code is `123456`. This creates only a browser-local session and is not a security boundary. Do not put sensitive medical information into browser storage. Settings provides a local-data reset.

## Brand assets

The existing MEDERGENCY text wordmark is preserved. No original logo image was supplied. Doctor cards and the consultation interface use consistent initials avatars; no physician photographs are included.

## Validation

`npm run check` checks JavaScript syntax. `npm run build` packages the public files. See `VALIDATION.md` for the browser and responsive checks performed.
