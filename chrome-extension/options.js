// Options page JavaScript for Anti-Doomscroll Chrome Extension

// Default configuration
const DEFAULT_SITES = {
  'instagram.com': { enabled: true, dailyLimit: 60, weeklyLimit: 300, icon: '📷' },
  'tiktok.com': { enabled: true, dailyLimit: 30, weeklyLimit: 150, icon: '🎵' },
  'twitter.com': { enabled: true, dailyLimit: 45, weeklyLimit: 200, icon: '🐦' },
  'x.com': { enabled: true, dailyLimit: 45, weeklyLimit: 200, icon: '🐦' },
  'youtube.com': { enabled: true, dailyLimit: 90, weeklyLimit: 400, icon: '📺' },
  'facebook.com': { enabled: true, dailyLimit: 30, weeklyLimit: 150, icon: '👥' },
  'reddit.com': { enabled: true, dailyLimit: 60, weeklyLimit: 300, icon: '🔴' }
};

// DOM elements
let sitesList, saveBtn, resetBtn;

// Initialize the options page
document.addEventListener('DOMContentLoaded', async () => {
  sitesList = document.getElementById('sitesList');
  saveBtn = document.getElementById('saveSettings');
  resetBtn = document.getElementById('resetSettings');

  // Load current settings
  await loadSettings();
  
  // Set up event listeners
  setupEventListeners();
});

// Load current settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['blockedSites']);
    const blockedSites = result.blockedSites || DEFAULT_SITES;
    
    renderSitesList(blockedSites);
  } catch (error) {
    console.error('Error loading settings:', error);
    showNotification('Error loading settings', 'error');
  }
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
        <div class="site-name">${domain}</div>
      </div>
    </div>
    <div class="site-status ${config.enabled ? 'blocked' : 'allowed'}">
      ${config.enabled ? 'BLOCKED' : 'ALLOWED'}
    </div>
    <div class="toggle ${config.enabled ? 'active' : ''}" data-domain="${domain}">
      <div class="toggle-slider"></div>
    </div>
    <div class="countdown-display">
      Configure on App
    </div>
  `;
  
  return div;
}

// Get site color based on domain
function getSiteColor(domain) {
  const colors = {
    'instagram.com': '#E4405F',
    'tiktok.com': '#000000',
    'twitter.com': '#1DA1F2',
    'x.com': '#1DA1F2',
    'youtube.com': '#FF0000',
    'facebook.com': '#1877F2',
    'reddit.com': '#FF4500'
  };
  return colors[domain] || '#667eea';
}

// Set up event listeners
function setupEventListeners() {
  // Toggle switches
  sitesList.addEventListener('click', (e) => {
    if (e.target.closest('.toggle')) {
      const toggle = e.target.closest('.toggle');
      const domain = toggle.dataset.domain;
      toggle.classList.toggle('active');
      
      // Update the status text
      const statusElement = toggle.closest('.site-config').querySelector('.site-status');
      const isActive = toggle.classList.contains('active');
      statusElement.textContent = isActive ? 'BLOCKED' : 'ALLOWED';
      statusElement.className = `site-status ${isActive ? 'blocked' : 'allowed'}`;
    }
  });
  
  // Save button
  saveBtn.addEventListener('click', saveSettings);
  
  // Reset button
  resetBtn.addEventListener('click', resetSettings);
}

// Save settings to storage
async function saveSettings() {
  try {
    const blockedSites = {};
    const siteElements = sitesList.querySelectorAll('.site-config');
    
    siteElements.forEach(element => {
      const domain = element.querySelector('.toggle').dataset.domain;
      const toggle = element.querySelector('.toggle');
      
      blockedSites[domain] = {
        enabled: toggle.classList.contains('active'),
        dailyLimit: DEFAULT_SITES[domain]?.dailyLimit || 0,
        weeklyLimit: DEFAULT_SITES[domain]?.weeklyLimit || 0,
        icon: DEFAULT_SITES[domain]?.icon || '🌐'
      };
    });
    
    await chrome.storage.sync.set({
      blockedSites: blockedSites,
      appUrl: 'https://anti-doomscroll-app.vercel.app/'
    });
    
    showNotification('Settings saved successfully!', 'success');
    
    // Notify background script to update rules
    chrome.runtime.sendMessage({ action: 'updateRules' });
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Error saving settings', 'error');
  }
}

// Reset settings to defaults
async function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    try {
      await chrome.storage.sync.set({
        blockedSites: DEFAULT_SITES,
        appUrl: 'https://anti-doomscroll-app.vercel.app/'
      });
      
      await loadSettings();
      showNotification('Settings reset to defaults', 'success');
      
    } catch (error) {
      console.error('Error resetting settings:', error);
      showNotification('Error resetting settings', 'error');
    }
  }
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
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
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
  if (namespace === 'local') {
    loadUsageStats();
  }
});
