const root = document.documentElement;
const header = document.getElementById("site-header");
const navbar = document.getElementById("navbar");
const menuButton = document.getElementById("menu-button");
const themeButton = document.getElementById("theme-button");
const progressBar = document.getElementById("scroll-progress");
const backToTop = document.getElementById("back-to-top");
 
/* Saudação de acordo com o horário*/
(function setGreeting() {
    const el = document.getElementById("greeting");
    if (!el) return;
    const hour = new Date().getHours();
    let text = "boa noite!";
    if (hour >= 5 && hour < 12) text = "bom dia!";
    else if (hour >= 12 && hour < 18) text = "boa tarde!";
    el.textContent = text + "";
})();
 
/* Tema claro/escuro */
function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeButton.textContent = theme === "dark" ? "☀️" : "🌙";
    themeButton.setAttribute(
        "aria-label",
        theme === "dark" ? "Mudar para o tema claro" : "Mudar para o tema escuro"
    );
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0d12" : "#f7f8fc");
}
 
applyTheme(root.getAttribute("data-theme") || "dark");
 
themeButton.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* armazenamento indisponível */ }
});
 
/* Menu mobile */
function setMenu(open) {
    navbar.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}
 
menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});
navbar.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
});
 
/* Scroll: barra de progresso, header e botão de topo */
let ticking = false;
function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    header.classList.toggle("scrolled", y > 10);
    backToTop.classList.toggle("visible", y > 600);
    ticking = false;
}
window.addEventListener("scroll", () => {
    if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
    }
}, { passive: true });
onScroll();
 
backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
 
/* Link ativo no menu conforme a seção visível*/
(function trackActiveSection() {
    const links = Array.from(navbar.querySelectorAll("a[href^='#']"));
    const sections = links
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);
 
    if (!("IntersectionObserver" in window)) return;
 
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((link) => {
                const active = link.getAttribute("href") === "#" + entry.target.id;
                link.classList.toggle("active", active);
                if (active) link.setAttribute("aria-current", "true");
                else link.removeAttribute("aria-current");
            });
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
 
    sections.forEach((section) => observer.observe(section));
})();
 
/* Animação de entrada (reveal) */
(function revealOnScroll() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("in-view"));
        return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.12 });
 
    items.forEach((el, i) => {
        // pequeno atraso escalonado para irmãos próximos
        el.style.transitionDelay = (i % 3) * 80 + "ms";
        observer.observe(el);
    });
})();
 
/* Filtro de projetos*/
(function projectFilters() {
    const buttons = document.querySelectorAll(".filter");
    const cards = document.querySelectorAll(".project-card");
 
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
 
            buttons.forEach((b) => {
                const active = b === button;
                b.classList.toggle("active", active);
                b.setAttribute("aria-pressed", String(active));
            });
 
            cards.forEach((card) => {
                const show = filter === "all" || card.dataset.category === filter;
                card.hidden = !show;
                if (show) card.classList.add("in-view");
            });
        });
    });
})();
