window.DaysOrHours = "Hours";

window.addEventListener("scroll", function () {
  const collage = document.querySelector(".collage");

  if (collage && collage.offsetParent !== null) { // Check if element is visible
      collage.classList.add("flwr_show");
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

  
