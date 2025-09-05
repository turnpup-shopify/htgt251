window.DaysOrHours = "Hours";

// Reveal .collage elements efficiently using IntersectionObserver
document.addEventListener('DOMContentLoaded', () => {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('flwr_show');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll('.collage').forEach(el => io.observe(el));
  } else {
    // Fallback: reveal immediately if IO not supported
    document.querySelectorAll('.collage').forEach(el => el.classList.add('flwr_show'));
  }
});

window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll(".underline_animation").forEach((el, i) => {
    var xxx = i*400 + 200;
    setTimeout(() => {
      el.classList.add("show"); 
    }, xxx)    
  })
  document.querySelectorAll(".card--standard").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (el.querySelector(".quick-add__submit") !== null) {
        el.querySelector(".quick-add__submit").classList.add("show");
      }
    })
    el.addEventListener("mouseout", () => {
      if (el.querySelector(".quick-add__submit") !== null) {
        el.querySelector(".quick-add__submit").classList.remove("show");
      }
    })
  })
});

  
