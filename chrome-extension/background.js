// Background service worker for Anti-Doomscroll Chrome Extension

// Default blocked sites configuration
const DEFAULT_BLOCKED_SITES = {
  'instagram.com': { enabled: true, dailyLimit: 60, weeklyLimit: 300 },
  'tiktok.com': { enabled: true, dailyLimit: 30, weeklyLimit: 150 },
  'twitter.com': { enabled: true, dailyLimit: 45, weeklyLimit: 200 },
  'x.com': { enabled: true, dailyLimit: 45, weeklyLimit: 200 },
  'youtube.com': { enabled: true, dailyLimit: 90, weeklyLimit: 400 },
  'facebook.com': { enabled: true, dailyLimit: 30, weeklyLimit: 150 },
  'reddit.com': { enabled: true, dailyLimit: 60, weeklyLimit: 300 }
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
    await chrome.storage.sync.set({ appUrl: 'http://localhost:8080/' });
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
        if (await shouldBlockSite(domain)) {
          const redirectUrl = `${appUrl}?blocked=${domain}&original=${encodeURIComponent(tab.url)}`;
          
          try {
            await chrome.tabs.update(tabId, { url: redirectUrl });
            console.log(`Redirected ${tab.url} to ${redirectUrl}`);
          } catch (error) {
            console.error('Error redirecting tab:', error);
          }
          break;
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

// Helper function to check if site should be blocked based on time limits
async function shouldBlockSite(domain) {
  const blockedSites = await getBlockedSites();
  const config = blockedSites[domain];
  
  if (!config || !config.enabled) return false;
  
  // Get usage data
  const usage = await getUsageData(domain);
  const now = new Date();
  const today = now.toDateString();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toDateString();
  
  // Check daily limit
  if (config.dailyLimit > 0) {
    const dailyUsage = usage.daily[today] || 0;
    if (dailyUsage >= config.dailyLimit) {
      return true;
    }
  }
  
  // Check weekly limit
  if (config.weeklyLimit > 0) {
    const weeklyUsage = Object.values(usage.daily)
      .filter((_, index) => {
        const date = new Date(Object.keys(usage.daily)[index]);
        return date >= new Date(weekStart);
      })
      .reduce((sum, time) => sum + time, 0);
    
    if (weeklyUsage >= config.weeklyLimit) {
      return true;
    }
  }
  
  return false;
}

// Get blocked sites configuration
async function getBlockedSites() {
  const result = await chrome.storage.sync.get(['blockedSites']);
  return result.blockedSites || DEFAULT_BLOCKED_SITES;
}

// Get app URL
async function getAppUrl() {
  const result = await chrome.storage.sync.get(['appUrl']);
  return result.appUrl || 'http://localhost:8080/';
}

// Get usage data for a domain
async function getUsageData(domain) {
  const result = await chrome.storage.local.get([`usage_${domain}`]);
  return result[`usage_${domain}`] || { daily: {} };
}

// Update usage data when site is accessed
async function updateUsageData(domain, timeSpent) {
  const usage = await getUsageData(domain);
  const today = new Date().toDateString();
  
  usage.daily[today] = (usage.daily[today] || 0) + timeSpent;
  
  await chrome.storage.local.set({ [`usage_${domain}`]: usage });
}

// Update blocking rules for declarative net request
async function updateBlockingRules() {
  const blockedSites = await getBlockedSites();
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
            regexSubstitution: "http://localhost:8080/?blocked=" + domain + "&original=\\0"
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
  if (request.action === 'updateUsage') {
    updateUsageData(request.domain, request.timeSpent);
    sendResponse({ success: true });
  }
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isBlockedSite,
    shouldBlockSite,
    getBlockedSites,
    getAppUrl
  };
}
