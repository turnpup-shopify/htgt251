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
      this.boundDiscountApply = this.handleDiscountApply.bind(this);
      this.boundDiscountKeydown = this.handleDiscountKeydown.bind(this);
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
      this.bindDiscountForm();

      this.form.querySelectorAll('[data-remove]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          this.updateQuantity(button.dataset.line, 0);
        });
      });

      this.form.querySelectorAll('[data-upsell-add]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          this.handleUpsellAdd(button);
        });
      });
    }

    bindDiscountForm() {
      if (this.discountApplyButton) {
        this.discountApplyButton.removeEventListener('click', this.boundDiscountApply);
      }
      if (this.discountInput) {
        this.discountInput.removeEventListener('keydown', this.boundDiscountKeydown);
      }

      this.discountForm = this.querySelector('[data-slide-cart-discount-form]');
      if (!this.discountForm) {
        return;
      }

      this.discountInput = this.discountForm.querySelector('input[name="discount"]');
      this.discountApplyButton = this.discountForm.querySelector('button[type="button"]');

      if (this.discountApplyButton) {
        this.discountApplyButton.addEventListener('click', this.boundDiscountApply);
      }
      if (this.discountInput) {
        this.discountInput.addEventListener('keydown', this.boundDiscountKeydown);
      }
    }

    handleDiscountKeydown(event) {
      if (event.key !== 'Enter') {
        return;
      }
      event.preventDefault();
      this.applyDiscountCode();
    }

    handleDiscountApply(event) {
      event.preventDefault();
      this.applyDiscountCode();
    }

    applyDiscountCode() {
      if (!this.discountInput) {
        return;
      }
      const code = this.discountInput.value.trim();
      const status = this.querySelector('[data-slide-cart-discount-status]');

      const setStatus = (message) => {
        if (status) {
          status.textContent = message || '';
        }
      };

      if (!code) {
        setStatus('Enter a discount code.');
        this.discountInput.focus();
        return;
      }

      setStatus('Applying…');
      if (this.discountForm) {
        this.discountForm.classList.add('is-loading');
      }
      if (this.discountApplyButton) {
        this.discountApplyButton.disabled = true;
      }

      const redirectPath = `${window.location.pathname}${window.location.search || ''}`;
      fetch(`/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(redirectPath)}`, {
        method: 'GET',
        credentials: 'same-origin'
      })
        .then(() => {
          setStatus('Updated. If valid, it will appear below.');
          return this.refresh();
        })
        .catch(() => {
          setStatus('Could not apply the code.');
        })
        .finally(() => {
          if (this.discountForm) {
            this.discountForm.classList.remove('is-loading');
          }
          if (this.discountApplyButton) {
            this.discountApplyButton.disabled = false;
          }
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

    handleUpsellAdd(button) {
      if (!button || button.disabled) {
        return;
      }

      const variantId = Number(button.dataset.variantId);
      if (!variantId) {
        return;
      }

      button.disabled = true;
      button.classList.add('is-loading');

      const body = JSON.stringify({
        items: [{ id: variantId, quantity: 1 }]
      });

      fetch(`${routes.cart_add_url}`, { ...fetchConfig(), body })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Upsell add to cart failed');
          }
          return response.json();
        })
        .then(() => this.refresh())
        .catch((error) => {
          console.error('[Slide Cart] Upsell add error', error);
        })
        .finally(() => {
          button.disabled = false;
          button.classList.remove('is-loading');
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
