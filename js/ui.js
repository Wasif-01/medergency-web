import { storage, escapeHTML as e } from "./storage.js";
const paths = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  video: "M15 9 21 6v12l-6-3M3 6h12v12H3z",
  shield: "M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z M8 12l3 3 5-6",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  search: "m21 21-4.3-4.3 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  clock: "M12 8v4l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  file: "M14 2H6v20h12V6z M14 2v5h5 M9 12h6m-6 4h6",
  lock: "M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2",
  phone: "M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4c-8 4-22-10-16-16Z",
  calendar: "M4 5h16v16H4z M8 2v6m8-6v6M4 10h16",
  plus: "M12 5v14M5 12h14",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  bell: "M18 8a6 6 0 0 0-12 0v7l-2 3h16l-2-3z M10 21h4",
  mic: "M9 3h6v11H9z M5 11v3a7 7 0 0 0 14 0v-3M12 21v3",
  chat: "M3 3h18v14H8l-5 4z",
  volume: "M3 9h4l5-5v16l-5-5H3z M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
  expand: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
  brain:
    "M12 5c-4-6-10 0-7 4-5 3-1 8 1 8-1 5 6 6 6 2V5m0 0c4-6 10 0 7 4 5 3 1 8-1 8 1 5-6 6-6 2",
  stethoscope:
    "M5 3v6a5 5 0 0 0 10 0V3M3 3h4m6 0h4M10 14v3a5 5 0 0 0 10 0v-3 M22 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  flower: "M12 8c-7-9-12 0-5 4-7 4-2 13 5 4 7 9 12 0 5-4 7-4 2-13-5-4Z",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
};
export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.plus}"/></svg>`;
export const brand = () =>
  `<a class="brand" href="index.html" aria-label="Medergency home"><strong>MEDERGENCY<span>•</span></strong><small>LIFE DESERVES CARE</small></a>`;
export function header() {
  const active = location.pathname.split("/").pop() || "index.html";
  return `<a class="skip" href="#main">Skip to content</a><div class="announcement">Built for India. Designed for the World. <span>Care, wherever you are.</span></div><header class="site-header"><div class="container nav">${brand()}<nav aria-label="Main navigation" id="navigation">${[
    ["index.html", "Home"],
    ["doctors.html", "Find Doctors"],
    ["index.html#how-it-works", "How It Works"],
    ["consultations.html", "Consultations"],
    ["prescriptions.html", "Prescriptions"],
    ["about.html", "About"],
  ]
    .map(
      ([url, label]) =>
        `<a class="${active === url ? "active" : ""}" href="${url}">${label}</a>`,
    )
    .join(
      "",
    )}<a class="mobile-only" href="support.html">Help & Support</a><a class="mobile-only" href="login.html">Sign In</a><a class="btn mobile-only" href="doctors.html">Consult Now</a></nav><div class="nav-actions"><a class="help-link" href="support.html">Help</a><a class="signin" href="${storage.get("user", null) ? "dashboard.html" : "login.html"}">${storage.get("user", null) ? "My Account" : "Sign In"}</a><a class="btn small" href="doctors.html">Consult Now ${icon("arrow")}</a><button class="icon-btn menu-toggle" aria-label="Open navigation" aria-expanded="false">${icon("menu")}</button></div></div></header>`;
}
export function footer() {
  return `<footer><div class="container footer-grid"><div>${brand()}<p>Thoughtful care.<br>Just a conversation away.</p><small>Built for India. Designed for the World.</small></div><div><h4>Company</h4><a href="about.html">About us</a><a href="support.html?topic=Careers">Careers</a><a href="support.html">Contact</a></div><div><h4>For patients</h4><a href="doctors.html">Find doctors</a><a href="consultations.html">My consultations</a><a href="prescriptions.html">My prescriptions</a></div><div><h4>Here to help</h4><a href="support.html">Help & support</a><a href="privacy.html">Privacy policy</a><a href="terms.html">Terms & conditions</a></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} Medergency. Life Deserves Care.</span><span>Care, wherever you are.</span></div><p class="emergency container">For medical emergencies, contact your local emergency services or go to the nearest emergency facility.</p></footer>`;
}
export const avatar = (d, large = false) =>
  `<div class="avatar ${d.color} ${large ? "large" : ""}" role="img" aria-label="${d.name}, initials ${d.initials}"><span>${d.initials}</span></div>`;
export function doctorCard(d) {
  const saved = storage.get("favorites", []).includes(d.id);
  return `<article class="doctor-card"><div class="doctor-top">${avatar(d)}<button class="icon-btn favorite ${saved ? "saved" : ""}" data-favorite="${d.id}" aria-pressed="${saved}" aria-label="Save ${d.name}">${icon("heart")}</button></div><div class="availability ${d.availability === "Available Now" ? "" : "later"}"><i></i>${d.availability}</div><a class="doctor-name" href="doctor-profile.html?id=${d.id}">${d.name}</a><p class="specialty">${d.specialty}</p><p class="qualification">${d.qualification} <span>·</span> ${d.experience}+ years experience</p><div class="doctor-meta"><span class="rating">${icon("star")} ${d.rating}</span><span>${icon("video")} Video & audio</span></div><div class="card-bottom"><span class="fee">₹${d.fee}<small>/ consultation</small></span><a class="btn small" href="doctor-profile.html?id=${d.id}">Consult Now ${icon("arrow")}</a></div><a class="profile-link" href="doctor-profile.html?id=${d.id}">View Profile</a></article>`;
}
export function toast(message) {
  const box = document.querySelector("#toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => box.classList.remove("show"), 3500);
}
export function modal(title, body, onSubmit) {
  const dialog = document.querySelector("#modal");
  const prior = document.activeElement;
  dialog.innerHTML = `<form method="dialog"><button class="icon-btn modal-close" aria-label="Close">${icon("close")}</button></form><h2 id="dialog-title">${title}</h2>${body}`;
  dialog.setAttribute("aria-labelledby", "dialog-title");
  dialog.showModal();
  dialog.addEventListener("close", () => prior?.focus(), { once: true });
  dialog.onclick = (event) => {
    if (event.target === dialog) dialog.close();
  };
  if (onSubmit)
    dialog.querySelector("[data-confirm]")?.addEventListener("click", onSubmit);
  return dialog;
}
export const pageTitle = (eyebrow, title, description = "") =>
  `<div class="page-title"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1>${description ? `<p>${description}</p>` : ""}</div>`;
export const empty = (
  title,
  description,
  link = "doctors.html",
  label = "Find a Doctor",
) =>
  `<div class="empty">${icon("calendar")}<h2>${title}</h2><p>${description}</p><a class="btn" href="${link}">${label} ${icon("arrow")}</a></div>`;
export const field = (name, label, type = "text", value = "", extra = "") =>
  `<label class="field">${label}<input aria-label="${label}" name="${name}" type="${type}" value="${e(value)}" ${extra}><span class="error" id="error-${name}"></span></label>`;
export function validate(form, rules) {
  let valid = true;
  for (const [name, check] of Object.entries(rules)) {
    const input = form.elements[name];
    const error = check(input.value.trim());
    const el = form.querySelector("#error-" + name);
    if (el) el.textContent = error || "";
    input.setAttribute("aria-invalid", Boolean(error));
    if (el) input.setAttribute("aria-describedby", el.id);
    if (error && valid) {
      input.focus();
      valid = false;
    }
  }
  return valid;
}
