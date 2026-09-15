(function () {
  const PERSONAS = ["gamer", "pro", "code"];
  const KEY = "persona";

  function getPersona() {
    try {
      const v = localStorage.getItem(KEY);
      return PERSONAS.includes(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  function setPersona(p) {
    if (!PERSONAS.includes(p)) return;
    try {
      localStorage.setItem(KEY, p);
    } catch (e) {
      /* ignore */
    }
  }

  function clearPersona() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function isForceParam() {
    return new URLSearchParams(location.search).has("force");
  }

  function maybeAutoRoute() {
    if (isForceParam()) return false;
    const p = getPersona();
    if (!p) return false;
    location.replace(`/${p}.html`);
    return true;
  }

  function mountSwitchButton() {
    if (document.querySelector(".persona-switch")) return;
    const a = document.createElement("a");
    a.className = "persona-switch";
    a.href = "/?force=1";
    a.textContent = "↺ switch persona";
    document.body.appendChild(a);
  }

  function mountProgress() {
    if (document.querySelector(".site-progress")) return;
    const rail = document.createElement("div");
    const fill = document.createElement("span");
    rail.className = "site-progress";
    rail.setAttribute("aria-hidden", "true");
    rail.appendChild(fill);
    document.body.appendChild(rail);

    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      fill.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    update();
  }

  window.persona = {
    PERSONAS,
    get: getPersona,
    set: setPersona,
    clear: clearPersona,
    isForce: isForceParam,
    maybeAutoRoute,
    mountSwitchButton,
    mountProgress,
  };

  addEventListener("DOMContentLoaded", mountProgress);
})();
