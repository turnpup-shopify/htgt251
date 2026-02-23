(function () {
  // Set to true while an AJAX cart mutation is in flight to prevent race conditions.
  let gwpMutationInProgress = false;

  // Called when the user clicks the "Add free gift" button in the GWP zone.
  async function addGWP() {
    const zone = document.getElementById('gwp-zone');
    if (!zone || gwpMutationInProgress) return;

    const variantId = Number(zone.dataset.gwpVariantId);
    if (!variantId) return;

    const discountCode = (zone.dataset.gwpDiscountCode || '').trim();

    gwpMutationInProgress = true;
    try {
      const res = await fetch(routes.cart_add_url, {
        ...fetchConfig(),
        body: JSON.stringify({ id: variantId, quantity: 1 })
      });
      if (!res.ok) throw new Error('GWP add failed');

      // If a discount code is configured, apply it now using the same
      // /discount/{code} pattern the theme uses for manual code entry.
      if (discountCode) {
        const redirectPath = window.location.pathname + (window.location.search || '');
        await fetch(
          `/discount/${encodeURIComponent(discountCode)}?redirect=${encodeURIComponent(redirectPath)}`,
          { method: 'GET', credentials: 'same-origin' }
        );
      }

      const slideCart = window.__slideCart;
      if (slideCart) await slideCart.refresh();
    } catch (e) {
      console.error('[GWP] Failed to add gift:', e);
    } finally {
      gwpMutationInProgress = false;
    }
  }

  // Called by tp-slide-cart.js after every content re-render.
  // Reads the Liquid-computed data attributes from #gwp-zone to detect
  // the one case Liquid can't resolve on its own: the GWP is in the cart
  // but the qualifying subtotal has dropped below the threshold. In that
  // case we silently remove the GWP via the AJAX Cart API, then refresh.
  async function checkAndRemove() {
    const zone = document.getElementById('gwp-zone');
    if (!zone || gwpMutationInProgress) return;

    const inCart = zone.dataset.gwpInCart === 'true';
    const eligible = zone.dataset.gwpEligible === 'true';
    const itemKey = zone.dataset.gwpItemKey;

    if (inCart && !eligible && itemKey) {
      gwpMutationInProgress = true;
      try {
        await fetch(routes.cart_change_url, {
          ...fetchConfig(),
          body: JSON.stringify({ id: itemKey, quantity: 0 })
        });
        const slideCart = window.__slideCart;
        if (slideCart) await slideCart.refresh();
      } catch (e) {
        console.error('[GWP] Failed to remove gift:', e);
      } finally {
        gwpMutationInProgress = false;
      }
    }
  }

  window.gwp = { addGWP, checkAndRemove };
})();
