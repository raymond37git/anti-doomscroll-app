// Background service worker for Anti-Doomscroll Chrome Extension

// Default blocked sites configuration
const DEFAULT_BLOCKED_SITES = {
  'instagram.com': { enabled: true, icon: '■', name: 'Instagram' },
  'tiktok.com': { enabled: true, icon: '●', name: 'TikTok' },
  'twitter.com': { enabled: true, icon: '▲', name: 'Twitter' },
  'youtube.com': { enabled: true, icon: '◆', name: 'YouTube' }
};

// Initialize extension with default settings
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Anti-Doomscroll extension installed');
  
  // Set default configuration
  const result = await chrome.storage.sync.get(['blockedSites', 'appUrl']);
  
  if (!result.blockedSites) {
    await chrome.storage.sync.set({ blockedSites: DEFAULT_BLOCKED_SITES });
  }
  
  if (!result.appUrl) {
    await chrome.storage.sync.set({ appUrl: 'https://anti-doomscroll-app-git-master-raymond-yus-projects.vercel.app?_vercel_share=sTImB28WprFJvKFMfrhaz4mAdR8UNqUd' });
  }
  
  // Set up initial rules
  await updateBlockingRules();
});

// Handle tab updates and redirect blocked sites
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    const blockedSites = await getBlockedSites();
    const appUrl = await getAppUrl();
    
    for (const [domain, config] of Object.entries(blockedSites)) {
      if (config.enabled && isBlockedSite(tab.url, domain)) {
        const redirectUrl = `${appUrl}?blocked=${domain}&original=${encodeURIComponent(tab.url)}`;
        
        try {
          await chrome.tabs.update(tabId, { url: redirectUrl });
          console.log(`Redirected ${tab.url} to ${redirectUrl}`);
          break;
        } catch (error) {
          console.error('Error redirecting tab:', error);
        }
      }
    }
  }
});

// Helper function to check if URL matches blocked site
function isBlockedSite(url, domain) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain);
  } catch {
    return false;
  }
}

// Get blocked sites configuration
async function getBlockedSites() {
  const result = await chrome.storage.sync.get(['blockedSites']);
  return result.blockedSites || DEFAULT_BLOCKED_SITES;
}

// Get app URL
async function getAppUrl() {
  const result = await chrome.storage.sync.get(['appUrl']);
  return result.appUrl || 'https://anti-doomscroll-app-git-master-raymond-yus-projects.vercel.app?_vercel_share=sTImB28WprFJvKFMfrhaz4mAdR8UNqUd';
}

// Update blocking rules for declarative net request
async function updateBlockingRules() {
  const blockedSites = await getBlockedSites();
  const appUrl = await getAppUrl();
  const rules = [];
  
  let ruleId = 1;
  for (const [domain, config] of Object.entries(blockedSites)) {
    if (config.enabled) {
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            regexSubstitution: `${appUrl}?blocked=${domain}&original=\\0`
          }
        },
        condition: {
          regexFilter: `https?://(www\\.)?${domain.replace('.', '\\.')}/.*`,
          resourceTypes: ["main_frame"]
        }
      });
    }
  }
  
  // Update rules
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: Array.from({length: ruleId}, (_, i) => i + 1),
      addRules: rules
    });
    console.log(`Updated ${rules.length} blocking rules`);
  } catch (error) {
    console.error('Error updating blocking rules:', error);
  }
}

// Listen for configuration changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockedSites) {
    updateBlockingRules();
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateRules') {
    updateBlockingRules();
    sendResponse({ success: true });
  }
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isBlockedSite,
    getBlockedSites,
    getAppUrl
  };
}