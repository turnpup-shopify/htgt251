document.addEventListener('DOMContentLoaded', function(event) {
  
  document.querySelectorAll('.js-menu-summary').forEach(summary => {
    const details = summary.closest('details');
    const link = summary.querySelector('.js-summary-link');

    link.addEventListener('click', function(e) {
      if (details.hasAttribute('open')) {
        // console.log("Following link:", link.href);
      } else {
        e.preventDefault();
        // console.log("Prevented link. Opening menu instead:", link.href);
        details.setAttribute('open', true);
      }
    });
  });

  // this below block dismisses desktop menus only if any dropdown is open
  document.querySelector("#MainContent").addEventListener("mouseover", () => {
    const openMenus = Array.from(document.querySelectorAll("header details[open]"));
    if (openMenus.length === 0) return;

    // console.log("mouseOver main - closing open dropdowns");
    openMenus.forEach((e) => {
      const summaryElement = e.querySelector('summary');
      e.removeAttribute('open');
      if (summaryElement) summaryElement.setAttribute('aria-expanded', false);
    });
  });

  // find all elements with this attribute and put in an array
  const headers = document.querySelectorAll('[js-accordion-header]');
  
    document.querySelectorAll(".product-swatches__link").forEach((temp)=>{
      temp.addEventListener("mouseover", (el) => {
        var tempLink = temp.dataset.variantImage;
        temp.closest(".card-wrapper").querySelector(".card__media img").src = tempLink;
      })
    })
  
//   Mobile panel menu vvvvvvvvvvvvvvv
//         Assuming cache.$menuLink, cache.$menuOverlay, and cache.$turnpupMobileMenuClose are defined as follows:
  var menuLink = document.querySelectorAll('.menu-link'); // Replace with the actual selector
  var menuOverlay = document.querySelectorAll('.mobile-menu-overlay'); // Replace with the actual selector
  var turnpupMobileMenuClose = document.querySelectorAll('.mobile-icon-close'); // Replace with the actual selector
  
//   revealDimensionTwo("#dimension_read_more");
  
  function togglePanelMenu() {
    // Define your togglePanelMenu function here
  }
  
  function addClickListener(elements) {
    elements.forEach(function(element) {
      element.addEventListener('click', function(e) {
        togglePanelMenu();
        e.preventDefault();
      });
    });
  }
  
  // Convert NodeLists to arrays for easier manipulation
  var menuLinkArray = Array.prototype.slice.call(menuLink);
  var menuOverlayArray = Array.prototype.slice.call(menuOverlay);
  var turnpupMobileMenuCloseArray = Array.prototype.slice.call(turnpupMobileMenuClose);
  
  // Add click event listeners
  addClickListener(menuLinkArray);
  addClickListener(menuOverlayArray);
  addClickListener(turnpupMobileMenuCloseArray);
  
  function togglePanelMenu() {
    if (document.body.classList.contains('panel-open')) {
      closePanelMenu();
    } else {
      openPanelMenu();
    }
  }
  
  function openPanelMenu() {
    document.documentElement.classList.add('panel-open');
    document.body.classList.add('panel-open');
    window.scrollTo(0, 0);
  
    var menuPanel = document.querySelector('.menu-panel'); // Replace with the actual selector
    if (menuPanel) {
      menuPanel.setAttribute('tabindex', '0');
      menuPanel.focus();
    }
  }
  
  function closePanelMenu() {
    document.documentElement.classList.add('panel-open-transition');
    document.body.classList.remove('panel-open');
  
    var menuPanel = document.querySelector('.menu-panel'); // Replace with the actual selector
    if (menuPanel) {
      menuPanel.removeAttribute('tabindex');
    }
  
    setTimeout(function() {
      document.documentElement.classList.remove('panel-open-transition');
    }, 400);
  }
  // Mobile panel menu ^^^^^^^^^^^^^^
  
    document.querySelectorAll(".product-swatches__link").forEach((temp)=>{
      temp.addEventListener("click", (el) => {
        el.preventDefault();
        var tempId = temp.dataset.variantId;
        var tempImg = temp.dataset.variantImage;
        var tempImg2 = temp.dataset.variantImage;
        var tempLink = temp.href;
        var tempSku = temp.dataset.variantSku;
        temp.closest(".card-wrapper").querySelectorAll(".product-swatches__link--selected").forEach((tt)=>{tt.classList.remove("product-swatches__link--selected")});
        temp.classList.add("product-swatches__link--selected");
        var replaceImage = temp.closest(".card-wrapper").querySelector(".card__media img");
        swapImageAndLoad(replaceImage, tempImg);
        // temp.closest(".card-wrapper").querySelector(".card__media img").src = tempImg;
        const skuElement = temp.closest(".card-wrapper")?.querySelector(".card-product-sku span");
        if (skuElement) skuElement.innerText = tempSku ?? '';      // temp.closest(".card-wrapper").querySelector(".card__media img.hover").src = tempImg2;
        temp.closest(".card-wrapper").querySelector(".card__heading a").href = tempLink;
        temp.closest(".card-wrapper").querySelector(".card > .card__content .card__heading a").href = tempLink;
      })
    })
  
    // take each element from array and assign below function with click event
    for (let i = 0; i < headers.length; i++) {
      headers[i].addEventListener("click", (event) => { toggleAccordion(event); });
    }
  
    function toggleAccordion(evt) {
      var el = evt.currentTarget; // Get DOM element from click event
      var isExpanded = el.getAttribute('aria-expanded') === 'true';
    
      if (isExpanded) {
        // This stops the slide up triggering the parent
        Array.from(el.parentElement.children).forEach(function(sibling) {
          if (sibling !== el) {
            sibling.style.display = 'none';
            sibling.setAttribute('aria-hidden', 'true');
          }
        });
    
        // This is closing the children accordions when the parent accordion is closed
        var childHeaders = el.parentElement.querySelectorAll('[js-accordion-content] [js-accordion-header]');
        childHeaders.forEach(function(header) {
          header.setAttribute('aria-expanded', 'false');
          Array.from(header.parentElement.children).forEach(function(child) {
            child.style.display = 'none';
            child.setAttribute('aria-hidden', 'true');
          });
        });
    
        el.setAttribute('aria-expanded', 'false');
      } else {
        // Close all other accordions
        var siblingContents = el.parentElement.parentElement.querySelectorAll('[js-accordion-content]');
        siblingContents.forEach(function(content) {
          content.style.display = 'none';
          content.setAttribute('aria-hidden', 'true');
        });
    
        var siblingHeaders = el.parentElement.parentElement.querySelectorAll('[js-accordion-header]');
        siblingHeaders.forEach(function(header) {
          header.setAttribute('aria-expanded', 'false');
        });
    
        var siblingContent = el.nextElementSibling;
        if (siblingContent) {
          siblingContent.style.display = 'block';
          siblingContent.setAttribute('aria-hidden', 'false');
        }
    
        el.setAttribute('aria-expanded', 'true');
      }
    }

  
    document.querySelectorAll('.turnpup_question').forEach(function(header) {
      header.addEventListener('click', function() {
        if (window.innerWidth <= 600) {
          let toExpand = header.nextElementSibling;
          if (header.classList.contains('expanded')) {
            toExpand.classList.add('visible');
            header.classList.remove('expanded');
          } else {
            document.querySelectorAll('.turnpup_question').forEach(function(h) {
              h.nextElementSibling.classList.remove('visible');
              h.classList.remove('expanded');
            })
            toExpand.classList.add('visible');
            header.classList.add('expanded');
          }
        }
      });
    });  
})