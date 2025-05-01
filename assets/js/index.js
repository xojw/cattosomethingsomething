document.addEventListener('DOMContentLoaded', function () {
  const loadingScreen = document.createElement('div');
  loadingScreen.classList.add('loading-screen');
  document.body.appendChild(loadingScreen);

  requestAnimationFrame(() => {
    loadingScreen.style.opacity = '1';
  });

  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        loadingScreen.style.pointerEvents = 'none';
      }, 400);
    }, 100);
  });

  const refreshIcon = document.getElementById("refreshIcon");
  
  if (refreshIcon) {
    refreshIcon.addEventListener("click", function () {
      refreshIcon.style.animation = "none";
      void refreshIcon.offsetWidth;
      refreshIcon.style.animation = "spinTwo 0.4s linear";
    });
  }

  const searchInputt = document.getElementById("searchInputt");
  const searchInput = document.getElementById("searchInput");
  const iframe = document.querySelector("#p-iframe");
  const backIcon = document.getElementById("backIcon");
  const forwardIcon = document.getElementById("forwardIcon");
  const fullscreenIcon = document.getElementById("fullscreenIcon");
  const navBar = document.querySelector(".navbar");

  const hoverTrigger = document.createElement("div");
  hoverTrigger.classList.add("hover-trigger");
  hoverTrigger.style.display = "none";
  document.body.appendChild(hoverTrigger);

  let isTyping = false;
  let tipShown = false; 

  hoverTrigger.addEventListener("mouseenter", () => {
    showNavbar();
  });

  navBar.addEventListener("mouseleave", () => {
    if (!isTyping) hideNavbar();
  });

  if (searchInputt) {
    searchInputt.addEventListener("focus", () => {
      isTyping = true;
      showNavbar();
    });

    searchInputt.addEventListener("blur", () => {
      isTyping = false;
      hideNavbar();
    });
  }

  function showNavbar() {
    navBar.style.opacity = "1";
    navBar.style.transform = "translateY(0)";
    navBar.style.pointerEvents = "auto";
    hoverTrigger.style.backgroundColor = "#e4e4e4b9"; 
  }

  function hideNavbar() {
    if (!isTyping) {
      navBar.style.opacity = "0";
      navBar.style.transform = "translateY(-100%)";
      navBar.style.pointerEvents = "none";
      hoverTrigger.style.backgroundColor = "";
    }
  }

  const historyStack = [];
  let currentIndex = -1;

  document.getElementById('refreshIcon').addEventListener('click', function () {
    refreshIcon.classList.add('spin');
    if (iframe && iframe.tagName === 'IFRAME') {
      const currentUrl = iframe.contentWindow.location.href;
      if (historyStack[currentIndex] !== currentUrl) {
        addToHistory(currentUrl);
      }
      iframe.contentWindow.location.reload(true);
    }
    setTimeout(() => {
      refreshIcon.classList.remove('spin');
    }, 300);
  });

  iframe.style.display = "none";
  iframe.style.opacity = 0;
  iframe.style.transform = "translateY(10px)";
  navBar.style.opacity = "0"; 
  navBar.style.transform = "translateY(-100%)"; 
  navBar.style.pointerEvents = "none";

  [searchInput, searchInputt].forEach((input) => {
    if (input) {
      input.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
          handleSearch(input.value, input === searchInputt);
        }
      });
    }
  });

  async function handleSearch(query, isQuickSearch = false) {
    const searchURL = generateSearchUrl(query);

    loadingScreen.style.display = "flex";
    setTimeout(() => {
      loadingScreen.style.opacity = 1;
    }, 50);

    if (!isQuickSearch) {
      iframe.style.display = "none";
      iframe.style.opacity = 0;
      navBar.style.opacity = "0";
      navBar.style.transform = "translateY(-100%)";
      hoverTrigger.style.display = "none"; 
    }

    iframe.src = await getUrl(searchURL);
    addToHistory(iframe.src);

    iframe.onload = () => {
      const interval = setInterval(() => {
        try {
          if (iframe.contentDocument.readyState === 'complete') {
            clearInterval(interval);
            setTimeout(() => {
              loadingScreen.style.transition = "opacity 0.6s ease";
              loadingScreen.style.opacity = 0;

              if (!isQuickSearch) {
                iframe.style.display = "block";
                iframe.style.transition = "opacity 0.6s ease, transform 0.6s ease"; 
                iframe.style.opacity = 1;
                iframe.style.transform = "translateY(0)";
                hoverTrigger.style.display = "block"; 

                if (!tipShown && !localStorage.getItem('tipShown')) {
                  tipShown = true;
                  showTip();
                  localStorage.setItem('tipShown', 'true');
                }
              }

              setTimeout(() => {
                loadingScreen.style.display = "none"; 
                loadingScreen.style.pointerEvents = 'none'; 
              }, 400);
            }, 100);
          }
        } catch (e) {
          console.error(e);
        }
      }, 100);
    };
  }

  function generateSearchUrl(query) {
    try {
      const url = new URL(query);
      return url.toString(); 
    } catch {
      try {
        const url = new URL(`https://${query}`);
        if (url.hostname.includes(".")) return url.toString(); 
      } catch {}
    }
    return `https://duckduckgo.com/search?q=${encodeURIComponent(query)}&source=web`;
  }

  function getUrl(url) {
    return Promise.resolve(__uv$config.prefix + __uv$config.encodeUrl(url));
  }

  function addToHistory(url) {
    if (url && !historyStack.includes(url)) {
      historyStack.push(url);
      currentIndex++;
    }
    updateNavButtons();
  }

  function updateNavButtons() {
    if (currentIndex <= 0) {
      backIcon.classList.add('disabled');
      backIcon.disabled = true;
    } else {
      backIcon.classList.remove('disabled');
      backIcon.disabled = false;
    }

    if (currentIndex >= historyStack.length - 1) {
      forwardIcon.classList.add('disabled');
      forwardIcon.disabled = true;
    } else {
      forwardIcon.classList.remove('disabled');
      forwardIcon.disabled = false;
    }
  }

  backIcon.addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      iframe.src = historyStack[currentIndex];
      updateNavButtons();
    }
  });

  forwardIcon.addEventListener("click", function () {
    if (currentIndex < historyStack.length - 1) {
      currentIndex++;
      iframe.src = historyStack[currentIndex];
      updateNavButtons();
    }
  });

  fullscreenIcon.addEventListener("click", function () {
    iframe.requestFullscreen();
  });

  iframe.addEventListener("load", () => {
    if (historyStack.length === 0) {
      updateNavButtons();
    } else {
      addToHistory(iframe.contentWindow.location.href);
    }
  });

  function showTip() {
    const tipContainer = document.createElement('div');
    tipContainer.classList.add('user-tip');
    tipContainer.style.position = 'absolute';
    tipContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
    tipContainer.style.color = '#fff';
    tipContainer.style.padding = '10px 15px';
    tipContainer.style.borderRadius = '20px';
    tipContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    tipContainer.style.zIndex = '1000';
    tipContainer.style.opacity = '0';
    tipContainer.style.transition = 'opacity 0.5s ease';
  
    const tipMessage = document.createElement('div');
    tipMessage.textContent = 'Tip: Hover over here to reveal the navigation bar';
    tipContainer.appendChild(tipMessage);
  
    const tipArrow = document.createElement('div');
    tipArrow.style.position = 'absolute';
    tipArrow.style.top = '-10px';
    tipArrow.style.left = '50%';
    tipArrow.style.transform = 'translateX(-50%)';
    tipArrow.style.width = '0';
    tipArrow.style.height = '0';
    tipArrow.style.borderLeft = '10px solid transparent';
    tipArrow.style.borderRight = '10px solid transparent';
    tipArrow.style.borderBottom = '10px solid rgba(0, 0, 0, 0.86)';
    tipContainer.appendChild(tipArrow);
  
    tipContainer.style.top = '-20.8vw';     
    tipContainer.style.left = '50%';      
    tipContainer.style.transform = 'translateX(-50%)';
  
    document.body.appendChild(tipContainer);
  
    setTimeout(() => {
      tipContainer.style.opacity = '1';
    }, 100);
  
    setTimeout(() => {
      tipContainer.style.opacity = '0';
      setTimeout(() => {
        tipContainer.remove();
      }, 500);
    }, 5000);
  }  
});
