// Content script for Anti-Doomscroll Chrome Extension
// This script runs on all pages to provide enhanced blocking and user feedback

(function() {
    'use strict';
    
    // Track time spent on current page
    let startTime = Date.now();
    let isBlockedSite = false;
    let currentDomain = '';
    const APP_HOST = 'anti-doomscroll-app-git-master-raymond-yus-projects.vercel.app';
    
    // Initialize content script
    async function init() {
        currentDomain = window.location.hostname;
        isBlockedSite = await checkIfBlockedSite(currentDomain);
        
        if (isBlockedSite) {
            setupBlockedSiteUI();
            trackTimeSpent();
        }
        
        // Listen for page changes (SPA navigation)
        observePageChanges();

        // If we are on the Focus App, sync its local state to chrome.storage.sync
        if (currentDomain === APP_HOST) {
            await syncFromAppLocalStorage();
        }

        // Listen to messages to trigger a sync on demand
        chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
            if (req.action === 'syncFromApp') {
                syncFromAppLocalStorage().then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
                return true;
            }
        });
    }
    
    // Check if current site is blocked
    async function checkIfBlockedSite(domain) {
        try {
            const result = await chrome.storage.sync.get(['blockedSites']);
            const blockedSites = result.blockedSites || {};
            
            for (const [blockedDomain, config] of Object.entries(blockedSites)) {
                if (config.enabled && (domain === blockedDomain || domain.endsWith('.' + blockedDomain))) {
                    return await shouldBlockSite(blockedDomain);
                }
            }
            return false;
        } catch (error) {
            console.error('Error checking blocked site:', error);
            return false;
        }
    }
    
    // Read app's localStorage and persist to chrome.storage.sync
    async function syncFromAppLocalStorage() {
        try {
            const blockedPlatformsRaw = window.localStorage.getItem('blockedPlatforms');
            const countdownEndAt = window.localStorage.getItem('countdownEndAt');

            // Map app platforms -> domains
            let blockedSites = {};
            if (blockedPlatformsRaw) {
                const platforms = JSON.parse(blockedPlatformsRaw);
                blockedSites = {
                    'instagram.com': { enabled: !!platforms.instagram?.enabled, name: 'Instagram', icon: '■' },
                    'tiktok.com': { enabled: !!platforms.tiktok?.enabled, name: 'TikTok', icon: '●' },
                    'twitter.com': { enabled: !!platforms.twitter?.enabled, name: 'Twitter', icon: '▲' },
                    'youtube.com': { enabled: !!platforms.youtube?.enabled, name: 'YouTube', icon: '◆' }
                };
            }

            await chrome.storage.sync.set({
                blockedSites,
                countdownEndAt: countdownEndAt ? parseInt(countdownEndAt) : null,
                appUrl: `https://${APP_HOST}?_vercel_share=sTImB28WprFJvKFMfrhaz4mAdR8UNqUd`
            });
        } catch (e) {
            console.error('syncFromAppLocalStorage error', e);
        }
    }

    // Check if site should be blocked based on time limits
    async function shouldBlockSite(domain) {
        try {
            const result = await chrome.storage.sync.get(['blockedSites']);
            const config = result.blockedSites[domain];
            
            if (!config || !config.enabled) return false;
            
            // Get usage data
            const usageResult = await chrome.storage.local.get([`usage_${domain}`]);
            const usage = usageResult[`usage_${domain}`] || { daily: {} };
            
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
                const weeklyUsage = Object.entries(usage.daily)
                    .filter(([date]) => new Date(date) >= new Date(weekStart))
                    .reduce((sum, [, time]) => sum + time, 0);
                
                if (weeklyUsage >= config.weeklyLimit) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking time limits:', error);
            return false;
        }
    }
    
    // Set up UI for blocked sites
    function setupBlockedSiteUI() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'anti-doomscroll-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Create warning card
        const card = document.createElement('div');
        card.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            max-width: 500px;
            margin: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        `;
        
        card.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 20px;">🛡️</div>
            <h1 style="color: #333; margin-bottom: 15px; font-size: 1.8rem;">
                Site Blocked by Anti-Doomscroll
            </h1>
            <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">
                You've reached your time limit for <strong>${currentDomain}</strong>. 
                Take a break and focus on what matters!
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #495057; margin: 0; font-size: 0.9rem;">
                    💡 This site is being monitored to help you maintain healthy digital habits.
                </p>
            </div>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="go-to-app" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                ">Go to Focus App</button>
                <button id="open-settings" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                ">Settings</button>
            </div>
        `;
        
        overlay.appendChild(card);
        document.body.appendChild(overlay);
        
        // Add event listeners
        document.getElementById('go-to-app').addEventListener('click', () => {
            chrome.storage.sync.get(['appUrl']).then(result => {
                const appUrl = result.appUrl || 'https://anti-doomscroll-app.vercel.app/';
                window.location.href = `${appUrl}?blocked=${currentDomain}&original=${encodeURIComponent(window.location.href)}`;
            });
        });
        
        document.getElementById('open-settings').addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openOptions' });
        });
        
        // Prevent interaction with underlying page
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
    
    // Track time spent on page
    function trackTimeSpent() {
        // Track time when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                startTime = Date.now();
            } else if (document.visibilityState === 'hidden') {
                updateUsageData();
            }
        });
        
        // Track time when page is unloaded
        window.addEventListener('beforeunload', () => {
            updateUsageData();
        });
        
        // Track time every minute
        setInterval(updateUsageData, 60000);
    }
    
    // Update usage data
    async function updateUsageData() {
        if (!isBlockedSite) return;
        
        const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // minutes
        if (timeSpent > 0) {
            try {
                await chrome.runtime.sendMessage({
                    action: 'updateUsage',
                    domain: currentDomain,
                    timeSpent: timeSpent
                });
                startTime = Date.now(); // Reset timer
            } catch (error) {
                console.error('Error updating usage data:', error);
            }
        }
    }
    
    // Observe page changes for SPAs
    function observePageChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Check if URL changed (for SPAs)
                    const newDomain = window.location.hostname;
                    if (newDomain !== currentDomain) {
                        currentDomain = newDomain;
                        checkIfBlockedSite(currentDomain).then(blocked => {
                            if (blocked !== isBlockedSite) {
                                isBlockedSite = blocked;
                                if (blocked) {
                                    setupBlockedSiteUI();
                                    trackTimeSpent();
                                } else {
                                    removeBlockedSiteUI();
                                }
                            }
                        });
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Remove blocked site UI
    function removeBlockedSiteUI() {
        const overlay = document.getElementById('anti-doomscroll-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    // Add warning banner for non-blocked but monitored sites
    function addWarningBanner() {
        if (isBlockedSite) return;
        
        const banner = document.createElement('div');
        banner.id = 'anti-doomscroll-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 20px;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            z-index: 999998;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        
        banner.innerHTML = `
            <span>🛡️ This site is monitored by Anti-Doomscroll</span>
            <button id="close-banner" style="
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 15px;
                padding: 0;
            ">×</button>
        `;
        
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Add close functionality
        document.getElementById('close-banner').addEventListener('click', () => {
            banner.remove();
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (banner.parentNode) {
                banner.remove();
            }
        }, 5000);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Add warning banner for monitored sites
    setTimeout(addWarningBanner, 1000);
    
})();

