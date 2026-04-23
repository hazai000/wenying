document.getElementById("year").textContent = new Date().getFullYear();

// Touch devices: tapping a card toggles the zoomed state since hover doesn't apply.
const isTouch = matchMedia("(hover: none)").matches;
if (isTouch) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const open = card.classList.contains("is-open");
      document.querySelectorAll(".card.is-open").forEach((c) => c.classList.remove("is-open"));
      if (!open) card.classList.add("is-open");
    });
  });
  const style = document.createElement("style");
  style.textContent = `.card.is-open .card-image img { transform: scale(1.35); filter: saturate(1.1); }`;
  document.head.appendChild(style);
}

/* ---------- signup popup ---------- */
// Mailchimp embedded form action URL. Paste yours from Mailchimp:
//   Audience → Signup forms → Embedded forms → copy the <form action="..."> URL.
// While empty, the form runs in "preview mode" — no email is sent, just UI.
const MAILCHIMP_ACTION = "https://github.us4.list-manage.com/subscribe/post?u=3845059b455edc827e47a10c6&id=ab8787548b&f_id=007015e3f0";

const popup = document.getElementById("signup-popup");
const popupClose = document.getElementById("popup-close");
const popupForm = document.getElementById("popup-form");
const popupEmail = document.getElementById("popup-email");
const popupBody = document.getElementById("popup-body");
const popupSuccess = document.getElementById("popup-success");
const STORAGE_KEY = "wy_signup_state"; // "dismissed" | "subscribed"

function openPopup() {
  if (popup.classList.contains("is-open")) return;
  popup.classList.add("is-open");
  popup.setAttribute("aria-hidden", "false");
  setTimeout(() => popupEmail?.focus(), 300);
}
function closePopup(reason) {
  popup.classList.remove("is-open");
  popup.setAttribute("aria-hidden", "true");
  if (reason) localStorage.setItem(STORAGE_KEY, reason);
}

const state = localStorage.getItem(STORAGE_KEY);
if (!state) {
  let triggered = false;
  const trigger = () => {
    if (triggered) return;
    triggered = true;
    openPopup();
  };
  setTimeout(trigger, 4000);
  const onScroll = () => {
    const products = document.getElementById("products");
    if (!products) return;
    const y = products.getBoundingClientRect().top;
    if (y < window.innerHeight * 0.6) {
      trigger();
      window.removeEventListener("scroll", onScroll);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

popupClose.addEventListener("click", () => closePopup("dismissed"));
popup.querySelector(".popup-backdrop").addEventListener("click", () => closePopup("dismissed"));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && popup.classList.contains("is-open")) closePopup("dismissed");
});

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

popupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = popupEmail.value.trim();
  if (!isValidEmail(email)) {
    popupEmail.classList.add("is-invalid");
    popupEmail.focus();
    return;
  }
  popupEmail.classList.remove("is-invalid");

  const submitBtn = popupForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  if (MAILCHIMP_ACTION) {
    // Mailchimp embedded forms accept a hidden-iframe or no-cors POST.
    // We use fetch with no-cors so the page doesn't navigate away; the response
    // is opaque, but Mailchimp still receives the submission.
    try {
      const body = new URLSearchParams({ EMAIL: email });
      await fetch(MAILCHIMP_ACTION, { method: "POST", mode: "no-cors", body });
    } catch (_) {
      // ignore — no-cors responses are always opaque; assume success
    }
  }

  popupBody.hidden = true;
  popupSuccess.hidden = false;
  localStorage.setItem(STORAGE_KEY, "subscribed");
});
