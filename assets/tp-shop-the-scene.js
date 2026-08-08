(function () {
  class TPShopSceneDrawer extends HTMLElement {
    constructor() {
      super();
      this.activeTrigger = null;
      this.boundHandleEscape = this.handleEscape.bind(this);
    }

    connectedCallback() {
      if (this.parentElement !== document.body) {
        document.body.appendChild(this);
        return;
      }

      this.panel = this.querySelector('.tp-scene-drawer__panel');
      this.closeButtons = this.querySelectorAll('[data-scene-drawer-close]');

      this.setAttribute('aria-hidden', 'true');
      if (this.panel) this.panel.setAttribute('aria-hidden', 'true');

      this.closeButtons.forEach(function (btn) {
        btn.addEventListener('click', this.close.bind(this));
      }.bind(this));
    }

    open(trigger) {
      if (this.classList.contains('is-open')) return;
      if (trigger) this.activeTrigger = trigger;

      this.classList.add('is-open');
      document.body.classList.add('tp-scene-drawer-open');
      this.setAttribute('aria-hidden', 'false');
      if (this.panel) this.panel.setAttribute('aria-hidden', 'false');

      if (this.activeTrigger) {
        this.activeTrigger.setAttribute('aria-expanded', 'true');
      }

      document.addEventListener('keyup', this.boundHandleEscape);

      if (typeof trapFocus === 'function' && this.panel) {
        trapFocus(this.panel);
      }
    }

    close() {
      if (!this.classList.contains('is-open')) return;

      this.classList.remove('is-open');
      document.body.classList.remove('tp-scene-drawer-open');
      this.setAttribute('aria-hidden', 'true');
      if (this.panel) this.panel.setAttribute('aria-hidden', 'true');

      document.removeEventListener('keyup', this.boundHandleEscape);

      if (typeof removeTrapFocus === 'function') {
        removeTrapFocus(this.activeTrigger);
      }

      if (this.activeTrigger) {
        this.activeTrigger.setAttribute('aria-expanded', 'false');
        this.activeTrigger.focus();
      }
      this.activeTrigger = null;
    }

    handleEscape(event) {
      if (event.code === 'Escape' || event.key === 'Escape') {
        this.close();
      }
    }
  }

  if (!customElements.get('tp-shop-scene-drawer')) {
    customElements.define('tp-shop-scene-drawer', TPShopSceneDrawer);
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-scene-drawer-open]');
    if (!trigger) return;
    event.preventDefault();
    var selector = trigger.getAttribute('data-scene-drawer-open');
    var drawer = selector ? document.querySelector(selector) : null;
    if (drawer && typeof drawer.open === 'function') {
      drawer.open(trigger);
    }
  });
})();
