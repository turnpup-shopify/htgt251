document.addEventListener('DOMContentLoaded', function(event) {
  
  // this below short block just dismisses the desktop menus when mouse leaves the mega menu on the bottom
  document.querySelector("#MainContent").addEventListener("mouseover", (el) => {
    console.log("mouseOver main");
    document.querySelectorAll("details").forEach((e) => {
      const openDetailsElement = e;
      const summaryElement = openDetailsElement.querySelector('summary');
      openDetailsElement.removeAttribute('open');
      summaryElement.setAttribute('aria-expanded', false);
      summaryElement.focus();
    })     
  })

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
    
  
    // same concept for bottom of PDP
    // document.querySelectorAll('.pdp_bottom_header').forEach(function(header) {
    //   header.addEventListener('click', function() {
    //     if (window.innerWidth <= 600) {
    //       let toExpand = header.nextElementSibling;
    //       if (header.classList.contains('minus')) {
    //         toExpand.classList.add('invisible');
    //         header.classList.remove('minus');
    //       } else {
    //         document.querySelectorAll('.pdp_bottom_header').forEach(function(h) {
    //           h.nextElementSibling.classList.add('invisible');
    //           h.classList.remove('minus');
    //         })
    //         toExpand.classList.remove('invisible');
    //         header.classList.add('minus');
    //       }
    //     }
    //   });
    // });
    
    // // update RK PDP Info
    // // document.querySelectorAll('.product__info-wrapper table').forEach(function(header) {
    // //   console.log("CLICK TABLE")
    // // });
    
    
    // // turnpup slick configuratino
    // const slickOptions = {
    //   slidesToShow: 1,
    //   arrows: false,
    //   focusOnSelect: true,
    //   adaptiveHeight: true,
    //   dots: true,
    //   infinite: true
    // };
    
    // document.addEventListener('DOMContentLoaded', function() {
    //   const socialSlick = document.querySelector('.social-slick');
    //   if (socialSlick) {
    //     $(socialSlick).slick(slickOptions);
    //   }
    
    //   window.addEventListener('resize', function() {
    //     document.querySelectorAll('.js-publications').forEach(function(element) {
    //       if (!element.classList.contains('slick-initialized')) {
    //         $(element).slick(slickOptions);
    //       }
    //     });
    //   });
    // });
    
    
    // changeMorePaymentOptionsCTA();
  
  
})
  
//   //  RK UPDATE TABLE INFO ON PDP + RUN HAPNY FUNCTION OTHERWISE BELOW
//   function updatePDPInfo(variant){
//     updateSKUInfo(variant);
//     if (document.querySelector("table")) {
//       tryUpdate("#item_number", variant, skus); 
//       tryUpdate("#tp-sku", variant, skus);
//       tryUpdate("#finish", variant, finishes2); 
//       tryUpdate("#weight", variant, weight_in_pounds);
//       tryUpdate("#projection", variant, meta_projection);
//       tryUpdate("#center_to_center", variant, meta_center_to_center);
//       tryUpdate("#length", variant, meta_length);
//       tryUpdate("#width", variant, meta_width);
//     }
//   }
  
//   //  HAPNY SKU field is different then RK table view              
//   function updateSKUInfo(variant){
//       if (document.querySelector("#tp-sku")) {
//         document.querySelector("#tp-sku").innerHTML = variant.sku;  
//       }
//     }
  
//   function tryUpdate(selector, variant, dataToUpdateFrom){
//     var temp = document.querySelector(selector);
//     if (temp) {
//       if (variant && dataToUpdateFrom[variant.id]){
//         temp.innerHTML = dataToUpdateFrom[variant.id];
//       } else {
//         temp.innerHTML = "Not Available";
//       }
//     }  
//   }
  
