// Polyfill for chrome.runtime.getURL (SOTA for Firefox)
const getURL = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
  ? chrome.runtime.getURL
  : (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL)
    ? browser.runtime.getURL
    : (file => file);

const script = document.createElement("script");
script.src = getURL("script.js");
document.head.appendChild(script);