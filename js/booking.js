import { findDoctor, slots } from "./data.js";
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
  avatar,
  pageTitle,
  toast,
  modal,
  field,
  validate,
  empty,
} from "./ui.js";
const getDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem("booking") || "null");
  } catch {
    return null;
  }
};
const setDraft = (value) =>
  sessionStorage.setItem("booking", JSON.stringify(value));
const go = (page, id) =>
  (location.href = page + (id ? "?id=" + encodeURIComponent(id) : ""));
const summary = (d, b) =>
  `<div class="profile-hero">${avatar(d)}<div><h3>${d.name}</h3><p>${d.specialty}</p><p>${d.qualification}</p></div></div><hr>${[
    ["Consultation", b.type || "Choose type"],
    ["Date", b.date ? formatDate(b.date) : "Choose date"],
    ["Time", b.time || "Choose time"],
  ]
    .map(
      ([k, v]) =>
        `<div class="summary-row"><span>${k}</span><strong>${e(v)}</strong></div>`,
    )
    .join(
      "",
    )}<div class="summary-row"><span>Consultation fee</span><strong>₹${d.fee}</strong></div><div class="summary-row"><span>Platform fee</span><strong>₹0</strong></div><div class="summary-row total"><span>Total</span><strong>₹${d.fee}</strong></div>`;
const progress = (step) =>
  `<div class="progress" aria-label="Booking progress">${["Doctor & time", "Patient details", "Review", "Payment", "Confirmed"].map((x, i) => `<span class="${i <= step ? "current" : ""}" ${i === step ? 'aria-current="step"' : ""}>${i + 1}. ${x}</span>`).join("")}</div>`;
const dateField = (value = today()) =>
  field(
    "date",
    "Consultation date",
    "date",
    value,
    `min="${today()}" required`,
  );
const slotButtons = (selected, doctorId, date) =>
  `<div class="slots">${slots.map((s, i) => `<button type="button" class="slot ${s === selected ? "selected" : ""}" aria-pressed="${s === selected}" data-slot="${s}" ${!slotAvailable(doctorId, date, s) ? `disabled aria-label="${s} unavailable"` : ``}>${s}</button>`).join("")}</div>`;
