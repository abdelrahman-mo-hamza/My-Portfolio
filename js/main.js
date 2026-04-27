const MOBILE_BREAKPOINT = 991;

let currentLanguage = getInitialLanguage();
let translations = {};
let progressSpans = [];
let section;
let statsSection;
let nums = [];
let started = false;
const uiLabels = {
  en: {
    language: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
    galleryOpen: "Open certificate",
    galleryClose: "Close certificate viewer",
    galleryPrev: "Previous certificate",
    galleryNext: "Next certificate",
    scrollDown: "Scroll to bottom",
    scrollUp: "Scroll to top",
  },
  ar: {
    language: "English",
    galleryOpen: "\u0641\u062a\u062d \u0627\u0644\u0634\u0647\u0627\u062f\u0629",
    galleryClose: "\u0625\u063a\u0644\u0627\u0642 \u0639\u0631\u0636 \u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a",
    galleryPrev: "\u0627\u0644\u0634\u0647\u0627\u062f\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629",
    galleryNext: "\u0627\u0644\u0634\u0647\u0627\u062f\u0629 \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
    scrollDown: "\u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 \u0622\u062e\u0631 \u0627\u0644\u0635\u0641\u062d\u0629",
    scrollUp: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0627\u0644\u0635\u0641\u062d\u0629",
  },
};

function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || "en";
  return browserLang.startsWith("ar") ? "ar" : "en";
}

function getInitialLanguage() {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  if (urlLanguage === "ar" || urlLanguage === "en") {
    return urlLanguage;
  }

  return localStorage.getItem("language") || detectBrowserLanguage() || "en";
}

function isMobileView() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function getUiLabel(key) {
  return uiLabels[currentLanguage]?.[key] || uiLabels.en[key] || "";
}

function getMobileMenuElements() {
  return {
    hamburger: document.getElementById("hamburgerBtn"),
    mobileNav: document.getElementById("mobileNav"),
  };
}

function getMegaMenuElements() {
  return {
    trigger: document.getElementById("otherLinksTrigger"),
    menu: document.getElementById("otherLinksMenu"),
  };
}

function setMegaMenuState(isOpen) {
  const { trigger, menu } = getMegaMenuElements();
  if (!trigger || !menu) {
    return;
  }

  trigger.setAttribute("aria-expanded", String(isOpen));
  menu.classList.toggle("active", isOpen);
}

function toggleMegaMenu() {
  const { menu } = getMegaMenuElements();
  if (!menu) {
    return;
  }

  setMegaMenuState(!menu.classList.contains("active"));
}

function setMobileMenuState(isOpen) {
  const { hamburger, mobileNav } = getMobileMenuElements();
  if (!hamburger || !mobileNav) {
    return;
  }

  hamburger.classList.toggle("active", isOpen);
  mobileNav.classList.toggle("active", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));

  if (!isOpen) {
    setMegaMenuState(false);
  }
}

function toggleMobileMenu() {
  const { mobileNav } = getMobileMenuElements();
  if (!mobileNav) {
    return;
  }

  setMobileMenuState(!mobileNav.classList.contains("active"));
}

function closeMenus() {
  setMobileMenuState(false);
  setMegaMenuState(false);
}

async function loadTranslations() {
  try {
    const response = await fetch("js/translations.json");
    if (!response.ok) {
      throw new Error(`Failed to load translations: ${response.status}`);
    }

    translations = await response.json();
  } catch (error) {
    console.error("Error loading translations:", error);
  } finally {
    initializeLanguage();
  }
}

function initializeLanguage() {
  applyLanguage(currentLanguage);
  updateLanguageButton();
  refreshInteractiveLabels();
}

function getTranslation(key) {
  const keys = key.split(".");
  let value = translations[currentLanguage];

  for (const part of keys) {
    if (value && typeof value === "object") {
      value = value[part];
    } else {
      return null;
    }
  }

  return value;
}

function applyLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  updateLanguageUrl(lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  document.body.classList.remove("lang-en", "lang-ar");
  document.body.classList.add(`lang-${lang}`);

  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate");
    const text = getTranslation(key);

    if (text === null || text === undefined) {
      return;
    }

    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      if (element.type === "submit") {
        element.value = text;
      } else {
        element.placeholder = text;
      }
      return;
    }

    if (Array.isArray(text)) {
      element.innerHTML = text.map((item) => `<li>${item}</li>`).join("");
      return;
    }

    element.innerHTML = text;
  });

  updateLanguageButton();
  refreshInteractiveLabels();
}

