function digitsOnly(value) {
  return String(value || "").replace(/\D+/g, "");
}

function getBrandName() {
  const fromHeader = document.querySelector(".brand b")?.textContent?.trim();
  if (fromHeader) return fromHeader;

  const fromDataset = document.body?.dataset?.brand?.trim();
  return fromDataset || "MoDesign";
}

function getWaNumber(waRaw) {
  const rawHref = waRaw?.getAttribute?.("href") || "";
  const match = rawHref.match(/wa\.me\/([^?]+)/i);
  const fromHref = digitsOnly(match?.[1]);
  if (fromHref) return fromHref;

  const fromDataset = digitsOnly(document.body?.dataset?.wa);
  if (fromDataset) return fromDataset;

  const fromText = digitsOnly(waRaw?.textContent);
  if (fromText) return fromText;

  return "";
}

function buildWaLink(waNumber, message) {
  const url = new URL(`https://wa.me/${waNumber}`);
  url.searchParams.set("text", message);
  return url.toString();
}

function setExternalLink(el, href) {
  if (!el) return;
  el.href = href;
  el.target = "_blank";
  el.rel = "noopener noreferrer";
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const toTop = document.getElementById("toTop");
const waRaw = document.getElementById("waRaw");
const waTop = document.getElementById("waTop");
const heroCta = document.getElementById("heroCta");

const brandName = getBrandName();
const waNumber = getWaNumber(waRaw);

if (waNumber) {
  function fromTemplate(raw) {
    return String(raw || "").replaceAll("{brand}", brandName).replaceAll("\\n", "\n");
  }

  function getIntroLine() {
    const custom = document.body?.dataset?.waIntro?.trim();
    if (custom) return fromTemplate(custom);
    return `Halo ${brandName}, saya mau order desain.`;
  }

  function getDefaultMessage() {
    const custom = document.body?.dataset?.waDefault?.trim();
    if (custom) return fromTemplate(custom);
    return [
      getIntroLine(),
      ``,
      `- Jenis desain:`,
      `- Ukuran:`,
      `- Deadline:`,
      `- Catatan:`,
    ].join("\n");
  }

  const href = buildWaLink(waNumber, getDefaultMessage());
  setExternalLink(waRaw, href);
  setExternalLink(waTop, href);
  setExternalLink(heroCta, href);

  if (waRaw) {
    const currentText = (waRaw.textContent || "").trim();
    if (!currentText || /whatsapp/i.test(currentText)) {
      waRaw.textContent = waNumber.startsWith("62") ? `+${waNumber}` : waNumber;
    }
  }
}

function applyDataWaTextLinks() {
  if (!waNumber) return;
  const items = document.querySelectorAll("[data-wa-text]");
  items.forEach((el) => {
    const raw = el.getAttribute("data-wa-text") || "";
    const message = raw.replaceAll("{brand}", brandName).replaceAll("\\n", "\n");
    if (!message.trim()) return;

    const href = buildWaLink(waNumber, message);
    const tag = String(el.tagName || "").toLowerCase();

    if (tag === "a") setExternalLink(el, href);
    else {
      el.addEventListener("click", () => {
        window.open(href, "_blank", "noopener,noreferrer");
      });
    }
  });
}
applyDataWaTextLinks();

const form = document.getElementById("orderForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name")?.value?.trim() || "";
    const phone = document.getElementById("phone")?.value?.trim() || "";
    const need = document.getElementById("need")?.value?.trim() || "";

    const introLine =
      document.body?.dataset?.waIntro?.trim()?.replaceAll("{brand}", brandName)?.replaceAll("\\n", "\n") ||
      `Halo ${brandName}, saya mau order desain.`;

    const message = [
      introLine,
      ``,
      `Nama: ${name}`,
      `WA saya: ${phone}`,
      ``,
      `Kebutuhan:`,
      need,
    ].join("\n");

    if (!waNumber) return;

    window.open(buildWaLink(waNumber, message), "_blank", "noopener,noreferrer");
  });
}

function onScroll() {
  if (!toTop) return;
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  if (y > 520) toTop.classList.add("show");
  else toTop.classList.remove("show");
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function initCarousels() {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const behavior = reduceMotion ? "auto" : "smooth";

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    if (!track) return;

    const prevBtn = carousel.querySelector("[data-carousel-btn='prev']");
    const nextBtn = carousel.querySelector("[data-carousel-btn='next']");

    function scrollByCard(direction) {
      const firstCard = track.querySelector(".previewCard") || track.firstElementChild;
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : track.clientWidth;
      const gapRaw = getComputedStyle(track).gap || "12px";
      const gap = Number.parseFloat(gapRaw) || 12;
      track.scrollBy({ left: direction * (cardWidth + gap), behavior });
    }

    prevBtn?.addEventListener("click", () => scrollByCard(-1));
    nextBtn?.addEventListener("click", () => scrollByCard(1));

    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByCard(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByCard(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        track.scrollTo({ left: 0, behavior });
      } else if (e.key === "End") {
        e.preventDefault();
        track.scrollTo({ left: track.scrollWidth, behavior });
      }
    });
  });
}
initCarousels();
