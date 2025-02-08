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

  const searchInputt = document.getElementById("searchInputt");
  const searchInput = document.getElementById("searchInput");
  const iframe = document.querySelector("#p-iframe");
  const backIcon = document.getElementById("backIcon");
  const forwardIcon = document.getElementById("forwardIcon");
  const refreshIcon = document.getElementById("refreshIcon");
  const fullscreenIcon = document.getElementById("fullscreenIcon");
  const navBar = document.querySelector(".navbar");

  const hoverTrigger = document.createElement("div");
  hoverTrigger.classList.add("hover-trigger");
  hoverTrigger.style.display = "none"; 
  document.body.appendChild(hoverTrigger);

  let isTyping = false; 

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
  }

  function hideNavbar() {
    if (!isTyping) {
      navBar.style.opacity = "0";
      navBar.style.transform = "translateY(-100%)";
      navBar.style.pointerEvents = "none";
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
          handleSearch(input.value);
        }
      });
    }
  });

  async function handleSearch(query) {
    const searchURL = generateSearchUrl(query);

    loadingScreen.style.display = "flex";
    setTimeout(() => {
      loadingScreen.style.opacity = 1;
    }, 50);

    iframe.style.display = "none";
    iframe.style.opacity = 0;
    navBar.style.opacity = "0";
    navBar.style.transform = "translateY(-100%)";
    hoverTrigger.style.display = "none"; 

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

              iframe.style.display = "block";
              iframe.style.transition = "opacity 0.6s ease, transform 0.6s ease"; 
              iframe.style.opacity = 1;
              iframe.style.transform = "translateY(0)";
              
              hoverTrigger.style.display = "block"; 

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
    return `https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`;
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
});
