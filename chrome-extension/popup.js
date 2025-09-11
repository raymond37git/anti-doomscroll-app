// Popup JavaScript for Anti-Doomscroll Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        // Load popup data
        await loadPopupData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Show content
        loading.style.display = 'none';
        content.style.display = 'block';
        
    } catch (err) {
        console.error('Error loading popup:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
        errorMessage.textContent = err.message;
    }
});

// Load data for popup
async function loadPopupData() {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab?.url || '';
  const currentDomain = new URL(currentUrl).hostname;
  
  // Get settings
  const settings = await chrome.storage.sync.get(['blockedSites', 'appUrl']);
  const blockedSites = settings.blockedSites || {};
  const appUrl = settings.appUrl || 'https://anti-doomscroll-8kpg3rdel-raymond-yus-projects.vercel.app/setup';
  
  // Update UI
  updateCurrentSiteInfo(currentDomain, blockedSites);
  updateAppUrl(appUrl);
}

// Update current site information
function updateCurrentSiteInfo(domain, blockedSites) {
    const currentSiteInfo = document.getElementById('currentSiteInfo');
    const siteIcon = document.getElementById('siteIcon');
    const siteName = document.getElementById('siteName');
    const siteStatus = document.getElementById('siteStatus');
    
    // Check if current site is monitored
    let isMonitored = false;
    let siteConfig = null;
    
    for (const [blockedDomain, config] of Object.entries(blockedSites)) {
        if (domain === blockedDomain || domain.endsWith('.' + blockedDomain)) {
            isMonitored = true;
            siteConfig = config;
            break;
        }
    }
    
    if (isMonitored) {
        currentSiteInfo.style.display = 'block';
        siteIcon.textContent = siteConfig?.icon || '🌐';
        siteName.textContent = domain;
        
        if (siteConfig?.enabled) {
            siteStatus.textContent = 'BLOCKED';
            siteStatus.className = 'site-status blocked';
        } else {
            siteStatus.textContent = 'ALLOWED';
            siteStatus.className = 'site-status allowed';
        }
    } else {
        currentSiteInfo.style.display = 'none';
    }
}

// Update app URL
function updateAppUrl(appUrl) {
    const openAppBtn = document.getElementById('openApp');
    openAppBtn.href = appUrl;
}

// Set up event listeners
function setupEventListeners() {
  // Open app button
  document.getElementById('openApp').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://anti-doomscroll-8kpg3rdel-raymond-yus-projects.vercel.app/setup' });
  });
  
  // Open settings
  document.getElementById('openSettings').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 10px 15px;
        border-radius: 4px;
        color: white;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#2563eb'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}