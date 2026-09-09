import { doctors, findDoctor, slots, faqs } from "./data.js";
import { slotAvailable } from "./scheduling.js";
import {
  storage,
  appointments,
  saveAppointments,
  notify,
  escapeHTML as e,
  today,
  formatDate,
} from "./storage.js";
import {
  icon,
  brand,
  avatar,
  pageTitle,
  toast,
  modal,
  field,
  validate,
  empty,
  doctorCard,
} from "./ui.js";
const accountNav = (page) =>
  `<nav class="account-nav" aria-label="Account navigation">${[
    ["dashboard", "heart", "My dashboard"],
    ["consultations", "calendar", "My consultations"],
    ["prescriptions", "file", "My prescriptions"],
    ["saved-doctors", "heart", "Saved doctors"],
    ["notifications", "bell", "Notifications"],
    ["profile", "user", "My profile"],
    ["settings", "plus", "Settings"],
    ["support", "chat", "Help & support"],
  ]
    .map(
      ([p, i, t]) =>
        `<a href="${p}.html" class="${page === p + ".html" ? "active" : ""}">${icon(i)}${t}</a>`,
    )
    .join("")}<button id="logout">${icon("arrow")} Sign out</button></nav>`;
const appointmentCard = (a) => {
  const d = findDoctor(a.doctorId);
  return `<article class="appointment"><div class="appointment-top">${avatar(d)}<div><h3>${d.name}</h3><p>${d.specialty} · ${d.qualification}</p></div><span class="tag">${a.status}</span></div><div class="appointment-details"><span>${icon("calendar")}${formatDate(a.date)}</span><span>${icon("clock")}${a.time}</span><span>${icon(a.type === "Video" ? "video" : "phone")}${a.type}</span><span>₹${a.fee}</span></div><div class="actions">${a.status === "Upcoming" ? `<a class="btn small" href="waiting-room.html?id=${a.id}">Join Waiting Room</a><button class="btn secondary small" data-reschedule="${a.id}">Reschedule</button><button class="btn ghost small" data-cancel="${a.id}">Cancel</button><a class="text-link" href="confirmation.html?id=${a.id}">Details</a>` : a.status === "Completed" ? `<a class="btn secondary small" href="prescription-view.html?id=${a.id}">View Prescription</a><a class="text-link" href="doctor-profile.html?id=${d.id}">Book again ${icon("arrow")}</a>` : '<span class="notice">Cancelled · No payment collected</span>'}</div></article>`;
};
const required = (v) => (!v ? "This field is required." : "");
export function renderAccount(main, page) {
  main.className = "container page";
  const params = new URLSearchParams(location.search);
  const user = storage.get("user", null);
  const logout = () => {
    modal(
      "Sign out of your account?",
      '<p>Your saved doctors and records will remain on this browser.</p><div class="actions"><button class="btn secondary" id="stay">Stay signed in</button><button class="btn" data-confirm>Sign Out</button></div>',
      () => {
        storage.remove("user");
        location.href = "login.html";
      },
    );
    document.querySelector("#stay").onclick = () =>
      document.querySelector("#modal").close();
  };
  if (page === "login.html") {
    main.innerHTML = `<div class="auth-shell"><div class="auth-story"><span class="icon-tile">${icon("heart")}</span><span class="eyebrow">LIFE DESERVES CARE</span><h2>A little care.<br>A little closer.</h2><p>Your consultations, prescriptions and favourite doctors — all together in one calm place.</p></div><div class="auth-form"><h1>Welcome to Medergency.</h1><p>Enter your mobile number to continue.</p><form id="login-form" novalidate>${field("mobile", "Mobile number (+91)", "tel", "", 'inputmode="numeric" maxlength="10" placeholder="9876543210" autocomplete="off"')}<button class="btn wide" type="submit">Continue ${icon("arrow")}</button></form><button class="btn secondary wide" id="guest-access">Continue as Guest</button><p class="notice">SMS verification is not connected yet. Continue on this device with access code 123456.</p><p class="section-note">Read our <a href="terms.html">service information</a> and <a href="privacy.html">privacy information</a>.</p></div></div>`;
    main.querySelector("#guest-access").onclick = () => {
      storage.set("user", {
        name: "Guest",
        mobile: "",
        email: "",
        dob: "",
        gender: "Prefer not to say",
      });
      location.href = "dashboard.html";
    };
    main.querySelector("#login-form").onsubmit = (event) => {
      event.preventDefault();
      if (
        !validate(event.target, {
          mobile: (v) =>
            !/^[6-9]\d{9}$/.test(v)
              ? "Enter a valid 10-digit Indian mobile number."
              : "",
        })
      )
        return;
      sessionStorage.setItem(
        "sessionMobile",
        event.target.elements.mobile.value,
      );
      location.href = "otp.html";
    };
    return;
  }
  if (page === "otp.html") {
    const mobile = sessionStorage.getItem("sessionMobile");
    if (!mobile) {
      location.href = "login.html";
      return;
    }
    main.innerHTML = `<section class="panel narrow"><span class="eyebrow">ONE SMALL STEP</span><h1>Verify your number.</h1><p>Enter the access code for +91 ${e(mobile)}.<br>SMS is unavailable. Your local access code is <strong>123456</strong>.</p><form id="otp-form"><div class="otp-inputs">${Array.from({ length: 6 }, (_, i) => `<input aria-label="OTP digit ${i + 1}" inputmode="numeric" pattern="[0-9]" maxlength="1" autocomplete="${i === 0 ? "one-time-code" : "off"}" required>`).join("")}</div><p class="error" id="otp-error" role="alert"></p><button class="btn wide">Verify OTP ${icon("arrow")}</button></form><div class="actions"><a class="btn ghost" href="login.html">Change Number</a><button class="btn ghost" id="resend" disabled>Resend in 30s</button></div></section>`;
    const inputs = [...main.querySelectorAll(".otp-inputs input")];
    inputs[0].focus();
    inputs.forEach((input, i) => {
      input.oninput = () => {
        input.value = input.value.replace(/\D/g, "").slice(-1);
        if (input.value) inputs[i + 1]?.focus();
      };
      input.onkeydown = (event) => {
        if (event.key === "Backspace" && !input.value) inputs[i - 1]?.focus();
      };
      input.onpaste = (event) => {
        event.preventDefault();
        const code = event.clipboardData
          .getData("text")
          .replace(/\D/g, "")
          .slice(0, 6);
        code.split("").forEach((v, j) => (inputs[j].value = v));
        inputs[Math.min(code.length, 5)].focus();
      };
    });
    let remaining = 30;
    const timer = setInterval(() => {
      const btn = main.querySelector("#resend");
      if (!btn) {
        clearInterval(timer);
        return;
      }
      remaining--;
      btn.disabled = remaining > 0;
      btn.textContent =
        remaining > 0 ? `Resend in ${remaining}s` : "Resend Code";
    }, 1000);
    main.querySelector("#resend").onclick = () => {
      remaining = 30;
      main.querySelector("#resend").disabled = true;
      toast("Access code: 123456. No SMS was sent.");
    };
    main.querySelector("#otp-form").onsubmit = (event) => {
      event.preventDefault();
      if (inputs.map((x) => x.value).join("") !== "123456") {
        main.querySelector("#otp-error").textContent =
          "Use the access code 123456.";
        return;
      }
      storage.set("user", { name: "Guest", mobile, email: "" });
      sessionStorage.removeItem("sessionMobile");
      location.href = "dashboard.html";
    };
    return;
  }
  if (page === "support.html") {
    main.innerHTML = `${pageTitle("HERE FOR YOU", "A little help, whenever you need it.", "Find an answer or prepare a support request.")}<div class="quick-actions">${["Booking Help", "Consultation Help", "Payment Help", "Prescription Help", "Account Help"].map((x) => `<a href="#support-form" data-topic="${x}">${icon("chat")}${x}</a>`).join("")}</div><div class="two-col"><section class="panel"><h2>Contact support</h2><form id="support-form" novalidate><div class="form-grid">${field("name", "Your name", "text")}${field("contact", "Mobile or email", "text")}<label class="field span-two">Topic<select name="topic">${["Booking Help", "Consultation Help", "Payment Help", "Prescription Help", "Account Help", "Careers", "Other"].map((x) => `<option ${params.get("topic") === x ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="field span-two">Message<textarea name="message" maxlength="1000" placeholder="How can we help?"></textarea><span class="error" id="error-message"></span></label></div><div class="notice">Support delivery is not connected yet. You can prepare and save your request on this device.</div><hr><button class="btn">Save Support Request ${icon("arrow")}</button></form></section><aside class="panel"><h2>Common questions</h2><div class="faq-list">${faqs
      .slice(0, 4)
      .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`)
      .join("")}</div></aside></div>`;
    main
      .querySelectorAll("[data-topic]")
      .forEach(
        (a) =>
          (a.onclick = () =>
            (main.querySelector("[name=topic]").value = a.dataset.topic)),
      );
    main.querySelector("#support-form").onsubmit = (event) => {
      event.preventDefault();
      if (
        !validate(event.target, {
          name: required,
          contact: (v) =>
            !/^([6-9]\d{9}|[^\s@]+@[^\s@]+\.[^\s@]+)$/.test(v)
              ? "Enter an email or 10-digit mobile number."
              : "",
          message: (v) =>
            v.length < 10 ? "Please add at least 10 characters." : "",
        })
      )
        return;
      storage.set("supportRequests", [
        {
          id: crypto.randomUUID(),
          ...Object.fromEntries(new FormData(event.target)),
          date: today(),
        },
        ...storage.get("supportRequests", []),
      ]);
      modal(
        "Your support request is ready.",
        '<p>Your request has been saved on this device. It has not been sent to the support team.</p><button class="btn" data-confirm>Done</button>',
        () => document.querySelector("#modal").close(),
      );
    };
    return;
  }
  const titles = {
    "dashboard.html": [
      "YOUR PERSONAL CARE SPACE",
      `Hello, ${e(user?.name?.split(" ")[0] || "there")}.`,
      "How can we help you today?",
    ],
    "consultations.html": [
      "YOUR CARE JOURNEY",
      "My consultations.",
      "Your upcoming appointments and past conversations.",
    ],
    "prescriptions.html": [
      "YOUR HEALTH RECORDS",
      "My prescriptions.",
      "Your consultation records, organised and easy to find.",
    ],
    "profile.html": [
      "YOUR ACCOUNT",
      "Personal information.",
      "Keep your personal information up to date.",
    ],
    "settings.html": [
      "MAKE YOURSELF AT HOME",
      "Account settings.",
      "Your preferences, on your terms.",
    ],
    "notifications.html": [
      "STAY IN THE KNOW",
      "Notifications.",
      "Updates from your care journey.",
    ],
    "prescription-view.html": [
      "YOUR CONSULTATION RECORD",
      "Digital prescription.",
      "Your consultation details, together in one place.",
    ],
  };
  const title = titles[page];
  main.innerHTML = `${pageTitle(...title)}<div class="dashboard-layout">${accountNav(page)}<div id="account-content"></div></div>`;
  main.querySelector("#logout").onclick = logout;
  const content = main.querySelector("#account-content");
  function bindAppointments(refresh) {
    content.querySelectorAll("[data-cancel]").forEach(
      (button) =>
        (button.onclick = () => {
          modal(
            "Cancel this consultation?",
            '<p>This removes the appointment from your upcoming consultations. No payment has been collected.</p><div class="actions"><button class="btn secondary" id="keep">Keep Consultation</button><button class="btn danger" data-confirm>Cancel Consultation</button></div>',
            () => {
              const list = appointments(),
                a = list.find((x) => x.id === button.dataset.cancel);
              if (a) a.status = "Cancelled";
              saveAppointments(list);
              notify("Your consultation was cancelled.");
              document.querySelector("#modal").close();
              toast("Consultation cancelled.");
              refresh();
            },
          );
          document.querySelector("#keep").onclick = () =>
            document.querySelector("#modal").close();
        }),
    );
    content.querySelectorAll("[data-reschedule]").forEach(
      (button) =>
        (button.onclick = () => {
          const a = appointments().find(
            (x) => x.id === button.dataset.reschedule,
          );
          if (!a) return;
          const dialog = modal(
            "Find a better time.",
            `<form id="reschedule-form">${field("date", "New consultation date", "date", a.date, `min="${today()}" required`)}<label class="field">New time<select name="time">${slots.map((t) => `<option ${a.time === t ? "selected" : ""} ${!slotAvailable(a.doctorId, a.date, t, a.id) ? "disabled" : ""}>${t}</option>`).join("")}</select></label><hr><button class="btn wide">Confirm Reschedule</button></form>`,
          );
          dialog.querySelector("[name=date]").onchange = (event) => {
            dialog.querySelector("[name=time]").innerHTML = slots
              .map(
                (t) =>
                  `<option ${!slotAvailable(a.doctorId, event.target.value, t, a.id) ? "disabled" : ""}>${t}</option>`,
              )
              .join("");
            const available = slots.find((t) =>
              slotAvailable(a.doctorId, event.target.value, t, a.id),
            );
            dialog.querySelector("[name=time]").value = available || "";
          };
          dialog.querySelector("#reschedule-form").onsubmit = (event) => {
            event.preventDefault();
            if (
              !validate(event.target, {
                date: (v) =>
                  !v || v < today() ? "Choose today or a future date." : "",
              })
            )
              return;
            if (
              !slotAvailable(
                a.doctorId,
                event.target.elements.date.value,
                event.target.elements.time.value,
                a.id,
              )
            ) {
              toast("Please choose an available time.");
              return;
            }
            const list = appointments(),
              item = list.find((x) => x.id === a.id);
            item.date = event.target.elements.date.value;
            item.time = event.target.elements.time.value;
            saveAppointments(list);
            notify("Your appointment was rescheduled.");
            dialog.close();
            toast("Consultation rescheduled successfully.");
            refresh();
          };
        }),
    );
  }
  if (page === "dashboard.html") {
    const render = () => {
      const upcoming = appointments().filter((a) => a.status === "Upcoming"),
        completed = appointments().filter((a) => a.status === "Completed");
      const favorites = doctors.filter((d) =>
        storage.get("favorites", []).includes(d.id),
      );
      content.innerHTML = `<div class="dashboard-banner"><div><h2>A little care starts here.</h2><p>Connect with a doctor in a few simple steps.</p></div><a class="btn" href="doctors.html">Consult Now ${icon("arrow")}</a></div><div class="quick-actions">${[
        ["doctors", "search", "Find doctor"],
        ["doctors", "calendar", "Book consultation"],
        ["prescriptions", "file", "Prescriptions"],
        ["consultations", "video", "Consultations"],
      ]
        .map(([p, i, t]) => `<a href="${p}.html">${icon(i)}${t}</a>`)
        .join(
          "",
        )}</div><h3>Upcoming consultation</h3>${upcoming.length ? appointmentCard(upcoming[0]) : empty("A little space for your health.", "Your next consultation will appear here.")}<hr><h3>Recent consultations</h3>${completed.length ? completed.slice(0, 2).map(appointmentCard).join("") : "<p>No completed consultations yet.</p>"}<h3>Recent prescriptions</h3>${completed.length ? `<a class="text-link" href="prescription-view.html?id=${completed[0].id}">View latest prescription ${icon("arrow")}</a>` : "<p>Your digital prescriptions will appear after consultations.</p>"}<hr><div class="section-head"><h3>Saved doctors</h3><a class="text-link" href="saved-doctors.html">View all</a></div><div class="doctor-grid">${favorites.length ? favorites.slice(0, 2).map(doctorCard).join("") : "<p>Tap the heart on a doctor’s card to save them here.</p>"}</div><hr><h3>Notifications</h3><p>${e(storage.get("notifications", [])[0]?.text || "You’re all caught up.")}</p><a class="text-link" href="notifications.html">View notifications ${icon("arrow")}</a>`;
      bindAppointments(render);
    };
    render();
    return;
  }
  if (page === "consultations.html") {
    let tab = "Upcoming";
    const render = () => {
      const list = appointments().filter((a) => a.status === tab);
      content.innerHTML = `<div class="tabs" role="tablist" aria-label="Consultation status">${["Upcoming", "Completed", "Cancelled"].map((t) => `<button role="tab" aria-selected="${tab === t}" class="${tab === t ? "active" : ""}" data-tab="${t}">${t} (${appointments().filter((a) => a.status === t).length})</button>`).join("")}</div>${list.length ? list.map(appointmentCard).join("") : empty(`No ${tab.toLowerCase()} consultations.`, tab === "Upcoming" ? "When you book a consultation, you’ll find it here." : "Your consultation history will appear here.")}`;
      content.querySelectorAll("[data-tab]").forEach(
        (b) =>
          (b.onclick = () => {
            tab = b.dataset.tab;
            render();
          }),
      );
      bindAppointments(render);
    };
    render();
    return;
  }
  if (page === "prescriptions.html") {
    content.innerHTML = `<div class="search-box">${icon("search")}<input id="rx-search" aria-label="Search prescriptions" placeholder="Search doctor or prescription ID"></div><div class="filters"><label class="field">Consultation date<input type="date" id="rx-date"></label><label class="field">Specialty<select id="rx-specialty"><option value="">All specialties</option>${[...new Set(doctors.map((d) => d.specialty))].map((x) => `<option>${x}</option>`).join("")}</select></label><button class="btn ghost" id="rx-clear">Clear filters</button></div><div id="rx-results"></div>`;
    const render = () => {
      const q = content.querySelector("#rx-search").value.toLowerCase(),
        date = content.querySelector("#rx-date").value,
        spec = content.querySelector("#rx-specialty").value;
      const list = appointments().filter(
        (a) =>
          a.status === "Completed" &&
          `${findDoctor(a.doctorId).name} RX-${a.id}`
            .toLowerCase()
            .includes(q) &&
          (!date || a.date === date) &&
          (!spec || findDoctor(a.doctorId).specialty === spec),
      );
      content.querySelector("#rx-results").innerHTML = list.length
        ? list
            .map(
              (a) =>
                `<div class="appointment"><h3>${findDoctor(a.doctorId).name}</h3><p>${findDoctor(a.doctorId).specialty} · ${formatDate(a.date)} · RX-${a.id}</p><div class="actions"><a class="btn secondary small" href="prescription-view.html?id=${a.id}">View Prescription</a><a class="text-link" href="prescription-view.html?id=${a.id}&print=1">Print / Download ${icon("download")}</a></div></div>`,
            )
            .join("")
        : empty(
            q || date || spec
              ? "No matching prescriptions."
              : "No prescriptions yet.",
            "Your digital prescriptions will appear here after your consultations.",
          );
    };
    content
      .querySelectorAll("input,select")
      .forEach((x) => (x.oninput = render));
    content.querySelector("#rx-clear").onclick = () => {
      content.querySelectorAll("input,select").forEach((x) => (x.value = ""));
      render();
    };
    render();
    return;
  }
  if (page === "prescription-view.html") {
    const a = appointments().find(
      (x) => x.id === params.get("id") && x.status === "Completed",
    );
    if (!a) {
      content.innerHTML = empty(
        "No prescription available.",
        "Your consultation record will appear here after you leave the consultation room.",
        "consultations.html",
        "My Consultations",
      );
      return;
    }
    const d = findDoctor(a.doctorId);
    content.innerHTML = `<article class="prescription-paper"><div class="prescription-top">${brand()}<div><h2>Digital Prescription</h2><p>AWAITING DOCTOR REVIEW</p></div></div><div class="form-grid"><div><span class="eyebrow">PATIENT</span><h3>${e(a.patientName)}</h3><p>Age: Not recorded</p></div><div><span class="eyebrow">CONSULTING DOCTOR</span><h3>${d.name}</h3><p>${d.qualification} · ${d.specialty}</p></div></div><div class="summary-row"><span>Consultation date</span><strong>${formatDate(a.date)}</strong></div><div class="summary-row"><span>Prescription ID</span><strong>RX-${a.id}</strong></div><h3 class="booking-label">Medication record</h3><div class="table-wrap"><table><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead><tbody><tr><td colspan="5">No medication has been prescribed.</td></tr></tbody></table></div><h3>Additional advice</h3><p>Your doctor’s advice will appear here after review. Only an authorised healthcare professional can issue a prescription.</p><hr><p>Doctor signature: <em>Awaiting signature</em></p><div class="notice">This document is not valid for treatment until it has been reviewed and signed by an authorised healthcare professional.</div></article><div class="actions no-print"><button class="btn" id="download-rx">${icon("download")} Download Prescription</button><button class="btn secondary" id="print-rx">Print Prescription</button><a class="btn ghost" href="dashboard.html">Back to Dashboard</a></div><p class="section-note no-print">To download a PDF, choose “Save as PDF” in your browser’s print dialog.</p>`;
    content.querySelector("#print-rx").onclick = () => window.print();
    content.querySelector("#download-rx").onclick = () => {
      toast("Choose “Save as PDF” in the print dialog.");
      window.print();
    };
    if (params.get("print")) setTimeout(() => window.print(), 400);
    return;
  }
  if (page === "profile.html") {
    const profile = user || { name: "" };
    content.innerHTML = `<section class="panel"><div class="profile-hero"><div class="avatar large">${icon("user")}</div><div><h2>${e(profile.name || "Your profile")}</h2><p>${e(profile.mobile ? "+91 " + profile.mobile : "Personal account")}</p></div></div><hr><form id="profile-form" novalidate><div class="form-grid">${field("name", "Full name", "text", profile.name)}${field("mobile", "Mobile number (+91)", "tel", profile.mobile || "", 'inputmode="numeric" maxlength="10"')}${field("email", "Email", "email", profile.email || "")}${field("dob", "Date of birth", "date", profile.dob || "", `max="${today()}"`)}<label class="field">Gender<select name="gender">${["Prefer not to say", "Female", "Male", "Other"].map((t) => `<option ${profile.gender === t ? "selected" : ""}>${t}</option>`).join("")}</select></label></div><div class="notice">Your profile is saved on this device. Avoid adding sensitive medical information.</div><hr><button class="btn">Save Changes ${icon("check")}</button></form></section>`;
    content.querySelector("#profile-form").onsubmit = (event) => {
      event.preventDefault();
      if (
        !validate(event.target, {
          name: required,
          mobile: (v) =>
            v && !/^[6-9]\d{9}$/.test(v)
              ? "Enter a 10-digit Indian mobile number."
              : "",
          email: (v) =>
            v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
              ? "Enter a valid email."
              : "",
          dob: (v) =>
            v > today() ? "Date of birth cannot be in the future." : "",
        })
      )
        return;
      storage.set("user", Object.fromEntries(new FormData(event.target)));
      toast("Profile updated.");
      content.querySelector(".profile-hero h2").textContent =
        event.target.elements.name.value;
      content.querySelector(".profile-hero p").textContent =
        event.target.elements.mobile.value
          ? "+91 " + event.target.elements.mobile.value
          : "Personal account";
    };
    return;
  }
  if (page === "settings.html") {
    const settings = storage.get("settings", {
      notifications: true,
      reminders: true,
      language: "English",
    });
    content.innerHTML = `<section class="panel"><h2>Your preferences</h2><form id="settings-form">${[
      [
        "notifications",
        "Consultation notifications",
        "Updates about your appointments.",
      ],
      [
        "reminders",
        "Appointment reminders",
        "Show reminders in your local notification center.",
      ],
    ]
      .map(
        ([n, t, p]) =>
          `<label class="settings-row"><span><strong>${t}</strong><p>${p}</p></span><input type="checkbox" name="${n}" ${settings[n] ? "checked" : ""}></label>`,
      )
      .join(
        "",
      )}<label class="settings-row"><span><strong>Language</strong><p>English is available. More languages are planned.</p></span><select name="language"><option>English</option>${["Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Kannada", "Gujarati", "Malayalam", "Punjabi"].map((x) => `<option disabled>${x} · Coming soon</option>`).join("")}</select></label><hr><button class="btn">Save Preferences</button></form></section><section class="panel"><h2>Data on this device</h2><p>Manage your appointments, profile, saved doctors, preferences and notifications on this browser.</p><button class="btn danger" id="clear-data">Clear Local Data</button></section>`;
    content.querySelector("#settings-form").onsubmit = (event) => {
      event.preventDefault();
      storage.set("settings", {
        notifications: event.target.elements.notifications.checked,
        reminders: event.target.elements.reminders.checked,
        language: "English",
      });
      toast("Preferences saved.");
    };
    content.querySelector("#clear-data").onclick = () =>
      modal(
        "Clear data on this device?",
        '<p>This removes your profile, consultations, prescriptions, saved doctors, settings and notifications from this browser.</p><button class="btn danger" data-confirm>Clear All Local Data</button>',
        () => {
          [
            "user",
            "appointments",
            "favorites",
            "settings",
            "notifications",
            "supportRequests",
          ].forEach((x) => storage.remove(x));
          sessionStorage.removeItem("booking");
          sessionStorage.removeItem("sessionMobile");
          location.href = "index.html";
        },
      );
    return;
  }
  if (page === "notifications.html") {
    const render = () => {
      const list = storage.get("notifications", []);
      content.innerHTML = `<div class="actions"><button class="btn secondary small" id="read-all">Mark all as read</button></div>${list.length ? list.map((n) => `<div class="notification ${n.read ? "read" : ""}"><span class="icon-tile">${icon("bell")}</span><div><p>${e(n.text)}</p>${n.read ? "<small>Read</small>" : `<button class="btn ghost small" data-read="${n.id}">Mark as read</button>`}</div></div>`).join("") : empty("You’re all caught up.", "Appointment updates will appear here.", "dashboard.html", "Back to Dashboard")}`;
      content.querySelector("#read-all").onclick = () => {
        storage.set(
          "notifications",
          list.map((n) => ({ ...n, read: true })),
        );
        render();
        toast("All notifications marked as read.");
      };
      content.querySelectorAll("[data-read]").forEach(
        (b) =>
          (b.onclick = () => {
            storage.set(
              "notifications",
              list.map((n) =>
                String(n.id) === b.dataset.read ? { ...n, read: true } : n,
              ),
            );
            render();
          }),
      );
    };
    render();
  }
}