export function renderBooking(main, page) {
  main.className = "container page";
  const params = new URLSearchParams(location.search);
  let draft = getDraft();
  let d = findDoctor(params.get("id") || draft?.doctorId);
  const all = appointments();
  const booking =
    all.find((x) => x.id === params.get("id")) ||
    (!params.has("id") ? all[0] : null);
  if (page === "doctor-profile.html") {
    main.innerHTML = `<div class="breadcrumb"><a href="doctors.html">Find Doctors</a> / ${d.name}</div><div class="two-col"><div class="stack"><section class="panel"><div class="profile-hero">${avatar(d, true)}<div><span class="availability"><i></i>${d.availability}</span><h1>${d.name}</h1><p class="specialty">${d.specialty}</p><p>${d.qualification} · ${d.experience}+ years experience</p><p>${icon("star")} ${d.rating} </p></div></div><div class="tags"><span class="tag">${d.languages}</span><span class="tag">Video & audio consultation</span></div></section><section class="panel"><h2>Care that starts with listening.</h2><h3>About doctor</h3><p>${d.about}</p><h3>Areas of expertise</h3><div class="tags">${d.expertise.map((x) => `<span class="tag">${x}</span>`).join("")}</div><hr><h3>Experience</h3><p>${d.experience}+ years · ${d.specialty}<br>${d.qualification}</p><h3>Languages</h3><p>${d.languages}</p><div class="notice">Online consultations are not connected yet. You can save your preferred doctor and appointment on this device.</div></section></div><section class="panel"><h2>Make time for your health.</h2><p>Choose how and when you’d like to connect.</p><form id="slot-form"><div class="options">${d.types.map((t, i) => `<label class="option"><input type="radio" name="type" value="${t}" ${i === 0 ? "checked" : ""}>${icon(t === "Video" ? "video" : "phone")}<span>${t}<small>₹${d.fee} / consultation</small></span></label>`).join("")}</div><div class="booking-label">Pick a convenient day</div><div class="actions"><button type="button" class="btn ghost small" data-day="0">Today</button><button type="button" class="btn ghost small" data-day="1">Tomorrow</button></div>${dateField()}<div class="booking-label">Available time slots</div><div id="slot-list">${slotButtons("", d.id, today())}</div><p class="error" id="time-error"></p><div class="summary-row total"><span>Consultation fee</span><strong>₹${d.fee}</strong></div><button class="btn wide" type="submit">Book Consultation ${icon("arrow")}</button><p class="secure-note">${icon("lock")} Private consultation experience</p></form></section></div>`;
    let selected = "";
    const bindSlots = () =>
      main.querySelectorAll("[data-slot]").forEach(
        (button) =>
          (button.onclick = () => {
            selected = button.dataset.slot;
            main.querySelectorAll("[data-slot]").forEach((x) => {
              x.classList.toggle("selected", x === button);
              x.setAttribute("aria-pressed", x === button);
            });
            main.querySelector("#time-error").textContent = "";
          }),
      );
    const updateSlots = () => {
      selected = "";
      main.querySelector("#slot-list").innerHTML = slotButtons(
        "",
        d.id,
        main.querySelector("[name=date]").value,
      );
      bindSlots();
    };
    bindSlots();
    main.querySelector("[name=date]").addEventListener("change", updateSlots);
    main.querySelectorAll("[data-day]").forEach(
      (button) =>
        (button.onclick = () => {
          const date = new Date();
          date.setDate(date.getDate() + Number(button.dataset.day));
          const local = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 10);
          main.querySelector("[name=date]").value = local;
          updateSlots();
        }),
    );
    main.querySelector("#slot-form").onsubmit = (event) => {
      event.preventDefault();
      const form = event.target;
      if (
        !validate(form, {
          date: (v) =>
            !v
              ? "Choose a date."
              : v < today()
                ? "Choose today or a future date."
                : "",
        })
      )
        return;
      if (
        !selected ||
        !slotAvailable(d.id, form.elements.date.value, selected)
      ) {
        main.querySelector("#time-error").textContent =
          "Choose an available time.";
        return;
      }
      setDraft({
        patient: draft?.patient,
        doctorId: d.id,
        type: form.elements.type.value,
        date: form.elements.date.value,
        time: selected,
      });
      go("booking.html");
    };
    return;
  }
  if (["booking.html", "payment.html"].includes(page) && !draft) {
    main.innerHTML = empty(
      "Let’s find your doctor first.",
      "Choose a doctor and a time to start your booking.",
    );
    return;
  }
  if (page === "booking.html") {
    let review = false;
    const render = () => {
      d = findDoctor(draft.doctorId);
      main.innerHTML = `${pageTitle("A LITTLE TIME FOR YOUR HEALTH", review ? "Review your consultation." : "Who is this consultation for?", review ? "Take a moment to check the details." : "Your details help keep your appointment organised.")}${progress(review ? 2 : 1)}<div class="two-col"><section class="panel">${
        review
          ? `<h2>Patient details</h2>${[
              ["Patient", draft.patient.name],
              ["Mobile", "+91 " + draft.patient.mobile],
              ["Email", draft.patient.email],
              ["Date of birth", formatDate(draft.patient.dob)],
              ["Gender", draft.patient.gender],
              ["Reason", draft.patient.reason || "Not specified"],
            ]
              .map(
                ([k, v]) =>
                  `<div class="summary-row"><span>${k}</span><strong>${e(v)}</strong></div>`,
              )
              .join(
                "",
              )}<div class="actions"><button class="btn ghost" id="edit-patient">Edit details</button><button class="btn" id="continue-payment">Continue to Payment ${icon("arrow")}</button></div>`
          : `<h2>Patient details</h2><form id="patient-form" novalidate><div class="form-grid">${field("name", "Full name", "text", draft.patient?.name || "", 'autocomplete="off" required')}${field("mobile", "Mobile number (+91)", "tel", draft.patient?.mobile || "", 'inputmode="numeric" maxlength="10" placeholder="98765 43210" required')}${field("email", "Email", "email", draft.patient?.email || "", 'placeholder="name@example.com" required')}${field("dob", "Date of birth", "date", draft.patient?.dob || "", `max="${today()}" required`)}<label class="field">Gender<select name="gender"><option value="">Select gender</option>${["Female", "Male", "Other", "Prefer not to say"].map((x) => `<option ${draft.patient?.gender === x ? "selected" : ""}>${x}</option>`).join("")}</select><span class="error" id="error-gender"></span></label><label class="field span-two">Reason for consultation (optional)<textarea name="reason" maxlength="250" placeholder="Briefly describe what you’d like to discuss.">${e(draft.patient?.reason || "")}</textarea></label></div><div class="notice">Saved on this device only. Please avoid including sensitive medical details.</div><hr><button class="btn wide" type="submit">Review Consultation ${icon("arrow")}</button></form>`
      }</section><aside class="panel"><h2>Your consultation</h2>${summary(d, draft)}<a class="text-link" href="doctor-profile.html?id=${d.id}">Edit doctor or time</a><p class="secure-note">${icon("lock")} Appointment details stay on this device</p></aside></div>`;
      if (review) {
        main.querySelector("#edit-patient").onclick = () => {
          review = false;
          render();
        };
        main.querySelector("#continue-payment").onclick = () =>
          go("payment.html");
      } else
        main.querySelector("#patient-form").onsubmit = (event) => {
          event.preventDefault();
          const form = event.target;
          if (
            !validate(form, {
              name: (v) => (v.length < 2 ? "Enter a full name." : ""),
              mobile: (v) =>
                !/^[6-9]\d{9}$/.test(v)
                  ? "Enter a valid 10-digit Indian mobile number."
                  : "",
              email: (v) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                  ? "Enter a valid email address."
                  : "",
              dob: (v) =>
                !v
                  ? "Choose a date of birth."
                  : v > today()
                    ? "Date of birth cannot be in the future."
                    : "",
              gender: (v) => (!v ? "Select an option." : ""),
            })
          )
            return;
          draft.patient = Object.fromEntries(new FormData(form));
          setDraft(draft);
          review = true;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        };
    };
    render();
    return;
  }
  if (page === "payment.html") {
    if (!draft.patient) {
      go("booking.html");
      return;
    }
    d = findDoctor(draft.doctorId);
    main.innerHTML = `${pageTitle("ONE FINAL STEP", "A clear price. No surprises.", "Review your fee and preferred payment method.")}${progress(3)}<div class="two-col"><section class="panel"><h2>Choose a payment method</h2><form id="payment-form" novalidate><div class="stack">${["UPI", "Debit / Credit Card", "Net Banking", "Other Payment Methods"].map((t, i) => `<label class="option"><input type="radio" name="method" value="${t}" ${i === 0 ? "checked" : ""}><span>${t}${i === 0 ? "<small>Quick and familiar</small>" : ""}</span></label>`).join("")}</div><div id="payment-fields"></div><div class="notice warning">Payments are not connected yet. No money will be collected. Please do not enter actual payment details.</div><hr><button class="btn wide" type="submit" id="pay">Confirm Appointment · ₹${d.fee} ${icon("arrow")}</button><p class="secure-note">${icon("lock")} No payment collected</p></form></section><aside class="panel"><h2>Order summary</h2>${summary(d, draft)}<p>Patient: ${e(draft.patient.name)}</p><a class="text-link" href="booking.html">Edit patient details</a></aside></div>`;
    const fields = () => {
      const method = main.querySelector("[name=method]:checked").value;
      main.querySelector("#payment-fields").innerHTML =
        `<div class="booking-label">${method} details</div>` +
        (method === "UPI"
          ? field("upi", "UPI ID", "text", "name@upi")
          : method === "Debit / Credit Card"
            ? `<div class="form-grid">${field("card", "Card number", "text", "4242 4242 4242 4242", 'inputmode="numeric" autocomplete="off"')}${field("cardname", "Name on card", "text", "Guest")}${field("expiry", "Expiry", "text", "12/30")}${field("cvv", "CVV", "password", "123", 'maxlength="4" autocomplete="off"')}</div>`
            : method === "Net Banking"
              ? '<label class="field">Bank<select name="bank"><option>State Bank of India</option><option>HDFC Bank</option></select></label>'
              : "<p>Wallet payments will be available when payment services are connected.</p>");
    };
    main
      .querySelectorAll("[name=method]")
      .forEach((x) => (x.onchange = fields));
    fields();
    main.querySelector("#payment-form").onsubmit = async (event) => {
      event.preventDefault();
      const form = event.target;
      const method = form.elements.method.value;
      const rules =
        method === "UPI"
          ? {
              upi: (v) =>
                !/^\S+@\S+$/.test(v)
                  ? "Enter a UPI ID in the format name@bank."
                  : "",
            }
          : method === "Debit / Credit Card"
            ? {
                card: (v) =>
                  !/^\d{16}$/.test(v.replace(/\s/g, ""))
                    ? "Enter a 16-digit card number."
                    : "",
                cardname: (v) => (!v ? "Enter a name." : ""),
                expiry: (v) =>
                  !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)
                    ? "Use MM/YY format."
                    : "",
                cvv: (v) =>
                  !/^\d{3,4}$/.test(v) ? "Enter 3 or 4 digits." : "",
              }
            : {};
      if (!validate(form, rules)) return;
      if (!slotAvailable(d.id, draft.date, draft.time)) {
        toast("This time is no longer available. Please choose another slot.");
        return;
      }
      const button = main.querySelector("#pay");
      button.disabled = true;
      button.innerHTML =
        '<span class="spinner"></span> Confirming your appointment…';
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const id = "MED-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      const appointment = {
        id,
        doctorId: d.id,
        type: draft.type,
        date: draft.date,
        time: draft.time,
        status: "Upcoming",
        fee: d.fee,
        patientName: draft.patient.name,
        paymentStatus: "Not collected",
        paymentMethod: method,
      };
      saveAppointments([appointment, ...appointments()]);
      notify("Your appointment has been saved.");
      sessionStorage.removeItem("booking");
      go("confirmation.html", id);
    };
    return;
  }
  if (!booking) {
    main.innerHTML = empty(
      "No consultation selected.",
      "Choose a doctor and save an appointment to continue.",
    );
    return;
  }
  d = findDoctor(booking.doctorId);
  if (page === "confirmation.html") {
    main.innerHTML = `<section class="narrow panel success center"><div class="success-circle">${icon("check")}</div><span class="eyebrow">YOU’RE ALL SET</span><h1>Consultation confirmed.</h1><p>Your appointment with ${d.name} has been saved successfully.</p><div class="tag">${booking.id}</div><hr><div class="left">${summary(d, booking)}</div><div class="actions"><a class="btn" href="waiting-room.html?id=${booking.id}">Join Waiting Room ${icon("arrow")}</a><a class="btn secondary" href="consultations.html">My Consultations</a></div><p class="notice">Saved on this device. No payment has been collected; a clinician has not yet confirmed this appointment.</p></section>`;
    return;
  }
  if (page === "waiting-room.html") {
    if (booking.status !== "Upcoming") {
      main.innerHTML = empty(
        "This consultation is not upcoming.",
        "See your consultation history for the current status.",
        "consultations.html",
        "My Consultations",
      );
      return;
    }
    main.innerHTML = `<section class="narrow panel center"><span class="eyebrow">YOUR CARE IS UP NEXT</span><div class="waiting-orbit">${avatar(d, true)}</div><h1>You’re in the queue.</h1><p>Your consultation space is getting ready.</p><h3>${d.name}</h3><p>${d.specialty} · ${booking.type} consultation<br>Booking ${booking.id}</p><div class="waiting-status"><span class="tag">✓ Confirmed</span><span class="tag" id="wait-status">Preparing room</span><span class="tag" id="ready-status">Room ready soon</span></div><button class="btn wide" id="join" disabled><span class="spinner"></span> Preparing your consultation room…</button><div class="notice">Live calls are not connected yet. You can enter the consultation room and adjust your preferences.</div><hr><h3>A little preparation helps.</h3><p>Find a quiet place. Keep your microphone available.<br>Have any previous prescriptions nearby.</p><a class="text-link" href="consultations.html">Leave waiting room</a></section>`;
    setTimeout(() => {
      const join = main.querySelector("#join");
      if (!join) return;
      main.querySelector("#ready-status").textContent = "✓ Room ready";
      main.querySelector("#wait-status").textContent = "✓ Waiting complete";
      join.disabled = false;
      join.innerHTML = `Join Consultation ${icon("video")}`;
      join.onclick = () => go("consultation.html", booking.id);
    }, 2400);
    return;
  }
  if (page === "consultation.html") {
    if (booking.status !== "Upcoming") {
      main.innerHTML = empty(
        "This call is no longer active.",
        "View your consultation history to continue.",
        "consultations.html",
        "My Consultations",
      );
      return;
    }
    main.innerHTML = `<div class="call-shell"><div class="call-header"><span>${d.name} · ${booking.type} consultation</span><span><span class="dot"></span> Consultation room · <span id="timer">00:00</span></span></div><div class="call-layout"><div><div class="call-stage">${avatar(d, true)}<div class="patient-tile" id="patient-tile">You</div></div><div class="call-controls">${[
      ["mic", "Microphone"],
      ["video", "Camera"],
      ["volume", "Speaker"],
      ["chat", "Chat"],
      ["expand", "Fullscreen"],
      ["phone", "End call"],
    ]
      .map(
        ([i, l]) =>
          `<button class="icon-btn ${i === "phone" ? "end-call" : ""}" data-control="${i}" title="${l}" aria-label="${l}" ${["mic", "video", "volume", "chat"].includes(i) ? 'aria-pressed="false"' : ""}>${icon(i)}</button>`,
      )
      .join(
        "",
      )}</div><p class="secure-note">Not connected · Your camera and microphone are off.</p></div><aside class="chat-panel" hidden><h3>Consultation chat</h3><p>Messages stay in this room until you leave.</p><div class="messages" aria-live="polite"></div><form id="chat-form"><input aria-label="Chat message" placeholder="Type a message…" maxlength="500"><button class="btn small" aria-label="Send message">${icon("arrow")}</button></form></aside></div></div>`;
    const start = Date.now();
    const timer = setInterval(() => {
      const el = document.querySelector("#timer");
      if (!el) {
        clearInterval(timer);
        return;
      }
      const t = Math.floor((Date.now() - start) / 1000);
      el.textContent =
        String(Math.floor(t / 60)).padStart(2, "0") +
        ":" +
        String(t % 60).padStart(2, "0");
    }, 1000);
    main.querySelectorAll("[data-control]").forEach(
      (button) =>
        (button.onclick = () => {
          const control = button.dataset.control;
          if (control === "phone") {
            modal(
              "End this consultation?",
              '<p>Your consultation record will be available after you leave this room.</p><div class="actions"><button class="btn secondary" id="keep-call">Stay in call</button><button class="btn danger" data-confirm>End Consultation</button></div>',
              () => {
                const list = appointments();
                const item = list.find((x) => x.id === booking.id);
                if (item) {
                  item.status = "Completed";
                  saveAppointments(list);
                  notify("Your consultation record is ready.");
                }
                go("completed.html", booking.id);
              },
            );
            document.querySelector("#keep-call").onclick = () =>
              document.querySelector("#modal").close();
            return;
          }
          if (control === "expand") {
            if (!document.fullscreenElement)
              main
                .querySelector(".call-shell")
                .requestFullscreen?.()
                .catch(() =>
                  toast("Fullscreen is unavailable in this browser."),
                );
            else document.exitFullscreen?.();
            return;
          }
          const pressed = button.getAttribute("aria-pressed") !== "true";
          button.setAttribute("aria-pressed", pressed);
          if (control === "chat")
            main.querySelector(".chat-panel").hidden = !pressed;
          else if (control === "video")
            main.querySelector("#patient-tile").textContent = pressed
              ? "Camera off"
              : "You";
          else
            toast(
              `${control === "mic" ? "Microphone" : "Speaker"} ${pressed ? "muted" : "on"}`,
            );
        }),
    );
    main.querySelector("#chat-form").onsubmit = (event) => {
      event.preventDefault();
      const input = event.target.querySelector("input");
      const value = input.value.trim();
      if (!value) return;
      const div = document.createElement("div");
      div.className = "message";
      div.textContent = value;
      const time = document.createElement("small");
      time.textContent = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      div.append(time);
      main.querySelector(".messages").append(div);
      input.value = "";
      div.scrollIntoView({ block: "nearest" });
    };
    return;
  }
  if (page === "completed.html") {
    main.innerHTML = `<section class="panel narrow center"><div class="success-circle">${icon("check")}</div><h1>Consultation completed.</h1><p>Your consultation room is closed. A prescription becomes valid only after it is reviewed and signed by your doctor.</p><div class="actions"><a class="btn" href="prescription-view.html?id=${booking.id}">View Prescription ${icon("file")}</a><a class="btn secondary" href="dashboard.html">Back to Dashboard</a></div><p class="notice">No clinician joined this session. No treatment has been prescribed.</p></section>`;
  }
}
