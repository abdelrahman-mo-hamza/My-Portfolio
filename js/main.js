const MOBILE_BREAKPOINT = 991;
const WHATSAPP_NUMBER = "966590285307";
const CV_DOWNLOAD_FILES = {
  ar: "Abdelrahman-Mohamed-Hamza-CV-ar.pdf",
  en: "Abdelrahman-Mohamed-Hamza-CV-en.pdf",
};
const THEME_STORAGE_KEY = "theme";
const SUPPORTED_THEMES = ["light", "dark"];

let currentLanguage = getInitialLanguage();
let currentTheme = getInitialTheme();
let translations = {};
const uiLabels = {
  en: {
    language: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
    scrollDown: "Scroll to bottom",
    scrollUp: "Scroll to top",
    themeToDark: "Switch to dark mode",
    themeToLight: "Switch to light mode",
    showMore: "Show more",
    showLess: "Show less",
  },
  ar: {
    language: "English",
    scrollDown: "\u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 \u0622\u062e\u0631 \u0627\u0644\u0635\u0641\u062d\u0629",
    scrollUp: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0627\u0644\u0635\u0641\u062d\u0629",
    themeToDark: "\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062f\u0627\u0643\u0646",
    themeToLight: "\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062a\u062d",
    showMore: "\u0639\u0631\u0636 \u0627\u0644\u0645\u0632\u064a\u062f",
    showLess: "\u0639\u0631\u0636 \u0623\u0642\u0644",
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

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (SUPPORTED_THEMES.includes(savedTheme)) {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function isMobileView() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function getUiLabel(key) {
  return uiLabels[currentLanguage]?.[key] || uiLabels.en[key] || "";
}

function updateThemeMeta() {
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    return;
  }

  themeMeta.setAttribute("content", currentTheme === "dark" ? "#0f172a" : "#2196f3");
}

function updateThemeButton() {
  const themeBtn = document.getElementById("themeSwitchBtn");
  if (!themeBtn) {
    return;
  }

  const nextLabel = getUiLabel(currentTheme === "dark" ? "themeToLight" : "themeToDark");
  const icon = themeBtn.querySelector("i");
  themeBtn.setAttribute("aria-label", nextLabel);
  themeBtn.setAttribute("title", nextLabel);
  themeBtn.setAttribute("aria-pressed", String(currentTheme === "dark"));

  if (icon) {
    icon.className = currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
  }
}

function setMetaContent(selector, content) {
  if (!content) {
    return;
  }

  const meta = document.querySelector(selector);
  if (meta) {
    meta.setAttribute("content", content);
  }
}

function updateSeoMeta() {
  const seo = getTranslation(document.body.classList.contains("not-found-page") ? "notFound.seo" : "seo") || getTranslation("seo");
  if (!seo) {
    return;
  }

  document.title = seo.title;
  setMetaContent('meta[name="description"]', seo.description);
  setMetaContent('meta[property="og:title"]', seo.title);
  setMetaContent('meta[property="og:description"]', seo.description);
  setMetaContent('meta[name="twitter:title"]', seo.title);
  setMetaContent('meta[name="twitter:description"]', seo.description);
  setMetaContent('meta[property="og:locale"]', currentLanguage === "ar" ? "ar_AR" : "en_US");
}

function applyTheme(theme, shouldPersist = true) {
  currentTheme = SUPPORTED_THEMES.includes(theme) ? theme : "light";
  document.documentElement.dataset.theme = currentTheme;

  if (shouldPersist) {
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  }

  updateThemeMeta();
  updateThemeButton();
}

function toggleTheme() {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function buildWhatsAppUrl(serviceKey = "", customMessage = "") {
  const serviceMessage = serviceKey ? getTranslation(`whatsapp.services.${serviceKey}`) : null;
  const defaultMessage = getTranslation("whatsapp.defaultMessage") || "Hello Abdelrahman, I visited your portfolio and would like to discuss accounting or ERP support.";
  const message = customMessage || serviceMessage || defaultMessage;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function refreshWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.setAttribute("href", buildWhatsAppUrl());
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");

    const label = getTranslation("whatsapp.floatLabel") || "WhatsApp";
    link.setAttribute("aria-label", label);
  });

  document.querySelectorAll("[data-service-key]").forEach((link) => {
    const serviceKey = link.getAttribute("data-service-key") || "";
    link.setAttribute("href", buildWhatsAppUrl(serviceKey));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

function refreshCvLinks() {
  document.querySelectorAll("[data-cv-link]").forEach((link) => {
    const section = link.dataset.cvSection ? `#${link.dataset.cvSection}` : "";
    link.setAttribute("href", `cv.html?lang=${currentLanguage}${section}`);
  });
}

function refreshCvDownloads() {
  const fileName = CV_DOWNLOAD_FILES[currentLanguage] || CV_DOWNLOAD_FILES.en;

  document.querySelectorAll("[data-cv-download]").forEach((link) => {
    link.setAttribute("href", fileName);
    link.setAttribute("download", fileName);
  });
}

function bindCvLinks() {
  document.querySelectorAll("[data-cv-link]").forEach((link) => {
    link.addEventListener("click", () => {
      link.setAttribute("href", `cv.html?lang=${currentLanguage}`);
    });
  });
}

function bindCvDownloads() {
  document.querySelectorAll("[data-cv-download]").forEach((link) => {
    link.addEventListener("click", () => {
      refreshCvDownloads();
    });
  });
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
  updateThemeButton();
  updateSeoMeta();
  refreshInteractiveLabels();
  refreshMobileToggleLabels();
  refreshCvLinks();
  refreshCvDownloads();
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
  updateThemeButton();
  updateSeoMeta();
  refreshInteractiveLabels();
  refreshMobileToggleLabels();
  refreshCvLinks();
  refreshCvDownloads();
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
  const scrollToggleBtn = document.getElementById("scrollToggleBtn");

  if (scrollToggleBtn) {
    const direction = scrollToggleBtn.dataset.direction === "up" ? "scrollUp" : "scrollDown";
    scrollToggleBtn.setAttribute("aria-label", getUiLabel(direction));
  }

  refreshWhatsAppLinks();
}

function refreshMobileToggleLabels() {
  document.querySelectorAll("[data-mobile-toggle]").forEach((button) => {
    const sectionElement = document.getElementById(button.getAttribute("data-mobile-toggle"));
    const isExpanded = Boolean(sectionElement?.classList.contains("mobile-expanded"));
    const label = getUiLabel(isExpanded ? "showLess" : "showMore");

    button.textContent = label;
    button.setAttribute("aria-expanded", String(isExpanded));
  });
}

function bindMobileSectionToggles() {
  document.querySelectorAll("[data-mobile-toggle]").forEach((button) => {
    const sectionId = button.getAttribute("data-mobile-toggle");
    const sectionElement = document.getElementById(sectionId);

    if (!sectionElement) {
      return;
    }

    button.addEventListener("click", () => {
      const isExpanded = sectionElement.classList.toggle("mobile-expanded");
      button.textContent = getUiLabel(isExpanded ? "showLess" : "showMore");
      button.setAttribute("aria-expanded", String(isExpanded));

      if (!isExpanded && isMobileView()) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  refreshMobileToggleLabels();
}

function bindSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const hash = anchor.getAttribute("href");
      if (!hash || !hash.startsWith("#") || hash === "#" || anchor.id === "otherLinksTrigger") {
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

function bindActiveNavigation() {
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"], .footer-links a[href^="#"]')]
    .filter((link) => {
      const hash = link.getAttribute("href");
      return hash && hash.length > 1 && document.querySelector(hash);
    });

  if (!navLinks.length) {
    return;
  }

  const sections = [...new Set(navLinks.map((link) => link.getAttribute("href").slice(1)))]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const syncActiveLink = () => {
    const anchorLine = window.innerHeight * 0.38;
    let activeId = "";

    sections.forEach((sectionElement) => {
      if (sectionElement.getBoundingClientRect().top <= anchorLine) {
        activeId = sectionElement.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = Boolean(activeId) && link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  window.addEventListener("scroll", syncActiveLink, { passive: true });
  window.addEventListener("resize", syncActiveLink);
  syncActiveLink();
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
  const topic = (formData.get("topic") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();
  const topicLabel = topic ? (getTranslation(`discount.serviceOptions.${topic}`) || topic) : "";

  const labels = getTranslation("whatsapp.formLabels") || {};
  const intro = getTranslation("whatsapp.formIntro") || "Hello Abdelrahman, I visited your portfolio and would like to discuss this request:";
  const body = [
    intro,
    "",
    `${labels.name || "Name"}: ${name}`,
    `${labels.email || "Email"}: ${email}`,
    `${labels.phone || "Phone"}: ${phone}`,
    `${labels.topic || "Service"}: ${topicLabel}`,
    "",
    `${labels.message || "Accounting needs"}:`,
    message,
  ].join("\n");

  const whatsappUrl = buildWhatsAppUrl("", body);
  const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

  if (!opened) {
    window.location.href = whatsappUrl;
  }
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

function bindRevealAnimations() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(
    ".problem-card, .services .box, .case-studies .box, .experience-item, .faq details"
  );

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  revealItems.forEach((item, index) => {
    item.classList.add("reveal-on-scroll");
    item.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 45, 180)}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => observer.observe(item));
}

function syncFooterYear() {
  const footerYear = document.getElementById("footerYear");
  if (!footerYear) {
    return;
  }

  footerYear.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  const langSwitchBtn = document.getElementById("langSwitchBtn");
  const themeSwitchBtn = document.getElementById("themeSwitchBtn");
  const contactForm = document.getElementById("contactForm");

  if (langSwitchBtn) {
    langSwitchBtn.addEventListener("click", toggleLanguage);
  }

  if (themeSwitchBtn) {
    themeSwitchBtn.addEventListener("click", toggleTheme);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", handleContactFormSubmit);
  }

  bindMenuInteractions();
  bindSmoothScroll();
  bindActiveNavigation();
  bindCvLinks();
  bindCvDownloads();
  bindScrollToggle();
  bindMobileSectionToggles();
  bindRevealAnimations();
  syncFooterYear();
  applyTheme(currentTheme, false);
  loadTranslations();
  window.addEventListener("resize", () => {
    updateLanguageButton();
    updateThemeButton();
    refreshInteractiveLabels();
    refreshMobileToggleLabels();
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(event.matches ? "dark" : "light", false);
    }
  });
});
