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
