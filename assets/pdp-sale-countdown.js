/*
  <pdp-sale-countdown> renders the price block's sale countdown as a ticking
  HH MM SS band. The end time rules mirror assets/countdown.js so both styles
  agree. An end date in the past rolls to the end of today. A start date in
  the future counts down to the start instead. The band stays hidden until
  the first tick and hides again when it reaches zero.
*/
if (!customElements.get('pdp-sale-countdown')) {
  class PdpSaleCountdown extends HTMLElement {
    connectedCallback() {
      const now = new Date();
      const start = this.parseDate(this.dataset.start);
      let end = this.parseDate(this.dataset.end);

      if (end && end.getTime() <= now.getTime()) {
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
      }

      this.startsLater = Boolean(start && start.getTime() > now.getTime());
      this.target = this.startsLater ? start : end;
      if (!this.target) return;

      this.labelEl = this.querySelector('[data-countdown-label]');
      if (this.startsLater && this.labelEl) this.labelEl.textContent = this.dataset.startsLabel;
      this.lastMinute = null;

      this.tick();
      this.interval = setInterval(() => this.tick(), 1000);
    }

    disconnectedCallback() {
      clearInterval(this.interval);
    }

    parseDate(value) {
      if (!value) return null;
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    tick() {
      const left = Math.floor((this.target.getTime() - Date.now()) / 1000);
      if (left <= 0) {
        this.hidden = true;
        clearInterval(this.interval);
        return;
      }

      const days = Math.floor(left / 86400);
      const hours = Math.floor((left % 86400) / 3600);
      const minutes = Math.floor((left % 3600) / 60);
      const seconds = left % 60;
      const pad = (n) => String(n).padStart(2, '0');

      this.setPart('d', days, String(days));
      this.setPart('h', hours, pad(hours));
      this.setPart('m', minutes, pad(minutes));
      this.setPart('s', seconds, pad(seconds));

      const minuteKey = `${days}:${hours}:${minutes}`;
      if (minuteKey !== this.lastMinute) {
        this.lastMinute = minuteKey;
        const label = this.labelEl ? this.labelEl.textContent.trim() : '';
        const unit = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
        const dayText = days > 0 ? `${unit(days, 'day')} ` : '';
        this.setAttribute('aria-label', `${label} ${dayText}${unit(hours, 'hour')} ${unit(minutes, 'minute')}`);
      }

      this.hidden = false;
    }

    setPart(unit, value, text) {
      const num = this.querySelector(`[data-countdown-${unit}]`);
      if (!num) return;
      num.textContent = text;
      if (unit === 'd') num.closest('[data-countdown-group]').hidden = value === 0;
    }
  }

  customElements.define('pdp-sale-countdown', PdpSaleCountdown);
}
