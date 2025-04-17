document.addEventListener('DOMContentLoaded', function() {
  
    function handleScroll() {
      var mobileNavHeader = document.getElementById("fixed_mobile_nav_bar");
      if (!mobileNavHeader) {
        // console.log("Element with ID 'fixed_mobile_nav_bar' not found.");
      } else {
        if (window.scrollY >= 4) {
          mobileNavHeader.classList.add("blackBorder");
        } else {
          mobileNavHeader.classList.remove("blackBorder");
        }
      }
    }
  
    handleScroll(); // Initial check on page load
    window.addEventListener('scroll', handleScroll);
  
    document.querySelectorAll('.sidemenu_checkbox').forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          console.log("unchecked --> checked");
        } else {
          console.log("checked --> unchecked");
        }
        var newURL = this.nextElementSibling.getAttribute('href');
        window.location.href = newURL;
      });
    });
  
    // var tpNav = document.getElementById("tp_nav");
    var tpNav = document.querySelector(".header");
    if (typeof TurnpupObject !== "undefined" && TurnpupObject) {
        if (TurnpupObject.turnpup_nav_hide_homepage_before_scroll === "false" && tpNav) {
            tpNav.classList.add("border_nav");
        }
    }
  
    function updateHeader() {
      var siteHeader = document.querySelector('.header');
      if (window.scrollY >= 4) {
        if (window.location.pathname === '/') {
          siteHeader.style.backgroundColor = TurnpupObject.site_header_background_color_homepage;
        } else {
          siteHeader.style.backgroundColor = TurnpupObject.site_header_background_color;
          tpNav.classList.add("border_nav");
        }
      } else {
        if (window.location.pathname === '/') {
          siteHeader.style.backgroundColor = TurnpupObject.site_header_zero_scroll_background_color_homepage;
          if (TurnpupObject.turnpup_nav_hide_homepage_before_scroll) {
            tpNav.classList.remove("border_nav");
          }
        } else {
          siteHeader.style.backgroundColor = TurnpupObject.site_header_zero_scroll_background_color;
          tpNav.classList.add("border_nav");
        }
      }
    }
  
    if (typeof TurnpupObject !== "undefined" && TurnpupObject) {     
        updateHeader(); // Initial check on page load
        window.addEventListener('scroll', updateHeader);
  
        var isScrolling;
        if (TurnpupObject.isScrollTest) {
            console.log("ISSCROLL TEST");
        } else {
            if (TurnpupObject.nav_transparent_after_scroll) {
                document.addEventListener('scroll', function() {
                    clearTimeout(isScrolling);
                    isScrolling = setTimeout(function() {
                        console.log("timeout - call callback");
                        document.getElementById('shopify-section-header').classList.remove("turnpupNavEnabled");
                        document.getElementById('shopify-section-header').classList.add("turnpupNavDisabled");
                    }, TurnpupObject.time_to_transparent_header);
            
                    var header = document.querySelector('.section-header');
                    var navLinks = document.getElementsByClassName("tpup_nav_link");
            
                    if (window.scrollY === 0) {
                        for (var i = 0; i < navLinks.length; i++) {
                        navLinks[i].classList.remove("tpup_nav_link_scrolled");
                        navLinks[i].classList.add("tpup_nav_link_top");
                        }
                        if (header) {
                        if (header.classList) {
                            header.classList.remove("turnpupNavEnabled");
                        header.classList.add("turnpupNavDisabled");
                        }
                        }          
                    } else {
                        for (var i = 0; i < navLinks.length; i++) {
                        navLinks[i].classList.remove("tpup_nav_link_top");
                        navLinks[i].classList.add("tpup_nav_link_scrolled");
                        }
                        if (header) {
                        if (header.classList) {
                            header.classList.remove("turnpupNavDisabled");
                            header.classList.add("turnpupNavEnabled");
                        }
                    }
                }
                });
            } else {
                document.addEventListener('scroll', function() {
                var header = document.getElementById('shopify-section-header');
                var navLinks = document.getElementsByClassName("tpup_nav_link");
        
                if (window.scrollY === 0) {
                    for (var i = 0; i < navLinks.length; i++) {
                    navLinks[i].classList.remove("tpup_nav_link_scrolled");
                    navLinks[i].classList.add("tpup_nav_link_top");
                    }
                    if (header) {
                    if (header.classList) {
                        header.classList.remove("turnpupNavEnabled");
                        header.classList.add("turnpupNavDisabled");
                    }
                    } 
                } else {
                    for (var i = 0; i < navLinks.length; i++) {
                    navLinks[i].classList.remove("tpup_nav_link_top");
                    navLinks[i].classList.add("tpup_nav_link_scrolled");
                    }
                    if (header) {
                    if (header.classList) {
                        header.classList.remove("turnpupNavDisabled");
                        header.classList.add("turnpupNavEnabled");
                    }
                    }          
                }
                });
            }
        }
    }
  
    // NEWSLETTER MULTI COLOR LETTERING
    var popupEmailInput = document.querySelector(".popup-email .input-group-field");
    var popupEmailLastValue;
    
    if (popupEmailInput) {
      popupEmailLastValue = popupEmailInput.value;
    } else {    
      popupEmailLastValue = ""; // Set a default value or handle appropriately
    }
  
    var footerInput = document.querySelector(".site-footer .input-group-field");
    var footerLastValue;
  
    if (footerInput) {
      footerLastValue = footerInput.value;
    } else {
      footerLastValue = ""; // Set a default value or handle appropriately
    }
  
  
    if (popupEmailInput) {
      popupEmailInput.addEventListener("input", function() {
        if (this.value === popupEmailLastValue) {
          console.log('no change to popup email');
        } else {
          console.log('change to popup email');
          popupEmailLastValue = this.value;
          var tpValue = this.value;
          document.querySelector(".newsletter_user_input").textContent = tpValue;
          // Assuming you have a lettering function defined elsewhere
          // document.querySelector(".newsletter_user_input").lettering();
          if (tpValue !== '' && tpValue !== null) {
            console.log("text --> .popup-email");
          } else {
            console.log("No text --> .popup-email");
          }
        }
      });
    }
  
    if (footerInput) {
      footerInput.addEventListener("input", function() {
      if (this.value === footerLastValue) {
          console.log('no change to footer');
        } else {
          footerLastValue = this.value;
          var tpValue = this.value;
          document.querySelector(".footer_newsletter_user_input").textContent = tpValue;
          // Assuming you have a lettering function defined elsewhere
          // document.querySelector(".footer_newsletter_user_input").lettering();
        }
      });
    }
  
    // Scroll visibility check for elements
    function isElementVisible(element, partial) {
      var rect = element.getBoundingClientRect();
      var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
      var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
      var isVisible = (
        rect.top <= viewHeight &&
        rect.bottom >= 0 &&
        rect.left <= viewWidth &&
        rect.right >= 0
      );
  
      if (partial) {
        isVisible = (
          (rect.top >= 0 && rect.top <= viewHeight) ||
          (rect.bottom >= 0 && rect.bottom <= viewHeight) ||
          (rect.left >= 0 && rect.left <= viewWidth) ||
          (rect.right >= 0 && rect.right <= viewWidth)
        );
      }
  
      return isVisible;
    }
  
    var allModules = document.querySelectorAll(".module");
    var allModulesLeft = document.querySelectorAll(".module-left");
  
    allModules.forEach(function(el) {
      if (isElementVisible(el, true)) {
        el.classList.add("already-visible");
      }
    });
  
    allModulesLeft.forEach(function(el) {
      if (isElementVisible(el, true)) {
        el.classList.add("already-visible");
      }
    });
  
    window.addEventListener('scroll', function() {
      allModules.forEach(function(el) {
        if (isElementVisible(el, true)) {
          el.classList.add("come-in");
        }
      });
  
      allModulesLeft.forEach(function(el) {
        if (isElementVisible(el, true)) {
          el.classList.add("come-in-left");
        }
      });
    });
  });