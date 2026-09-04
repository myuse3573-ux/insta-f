// ==========================================================================
// INSTAGRAM FOCUS SHIELD - PRELOAD ENGINE
// Allows ONLY: Direct Messages & Stories
// Blocks: Reels, Explore, Infinite Feed
// ==========================================================================

const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC to window
contextBridge.exposeInMainWorld('focusShield', {
  navigateMessages: () => ipcRenderer.send('focus-navigate', 'direct'),
  navigateStories: () => ipcRenderer.send('focus-navigate', 'stories'),
});

function showBlockedToast(featureName) {
  let toast = document.getElementById('focus-block-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'focus-block-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <span style="font-size: 18px;">🛡️</span>
    <div>
      <span style="font-weight: 700;">${featureName} Blocked</span>
      <div style="font-size: 11px; opacity: 0.85;">Only Stories and Messages are allowed in Focus Mode.</div>
    </div>
  `;
  toast.style.display = 'flex';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    if (toast) toast.style.display = 'none';
  }, 3500);
}

function updatePageClassification() {
  if (!document.body) return;
  const path = window.location.pathname;

  // Intercept Reels or Explore
  if (path.startsWith('/reels') || path.startsWith('/explore')) {
    showBlockedToast(path.startsWith('/reels') ? 'Reels' : 'Explore');
    window.location.replace('/direct/inbox/');
    return;
  }

  if (path.startsWith('/direct')) {
    document.body.dataset.pageType = 'direct';
  } else if (path.startsWith('/stories')) {
    document.body.dataset.pageType = 'stories';
  } else if (path === '/' || path === '') {
    document.body.dataset.pageType = 'home';
    injectFocusPlaceholder();
  } else {
    document.body.dataset.pageType = 'other';
  }

  injectTopToolbar();
  updateToolbarActiveState();
}

// Inject Floating Top Toolbar
function injectTopToolbar() {
  if (!document.body || document.getElementById('insta-focus-top-toolbar')) return;

  const toolbar = document.createElement('div');
  toolbar.id = 'insta-focus-top-toolbar';
  toolbar.innerHTML = `
    <button id="toolbar-btn-msgs" class="nav-tab" title="Instagram Direct Messages">
      <span>💬</span> Messages
    </button>
    <button id="toolbar-btn-stories" class="nav-tab" title="View Stories">
      <span>📸</span> Stories
    </button>
    <div class="focus-divider"></div>
    <div class="focus-badge" title="Focus Shield is active: Reels, Explore, and feed posts are blocked">
      <span>🛡️</span> Reels Blocked
    </div>
    <button id="toolbar-btn-refresh" class="refresh-btn" title="Refresh Page">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
      </svg>
    </button>
  `;

  document.body.appendChild(toolbar);

  toolbar.querySelector('#toolbar-btn-msgs')?.addEventListener('click', () => {
    if (!window.location.pathname.startsWith('/direct')) {
      window.location.href = '/direct/inbox/';
    }
  });

  toolbar.querySelector('#toolbar-btn-stories')?.addEventListener('click', () => {
    const firstStory = document.querySelector('div[role="menu"] button, div[role="menu"] a, div[role="menu"] canvas, div[role="menu"] img');
    if (firstStory) {
      firstStory.click();
    } else if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  });

  toolbar.querySelector('#toolbar-btn-refresh')?.addEventListener('click', () => {
    window.location.reload();
  });

  updateToolbarActiveState();
}

function updateToolbarActiveState() {
  const toolbar = document.getElementById('insta-focus-top-toolbar');
  if (!toolbar) return;

  const msgsBtn = toolbar.querySelector('#toolbar-btn-msgs');
  const storiesBtn = toolbar.querySelector('#toolbar-btn-stories');
  const path = window.location.pathname;

  if (msgsBtn) {
    if (path.startsWith('/direct')) {
      msgsBtn.classList.add('active');
    } else {
      msgsBtn.classList.remove('active');
    }
  }

  if (storiesBtn) {
    if (path.startsWith('/stories') || (path === '/' && !path.startsWith('/direct'))) {
      storiesBtn.classList.add('active');
    } else {
      storiesBtn.classList.remove('active');
    }
  }
}

// Remove Reels & Explore buttons from DOM
function purgeDistractionElements() {
  try {
    // 1. All links to reels or explore
    const badLinks = document.querySelectorAll('a[href*="/reels/"], a[href^="/reels"], a[href*="/explore/"], a[href^="/explore"]');
    badLinks.forEach((el) => {
      const container = el.closest('div[role="button"]') || el.parentElement;
      if (container && container.tagName !== 'BODY') {
        container.style.display = 'none';
      } else {
        el.style.display = 'none';
      }
    });

    // 2. All svg icons for Reels and Explore
    const badSvgs = document.querySelectorAll('svg[aria-label="Reels"], svg[aria-label="reels"], svg[aria-label="Explore"]');
    badSvgs.forEach((svg) => {
      const item = svg.closest('a') || svg.closest('div[role="button"]') || svg.parentElement;
      if (item) item.style.display = 'none';
    });

    // 3. Home page feed articles removal
    if (window.location.pathname === '/' || window.location.pathname === '') {
      const articles = document.querySelectorAll('main article, div[data-testid="feed-container"] article');
      articles.forEach((art) => {
        art.style.display = 'none';
      });
      injectFocusPlaceholder();
    }
  } catch (err) {
    // Ignore DOM query errors on dynamic renders
  }
}

// Inject focus mode card in place of infinite feed on Home
function injectFocusPlaceholder() {
  if (window.location.pathname !== '/' && window.location.pathname !== '') return;
  if (document.getElementById('focus-mode-feed-placeholder')) return;

  const main = document.querySelector('main');
  if (!main) return;

  const placeholder = document.createElement('div');
  placeholder.id = 'focus-mode-feed-placeholder';
  placeholder.innerHTML = `
    <div class="focus-icon">🛡️</div>
    <h2>Instagram Focus Mode Active</h2>
    <p>Reels, Explore, and infinite feeds are disabled to keep you focused. Watch your friends' <strong>Stories</strong> above or head to your <strong>Direct Messages</strong>.</p>
    <div class="focus-actions">
      <button id="btn-go-messages" class="focus-btn btn-primary">
        <span>💬</span> Open Direct Messages
      </button>
      <button id="btn-go-stories" class="focus-btn btn-secondary">
        <span>📸</span> Watch Stories
      </button>
    </div>
    <div class="focus-badge">
      <span>✓</span> Distraction Free • Only Stories & Messages Allowed
    </div>
  `;

  // Attach button events
  placeholder.querySelector('#btn-go-messages')?.addEventListener('click', () => {
    window.location.href = '/direct/inbox/';
  });

  placeholder.querySelector('#btn-go-stories')?.addEventListener('click', () => {
    const firstStory = document.querySelector('div[role="menu"] button, div[role="menu"] a, div[role="menu"] canvas, div[role="menu"] img');
    if (firstStory) {
      firstStory.click();
    } else {
      window.location.href = '/stories/';
    }
  });

  // Insert after the story carousel
  const storyTray = document.querySelector('div[role="menu"]') || document.querySelector('div[aria-label*="Stories"]');
  if (storyTray && storyTray.parentElement) {
    const parent = storyTray.parentElement.parentElement || storyTray.parentElement;
    parent.appendChild(placeholder);
  } else {
    main.appendChild(placeholder);
  }
}

// Intercept clicks on any link attempting to navigate to reels or explore
document.addEventListener('click', (e) => {
  const targetLink = e.target.closest('a');
  if (targetLink && targetLink.href) {
    const url = targetLink.href;
    if (url.includes('/reels/') || url.includes('/explore/')) {
      e.preventDefault();
      e.stopPropagation();
      showBlockedToast(url.includes('/reels/') ? 'Reels' : 'Explore');
      window.location.replace('/direct/inbox/');
    }
  }
}, true);

// Intercept HTML5 History API to prevent client-side routing to Reels/Explore
const originalPushState = history.pushState;
history.pushState = function (...args) {
  const url = args[2];
  if (url && (String(url).includes('/reels') || String(url).includes('/explore'))) {
    showBlockedToast('Distraction');
    return originalPushState.apply(this, [args[0], args[1], '/direct/inbox/']);
  }
  const result = originalPushState.apply(this, args);
  setTimeout(() => {
    updatePageClassification();
    purgeDistractionElements();
  }, 50);
  return result;
};

const originalReplaceState = history.replaceState;
history.replaceState = function (...args) {
  const url = args[2];
  if (url && (String(url).includes('/reels') || String(url).includes('/explore'))) {
    return originalReplaceState.apply(this, [args[0], args[1], '/direct/inbox/']);
  }
  const result = originalReplaceState.apply(this, args);
  setTimeout(() => {
    updatePageClassification();
    purgeDistractionElements();
  }, 50);
  return result;
};

window.addEventListener('popstate', () => {
  setTimeout(() => {
    updatePageClassification();
    purgeDistractionElements();
  }, 50);
});

// Continuously observe DOM changes to keep blocking active as Instagram dynamically renders
const observer = new MutationObserver(() => {
  purgeDistractionElements();
  injectTopToolbar();
});

window.addEventListener('DOMContentLoaded', () => {
  updatePageClassification();
  purgeDistractionElements();
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
});

window.addEventListener('load', () => {
  updatePageClassification();
  purgeDistractionElements();
});
