/* Waystead parent site — minimal vanilla JS.
   Responsibilities (Tech Spec §2):
     1. Mobile nav toggle (accessible).
     2. Close the mobile nav on link click / Escape / outside click.
   Smooth scroll is handled in CSS (scroll-behavior), respecting
   prefers-reduced-motion. No tracking, no cookies, no dependencies.

   NOTE on products: per spec §5.1 the live product cards (Scheduler,
   Learning) are hand-authored directly in index.html so the page works
   with zero JS. The single source of truth for the data array — including
   the launch-ready hidden products — lives in index.html as a labelled
   comment block; launching is a one-flag edit there. This file deliberately
   does not render the grid, to keep the page resilient without JS. */

(function () {
  "use strict";

  // Progressive enhancement: swap the no-js marker so CSS can rely on JS.
  document.documentElement.classList.remove("no-js");

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#primary-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.setAttribute("data-open", String(open));
  }

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  toggle.addEventListener("click", function () {
    setOpen(!isOpen());
  });

  // Close when a nav link is chosen (mobile).
  nav.addEventListener("click", function (e) {
    if (e.target.closest(".nav__link")) setOpen(false);
  });

  // Close on Escape, returning focus to the toggle.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close when clicking/tapping outside the open nav.
  document.addEventListener("click", function (e) {
    if (!isOpen()) return;
    if (e.target.closest("#primary-nav") || e.target.closest(".nav-toggle")) return;
    setOpen(false);
  });

  // If resized up to desktop, reset state so the menu shows normally.
  var mq = window.matchMedia("(min-width: 769px)");
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") :
    mq.addListener.bind(mq))(function () {
    if (mq.matches) setOpen(false);
  });
})();
