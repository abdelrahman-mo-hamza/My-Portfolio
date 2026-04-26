const MOBILE_BREAKPOINT = 991;

let currentLanguage = localStorage.getItem("language") || detectBrowserLanguage() || "en";
let translations = {};
let progressSpans = [];
let section;
let statsSection;
let nums = [];
let started = false;

function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || "en";
  return browserLang.startsWith("ar") ? "ar" : "en";
}

function isMobileView() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
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
}

function toggleLanguage() {
  const newLang = currentLanguage === "en" ? "ar" : "en";
  applyLanguage(newLang);
}

function updateLanguageButton() {
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
  const galleryItems = document.querySelectorAll(".gallery .box .image");
  const desktopHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (!preview || !previewImage || !galleryItems.length) {
    return;
  }

  const hidePreview = () => {
    preview.classList.remove("active");
    preview.setAttribute("aria-hidden", "true");
    document.body.classList.remove("certificate-preview-active");
  };

  const showPreview = (sourceImage) => {
    if (!desktopHover.matches || !sourceImage) {
      return;
    }

    previewImage.src = sourceImage.currentSrc || sourceImage.src;
    previewImage.alt = sourceImage.alt || "Certificate preview";
    preview.classList.add("active");
    preview.setAttribute("aria-hidden", "false");
    document.body.classList.add("certificate-preview-active");
  };

  galleryItems.forEach((item) => {
    const sourceImage = item.querySelector("img");
    if (!sourceImage) {
      return;
    }

    item.addEventListener("mouseenter", () => showPreview(sourceImage));
    item.addEventListener("mouseleave", hidePreview);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hidePreview();
    }
  });

  window.addEventListener("scroll", hidePreview, { passive: true });
  window.addEventListener("resize", () => {
    if (!desktopHover.matches) {
      hidePreview();
    }
  });
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
  loadTranslations();
  handleScroll();
});

window.addEventListener("scroll", handleScroll);
