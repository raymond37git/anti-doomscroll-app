// Options page JavaScript for Anti-Doomscroll Chrome Extension

// Platform configuration mapping
const PLATFORM_MAPPING = {
  'instagram': { domain: 'instagram.com', icon: '■', name: 'Instagram' },
  'tiktok': { domain: 'tiktok.com', icon: '●', name: 'TikTok' },
  'twitter': { domain: 'twitter.com', icon: '▲', name: 'Twitter' },
  'youtube': { domain: 'youtube.com', icon: '◆', name: 'YouTube' }
};

// DOM elements
let sitesList, loading, countdownTimer, countdownDisplay, countdownStatus;
let openAppBtn, refreshBtn;

// Initialize the options page
document.addEventListener('DOMContentLoaded', async () => {
  sitesList = document.getElementById('sitesList');
  loading = document.getElementById('loading');
  countdownTimer = document.getElementById('countdownTimer');
  countdownDisplay = document.getElementById('countdownDisplay');
  countdownStatus = document.getElementById('countdownStatus');
  openAppBtn = document.getElementById('openApp');
  refreshBtn = document.getElementById('refreshSettings');

  // Set up event listeners
  setupEventListeners();
  
  // Load current settings
  await loadSettings();
  
  // Start countdown timer if active
  startCountdownTimer();
});

// Set up event listeners
function setupEventListeners() {
  // Open app button
  openAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://anti-doomscroll-app-git-master-raymond-yus-projects.vercel.app?_vercel_share=sTImB28WprFJvKFMfrhaz4mAdR8UNqUd' });
  });
  
  // Refresh button
  refreshBtn.addEventListener('click', async () => {
    // Ask content script (on app tab) to sync latest app state to extension storage
    try {
      await chrome.tabs.query({}, async (tabs) => {
        const appTab = tabs.find(t => t.url && t.url.includes('anti-doomscroll-app-git-master-raymond-yus-projects.vercel.app'));
        if (appTab?.id) {
          await chrome.tabs.sendMessage(appTab.id, { action: 'syncFromApp' });
        }
      });
    } catch {}

    await loadSettings();
    showNotification('Settings refreshed', 'success');
  });
}

// Load settings from Vercel app and sync with extension
async function loadSettings() {
  try {
    loading.style.display = 'block';
    sitesList.innerHTML = '';

    const result = await chrome.storage.sync.get(['blockedSites', 'countdownEndAt']);
    const blockedSites = result.blockedSites || {};

    renderSitesList(blockedSites);
    updateCountdownTimer();
    loading.style.display = 'none';

  } catch (error) {
    console.error('Error loading settings:', error);
    loading.style.display = 'none';
    showNotification('Error loading settings', 'error');
  }
}

// (Removed direct defaulting; now values come from storage via content-script sync)

// Render the sites list
function renderSitesList(sites) {
  sitesList.innerHTML = '';
  
  Object.entries(sites).forEach(([domain, config]) => {
    const siteElement = createSiteElement(domain, config);
    sitesList.appendChild(siteElement);
  });
}

// Create a site configuration element
function createSiteElement(domain, config) {
  const div = document.createElement('div');
  div.className = 'site-config';
  div.innerHTML = `
    <div class="site-info">
      <div class="site-icon">
        ${config.icon || '🌐'}
      </div>
      <div>
        <div class="site-name">${config.name || domain}</div>
      </div>
    </div>
    <div class="site-status ${config.enabled ? 'blocked' : 'allowed'}">
      ${config.enabled ? 'BLOCKED' : 'ALLOWED'}
    </div>
  `;
  
  return div;
}

// Update countdown timer display
function updateCountdownTimer() {
  chrome.storage.sync.get(['countdownEndAt']).then(({ countdownEndAt }) => {
    if (countdownEndAt && countdownEndAt > Date.now()) {
      countdownTimer.style.display = 'block';
      const remaining = Math.max(0, Math.ceil((countdownEndAt - Date.now()) / 1000));
      countdownDisplay.textContent = formatTime(remaining);
      countdownStatus.textContent = 'Focus Session Active';
    } else {
      countdownTimer.style.display = 'block';
      countdownDisplay.textContent = '— — : — —';
      countdownStatus.textContent = 'No Countdown Currently Running';
    }
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Start countdown timer
function startCountdownTimer() {
  // Update every second
  setInterval(() => {
    updateCountdownTimer();
  }, 1000);
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    transition: all 0.3s ease;
    background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#2563eb'};
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockedSites) {
    loadSettings();
  }
});