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

  window.persona = {
    PERSONAS,
    get: getPersona,
    set: setPersona,
    clear: clearPersona,
    isForce: isForceParam,
    maybeAutoRoute,
    mountSwitchButton,
  };
})();