function toggleLanguage() {
  const newLang = currentLanguage === "en" ? "ar" : "en";
  applyLanguage(newLang);
}

function updateLanguageUrl(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url);
}

function legacyUpdateLanguageButton() {
  const langBtn = document.getElementById("langSwitchBtn");
  if (langBtn) {
    const compactLabel = window.innerWidth <= 479;
    if (compactLabel) {
      langBtn.textContent = currentLanguage === "en" ? "AR" : "EN";
      return;
    }

    langBtn.textContent = currentLanguage === "en" ? "العربية" : "English";
  }
}

function updateLanguageButton() {
  const langBtn = document.getElementById("langSwitchBtn");
  if (!langBtn) {
    return;
  }

  const compactLabel = window.innerWidth <= 479;
  if (compactLabel) {
    langBtn.textContent = currentLanguage === "en" ? "AR" : "EN";
    return;
  }

  langBtn.textContent = getUiLabel("language");
}

function refreshInteractiveLabels() {
  const previewClose = document.getElementById("galleryPreviewClose");
  const previewPrev = document.getElementById("galleryPreviewPrev");
  const previewNext = document.getElementById("galleryPreviewNext");
  const scrollToggleBtn = document.getElementById("scrollToggleBtn");

  document.querySelectorAll(".gallery .box .image").forEach((item, index) => {
    item.setAttribute("aria-label", `${getUiLabel("galleryOpen")} ${index + 1}`);
  });

  if (previewClose) {
    previewClose.setAttribute("aria-label", getUiLabel("galleryClose"));
  }

  if (previewPrev) {
    previewPrev.setAttribute("aria-label", getUiLabel("galleryPrev"));
  }

  if (previewNext) {
    previewNext.setAttribute("aria-label", getUiLabel("galleryNext"));
  }

  if (scrollToggleBtn) {
    const direction = scrollToggleBtn.dataset.direction === "up" ? "scrollUp" : "scrollDown";
    scrollToggleBtn.setAttribute("aria-label", getUiLabel(direction));
  }
}

function startCount(el) {
  const goal = Number.parseInt(el.dataset.goal, 10);
  if (!Number.isFinite(goal)) {
    return;
  }

  let count = 0;
  const increment = Math.max(1, Math.ceil(goal / 100));

  const counter = setInterval(() => {
    count += increment;

    if (count >= goal) {
      el.textContent = goal.toLocaleString();
      clearInterval(counter);
      return;
    }

    el.textContent = count.toLocaleString();
  }, 25);
}

function handleScroll() {
  if (section && window.scrollY >= section.offsetTop - 250) {
    progressSpans.forEach((el) => {
      el.style.width = el.dataset.width;
    });
  }

  if (statsSection && !started && window.scrollY >= statsSection.offsetTop - 150) {
    nums.forEach((el) => startCount(el));
    started = true;
  }
}

function bindSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#" || anchor.id === "otherLinksTrigger") {
        return;
      }

      const target = document.querySelector(hash);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", hash);

      if (isMobileView()) {
        setMobileMenuState(false);
      }
    });
  });
}

function bindMenuInteractions() {
  const { hamburger, mobileNav } = getMobileMenuElements();
  const { trigger } = getMegaMenuElements();
  const header = document.querySelector(".header");

  if (hamburger) {
    hamburger.addEventListener("click", toggleMobileMenu);
  }

  if (trigger) {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      toggleMegaMenu();
    });
  }

  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach((link) => {
      if (link.id === "otherLinksTrigger") {
        return;
      }

      link.addEventListener("click", () => {
        if (isMobileView()) {
          setMobileMenuState(false);
        }
      });
    });
  }

  document.addEventListener("click", (event) => {
    if (header && !header.contains(event.target)) {
      closeMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenus();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileView()) {
      setMobileMenuState(false);
    }

    updateLanguageButton();
  });
}

function handleContactFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.reportValidity()) {
    return;
  }

  const formData = new FormData(form);
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const phone = (formData.get("mobile") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  const subject = `Portfolio contact request from ${name}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    "",
    "Accounting needs:",
    message,
  ].join("\n");

  window.location.href = `mailto:manobaker1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function bindGalleryPreview() {
  const preview = document.getElementById("galleryPreview");
  const previewImage = document.getElementById("galleryPreviewImage");
  const previewClose = document.getElementById("galleryPreviewClose");
  const previewPrev = document.getElementById("galleryPreviewPrev");
  const previewNext = document.getElementById("galleryPreviewNext");
  const previewCounter = document.getElementById("galleryPreviewCounter");
  const galleryItems = [...document.querySelectorAll(".gallery .box .image")];
  const galleryImages = galleryItems
    .map((item) => item.querySelector("img"))
    .filter(Boolean);
  let currentIndex = 0;
  let activeTrigger = null;

  if (!preview || !previewImage || !previewClose || !previewPrev || !previewNext || !previewCounter || !galleryImages.length) {
    return;
  }

  const closePreview = () => {
    preview.classList.remove("active");
    preview.setAttribute("aria-hidden", "true");
    document.body.classList.remove("certificate-preview-active");
    previewImage.removeAttribute("src");
    activeTrigger?.focus();
  };

  const updatePreview = () => {
    const sourceImage = galleryImages[currentIndex];
    if (!sourceImage) {
      return;
    }

    previewImage.src = sourceImage.currentSrc || sourceImage.src;
    previewImage.alt = sourceImage.alt || "Certificate preview";
    previewCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
  };

  const openPreview = (index) => {
    currentIndex = index;
    activeTrigger = galleryItems[index] || null;
    updatePreview();
    preview.classList.add("active");
    preview.setAttribute("aria-hidden", "false");
    document.body.classList.add("certificate-preview-active");
    previewClose.focus();
  };

  const movePreview = (step) => {
    currentIndex = (currentIndex + step + galleryImages.length) % galleryImages.length;
    updatePreview();
  };

  galleryItems.forEach((item, index) => {
    item.tabIndex = 0;
    item.setAttribute("role", "button");

    item.addEventListener("click", () => openPreview(index));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPreview(index);
      }
    });
  });

  previewClose.addEventListener("click", closePreview);
  previewPrev.addEventListener("click", () => movePreview(-1));
  previewNext.addEventListener("click", () => movePreview(1));
  preview.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.galleryClose === "true") {
      closePreview();
    }
  });

  refreshInteractiveLabels();

  document.addEventListener("keydown", (event) => {
    if (!preview.classList.contains("active")) {
      return;
    }

    if (event.key === "Escape") {
      closePreview();
    }

    if (event.key === "ArrowLeft") {
      movePreview(-1);
    }

    if (event.key === "ArrowRight") {
      movePreview(1);
    }
  });

  window.addEventListener("resize", updatePreview);
}

function bindScrollToggle() {
  const scrollToggleBtn = document.getElementById("scrollToggleBtn");
  const footer = document.querySelector(".footer");
  const icon = scrollToggleBtn?.querySelector("i");

  if (!scrollToggleBtn || !icon) {
    return;
  }

  const syncScrollToggle = () => {
    const shouldScrollDown = window.scrollY < window.innerHeight * 0.75;

    scrollToggleBtn.dataset.direction = shouldScrollDown ? "down" : "up";
    scrollToggleBtn.setAttribute("aria-label", shouldScrollDown ? getUiLabel("scrollDown") : getUiLabel("scrollUp"));
    icon.className = shouldScrollDown ? "fas fa-angle-double-down" : "fas fa-angle-double-up";
  };

  scrollToggleBtn.addEventListener("click", () => {
    const direction = scrollToggleBtn.dataset.direction;
    if (direction === "down") {
      const targetTop = footer ? footer.offsetTop : document.documentElement.scrollHeight;
      window.scrollTo({ top: targetTop, behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", syncScrollToggle, { passive: true });
  window.addEventListener("resize", syncScrollToggle);
  syncScrollToggle();
}

document.addEventListener("DOMContentLoaded", () => {
  progressSpans = document.querySelectorAll(".the-progress span");
  section = document.querySelector(".our-skills");
  nums = document.querySelectorAll(".stats .number");
  statsSection = document.querySelector(".stats");

  const langSwitchBtn = document.getElementById("langSwitchBtn");
  const contactForm = document.getElementById("contactForm");

  if (langSwitchBtn) {
    langSwitchBtn.addEventListener("click", toggleLanguage);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", handleContactFormSubmit);
  }

  bindMenuInteractions();
  bindSmoothScroll();
  bindGalleryPreview();
  bindScrollToggle();
  loadTranslations();
  window.addEventListener("resize", () => {
    updateLanguageButton();
    refreshInteractiveLabels();
  });
  handleScroll();
});

window.addEventListener("scroll", handleScroll);