//   // PRINT PDF FUNCTION
//   function generatePDF() {
//     var panel = document.querySelector("html").cloneNode(true);
//     panel.querySelectorAll(".hideFromPrintout").forEach((el)=>{
//       el.remove();
//     })
//     panel.querySelectorAll(".price, .slider-buttons, .minimal_button, .hapny_button, footer, product-recommendations, header-drawer").forEach((el)=>{
//       el.style.display = "none";
//     })
//     panel.querySelectorAll(".product-media-container.constrain-height").forEach((el)=>{
//       el.style.margin = "0px 200px 0 0";
//     })   
//     panel.querySelectorAll(".purchase-box").forEach((el)=>{
//       el.style.margin = "-100px 0 0";
//     })
//     panel.querySelectorAll(".product-form__input").forEach((el, index)=>{
//       if (index == 1 || index == 0) { el.style.display= "none"; }
//     })       
//     panel.querySelector("product-info").style.paddingTop = "0px"; 
//     panel.querySelector("product-info").style.paddingTop = "0px"; 
//     panel.querySelector(".header").style.setProperty("background-color", "red", "important");
//     panel.querySelector(".header-wrapper--border-bottom").style.borderBottom = "none"; 
//     panel.querySelector(".product .grid__item").style.marginBottom = "0px"; 
//     panel.querySelectorAll("ul li:not(:first-of-type)").forEach((e)=>{e.style.display = "none"});
//     panel.querySelector(".product-media-container").style.width = "200px";
//     panel.querySelector(".product-media-modal")?.remove();  
//     panel.querySelector(".thumbnail-slider")?.remove();
//     panel.querySelector(".simple-collection")?.remove();
//     panel.querySelector(".section-header")?.remove();
    
//     let container = document.createElement("div");
//     let legend = document.createElement("legend");
//     legend.className = "form__label";
//     legend.textContent = "More Finishes"
//     container.append(legend);
//     let innerContainer = document.createElement("div");
//     innerContainer.style.marginTop = "6px" ;
//     innerContainer.style.marginLeft = "12px" ;
//     innerContainer.style.marginBottom = "-4px" ;
//     let ul = document.createElement("ul");
//     ul.style.margin = "margin: 0 0 0 20px";
//     for (finish in finishes) {
//       let li = document.createElement("li");
//       li.style.fontSize = "14px";
//       li.innerHTML = finishes[finish];
//       ul.append(li);
//     }
//     innerContainer.append(ul);
//     container.append(innerContainer);
//     panel.querySelector(".product__info-container").append(container);
  
//     var tempLogo = addLogoToTop();
//     panel.querySelector("body").prepend(tempLogo);
  
  
//     var printWindow = window.open('', '', 'height=1000,width=500');
//     printWindow.document.write(panel.innerHTML);
//     printWindow.document.close();
//     setTimeout(function () {
//         printWindow.print(printWindow);
//     }, 5000);
//     return false;
//   }
  
//   function changeMorePaymentOptionsCTA() {
//     setTimeout(() => {
//       const element = document.querySelector("#more-payment-options-link");
      
//       if (element) {
//         element.textContent = "Buy Now";
//       }
//     }, 500); // The delay should be a number, not a string
//   }
  
//   function revealDimensionTwo(clickID){
//     var toRevealID = clickID + "_reveal";
//     if(document.querySelector(clickID)) {
//       document.querySelector(clickID).addEventListener("click", (e) => {
//         e.target.style.display = "none";
//         document.querySelector(toRevealID).classList.remove("display_none");
//         document.querySelector(toRevealID).classList.add("display_block");
//       })
//     }
//   }
  
//   function addLogoToTop(){
//     const logoElement = document.querySelector(".header__heading-logo");
  
//     // Check if the element exists
//     if (logoElement) {
//       // Create a new <img> element
//       const newImg = document.createElement("img");
      
//       // Set the src of the new image to match the current element
//       newImg.src = logoElement.src;
      
//       // Optionally, copy other attributes like alt
//       newImg.alt = logoElement.alt || "Logo";
  
//       // Style or modify the new image (optional)
//       newImg.style.position = "relative";
//       newImg.style.top = "0";
//       newImg.style.left = "8";
//       newImg.style.width = "80px";
//       newImg.style.display = "block";
  
//       // Append the new image to the top of the <body>
//       return newImg;
//     } else {
//       console.log(".header__heading-logo not found");
//     }
//   }
  
//   function swapImageAndLoad(tempElement, tempNewImage){
//     console.log("swap image function new");
//     console.log(tempElement);
  
//     tempElement.closest(".media--hover-effect").classList.add('loading');
//     tempElement.closest(".media--hover-effect").classList.add('show');
//     tempElement.closest(".media--hover-effect").querySelectorAll("img").forEach((el) => { el.style.zIndex = "-10"; el.style.opacity = 0.4; })
  
//     // Preload the new image
//     const img = new Image();
//     img.src = tempNewImage;
  
//     img.onload = function () {
//       // Swap the image
//       tempElement.src = tempNewImage;
  
//       // Remove loading state
//       tempElement.closest(".media--hover-effect").classList.remove('loading');
//       tempElement.closest(".media--hover-effect").classList.remove('show');
//       tempElement.closest(".media--hover-effect").querySelectorAll("img").forEach((el) => { el.style.zIndex = "1"; el.style.opacity = 1; })
  
//     };
//   }