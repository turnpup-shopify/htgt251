(function() {
  if (!window.themeSettings || !window.themeSettings.enableSlideCart) {
    return;
  }

  class TPSlideCart extends HTMLElement {
    constructor() {
      super();

      this.sectionId = this.dataset.sectionId;
      this.overlay = this.querySelector('.tp-slide-cart__overlay');
      this.panel = this.querySelector('.tp-slide-cart__panel');
      this.contentWrapper = this.querySelector('[data-slide-cart-content]');
      this.closeButtons = this.querySelectorAll('[data-slide-cart-close]');
      this.activeTrigger = null;
      this.debouncedOnChange = debounce(this.onChange.bind(this), 300);
      this.boundHandleEscape = this.handleEscape.bind(this);
      this.handleDocumentClick = this.handleDocumentClick.bind(this);
    }

    connectedCallback() {
      this.setAttribute('aria-hidden', 'true');
      if (this.panel) {
        this.panel.setAttribute('aria-hidden', 'true');
      }
      this.closeButtons.forEach((button) => button.addEventListener('click', () => this.close()));
      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.close());
      }
      this.bindDynamicEvents();
    }

    getSectionsToRender() {
      return [
        { id: this.sectionId, selector: '[data-slide-cart-content]' },
        { id: 'cart-icon-bubble', selector: '.shopify-section' },
        { id: 'cart-live-region-text', selector: '.shopify-section' }
      ];
    }

    open(trigger, { refresh = true } = {}) {
      if (trigger) {
        this.activeTrigger = trigger;
      }

      if (this.classList.contains('is-open')) {
        return;
      }

      this.classList.add('is-open');
      document.body.classList.add('tp-slide-cart-open');
      this.setAttribute('aria-hidden', 'false');
      this.panel.setAttribute('aria-hidden', 'false');
      if (this.activeTrigger) {
        this.activeTrigger.setAttribute('aria-expanded', 'true');
        this.activeTrigger.setAttribute('aria-controls', this.id || 'tp-slide-cart');
      }

      document.addEventListener('keyup', this.boundHandleEscape);
      trapFocus(this.panel);

      if (refresh) {
        this.refresh();
      }

      setTimeout(() => {
        if (this.classList.contains('is-open')) {
          document.addEventListener('click', this.handleDocumentClick);
        }
      }, 0);
    }

    close() {
      if (!this.classList.contains('is-open')) {
        return;
      }

      this.classList.remove('is-open');
      document.body.classList.remove('tp-slide-cart-open');
      this.setAttribute('aria-hidden', 'true');
      this.panel.setAttribute('aria-hidden', 'true');

      document.removeEventListener('keyup', this.boundHandleEscape);
      removeTrapFocus(this.activeTrigger);
      if (this.activeTrigger) {
        this.activeTrigger.setAttribute('aria-expanded', 'false');
      }
      document.removeEventListener('click', this.handleDocumentClick);
      this.activeTrigger = null;
    }

    handleEscape(event) {
      if (event.code === 'Escape') {
        this.close();
      }
    }

    refresh() {
      if (!this.sectionId) {
        return Promise.resolve();
      }

      return fetch(`${routes.cart_url}?section_id=${this.sectionId}`)
        .then((response) => response.text())
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const newContent = doc.querySelector('[data-slide-cart-content]');
          if (!newContent) {
            return;
          }
          this.contentWrapper.innerHTML = newContent.innerHTML;
          this.bindDynamicEvents();
          this.toggleEmptyState();
        })
        .catch((error) => console.error('[Slide Cart] Failed to refresh section', error));
    }

    renderFromSections(parsedState, { openDrawer = true } = {}) {
      const sections = this.getSectionsToRender();
      sections.forEach((section) => {
        const html = parsedState.sections?.[section.id];
        if (!html) {
          return;
        }

        const innerHTML = this.getSectionInnerHTML(html, section.selector);

        if (section.id === this.sectionId) {
          this.contentWrapper.innerHTML = innerHTML;
          this.bindDynamicEvents();
          this.toggleEmptyState(parsedState.item_count === 0);
        } else {
          const container = document.getElementById(section.id);
          if (!container) {
            return;
          }
          if (section.selector) {
            const target = container.querySelector(section.selector) || container;
            target.innerHTML = innerHTML;
          } else {
            container.innerHTML = innerHTML;
          }
        }
      });

      if (openDrawer) {
        this.open(null, { refresh: false });
      }
    }

    bindDynamicEvents() {
      if (this.form) {
        this.form.removeEventListener('change', this.debouncedOnChange);
      }

      this.form = this.querySelector('#TP-SlideCartForm');
      if (!this.form) {
        return;
      }

      this.form.addEventListener('change', this.debouncedOnChange);

      this.form.querySelectorAll('[data-remove]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          this.updateQuantity(button.dataset.line, 0);
        });
      });
    }

    onChange(event) {
      if (event.target.name !== 'updates[]') {
        return;
      }
      const line = event.target.dataset.index;
      const quantity = event.target.value;
      this.updateQuantity(line, quantity, event.target);
    }

    updateQuantity(line, quantity, input) {
      const body = JSON.stringify({
        line: Number(line),
        quantity: Number(quantity),
        sections: this.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname
      });

      const updateTarget = this.querySelector(`#SlideCartItem-${line}`);
      if (updateTarget) {
        updateTarget.classList.add('is-updating');
      }

      fetch(`${routes.cart_change_url}`, { ...fetchConfig(), body })
        .then((response) => response.text())
        .then((state) => {
          const parsedState = JSON.parse(state);
          this.renderFromSections(parsedState, { openDrawer: false });
        })
        .catch(() => {
          if (input) {
            input.value = input.getAttribute('value');
          }
        })
        .finally(() => {
          if (updateTarget) {
            updateTarget.classList.remove('is-updating');
          }
        });
    }

    toggleEmptyState(forceEmpty) {
      const isEmpty = typeof forceEmpty === 'boolean'
        ? forceEmpty
        : !this.contentWrapper.querySelector('.tp-slide-cart__item');
      this.dataset.empty = isEmpty;
      this.classList.toggle('tp-slide-cart--empty', isEmpty);
    }

    getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }

    handleDocumentClick(event) {
      if (!this.classList.contains('is-open')) {
        return;
      }

      const clickedInsidePanel = this.panel && this.panel.contains(event.target);
      const clickedTrigger = this.activeTrigger && this.activeTrigger.contains(event.target);

      if (clickedInsidePanel || clickedTrigger) {
        return;
      }

      this.close();
    }
  }

  customElements.define('tp-slide-cart', TPSlideCart);

  document.addEventListener('DOMContentLoaded', () => {
    const slideCart = document.querySelector('tp-slide-cart');
    if (!slideCart) {
      return;
    }

    window.__slideCart = slideCart;

    const triggers = document.querySelectorAll('[data-slide-cart-trigger]');
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        if (!window.themeSettings?.enableSlideCart) {
          return;
        }
        event.preventDefault();
        slideCart.open(trigger);
      });
    });
  });
})();
