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
    await loadSettings();
    showNotification('Settings refreshed', 'success');
  });
}

// Load settings from Vercel app and sync with extension
async function loadSettings() {
  try {
    loading.style.display = 'block';
    sitesList.innerHTML = '';
    
    // Get current extension settings
    const result = await chrome.storage.sync.get(['blockedSites', 'appUrl']);
    let blockedSites = result.blockedSites || {};
    
    // Try to fetch settings from Vercel app
    try {
      const response = await fetch('https://anti-doomscroll-app-git-master-raymond-yus-projects.vercel.app?_vercel_share=sTImB28WprFJvKFMfrhaz4mAdR8UNqUd');
      if (response.ok) {
        // Since we can't directly access localStorage from the app, we'll use the extension's storage
        // and update it based on the current state
        await syncWithAppSettings();
      }
    } catch (error) {
      console.log('Could not fetch from app, using local settings');
    }
    
    // Render the sites list
    renderSitesList(blockedSites);
    
    // Update countdown timer
    updateCountdownTimer();
    
    loading.style.display = 'none';
    
  } catch (error) {
    console.error('Error loading settings:', error);
    loading.style.display = 'none';
    showNotification('Error loading settings', 'error');
  }
}

// Sync extension settings with app settings
async function syncWithAppSettings() {
  // For now, we'll use a default configuration that matches the app
  // In a real implementation, you'd want to use a shared API or storage
  const defaultSettings = {
    'instagram.com': { enabled: true, icon: '■', name: 'Instagram' },
    'tiktok.com': { enabled: true, icon: '●', name: 'TikTok' },
    'twitter.com': { enabled: true, icon: '▲', name: 'Twitter' },
    'youtube.com': { enabled: true, icon: '◆', name: 'YouTube' }
  };
  
  await chrome.storage.sync.set({ 
    blockedSites: defaultSettings,
    appUrl: 'https://anti-doomscroll-app-git-master-raymond-yus-projects.vercel.app?_vercel_share=sTImB28WprFJvKFMfrhaz4mAdR8UNqUd'
  });
}

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
  // Check if there's an active countdown
  // Since we can't directly access the app's localStorage, we'll simulate this
  // In a real implementation, you'd want to use a shared API
  const hasActiveCountdown = Math.random() > 0.5; // Simulate random state for demo
  
  if (hasActiveCountdown) {
    countdownTimer.style.display = 'block';
    // Simulate countdown - in real implementation, get from app
    const minutes = Math.floor(Math.random() * 10) + 1;
    const seconds = Math.floor(Math.random() * 60);
    countdownDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    countdownTimer.style.display = 'none';
  }
}

// Start countdown timer
function startCountdownTimer() {
  // Update every second
  setInterval(() => {
    if (countdownTimer.style.display !== 'none') {
      updateCountdownTimer();
    }
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