/*
 * tp-shop-the-scene
 * ------------------------------------------------------------
 * A right-side slide-out drawer that lists the products staged in a
 * "Shop the Scene" card. Mirrors the conventions used by tp-slide-cart
 * (is-open class, trapFocus/removeTrapFocus globals, body scroll-lock,
 * Esc-to-close, overlay-click-to-close, focus restored to the trigger).
 *
 * Markup contract (rendered by sections/tp-shop-the-scene.liquid):
 *   <button data-scene-drawer-open="#SceneDrawer-xxxxx">…</button>
 *   <tp-shop-scene-drawer id="SceneDrawer-xxxxx" class="tp-scene-drawer">
 *     <div class="tp-scene-drawer__overlay" data-scene-drawer-close></div>
 *     <aside class="tp-scene-drawer__panel" role="dialog" aria-modal="true" …>
 *       <button data-scene-drawer-close>…</button>
 *       …product grid…
 *     </aside>
 *   </tp-shop-scene-drawer>
 */
(function () {
  class TPShopSceneDrawer extends HTMLElement {
    constructor() {
      super();
      this.activeTrigger = null;
      this.boundHandleEscape = this.handleEscape.bind(this);
    }

    connectedCallback() {
      // Teleport to <body> so position:fixed escapes any ancestor stacking
      // context or overflow container created by Shopify section wrappers.
      // connectedCallback fires again after the move; the guard stops re-entry.
      if (this.parentElement !== document.body) {
        document.body.appendChild(this);
        return;
      }

      // Query children here (not in constructor) — children are guaranteed
      // to be in the DOM once the element is connected.
      this.overlay = this.querySelector('.tp-scene-drawer__overlay');
      this.panel = this.querySelector('.tp-scene-drawer__panel');
      this.closeButtons = this.querySelectorAll('[data-scene-drawer-close]');

      this.setAttribute('aria-hidden', 'true');
      if (this.panel) this.panel.setAttribute('aria-hidden', 'true');
      this.closeButtons.forEach((btn) =>
        btn.addEventListener('click', () => this.close())
      );
      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.close());
      }
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

      // trapFocus is a global helper defined in global.js (same as tp-slide-cart).
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
        // Restore focus to the pill that opened the drawer.
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

  // Delegate pill clicks to the matching drawer.
  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-scene-drawer-open]');
    if (!trigger) return;
    event.preventDefault();
    const selector = trigger.getAttribute('data-scene-drawer-open');
    const drawer = selector ? document.querySelector(selector) : null;
    if (drawer && typeof drawer.open === 'function') {
      drawer.open(trigger);
    }
  });
})();
