// Custom JavaScript to override Swagger UI inline styles - ULTIMATE VERSION
// This script ensures ALL elements get white background and dark text
(function() {
  'use strict';
  
  console.log('[Swagger Custom] Script loaded');
  
  // Inject dynamic style with maximum specificity
  function injectOverrideStyles() {
    const styleId = 'swagger-ui-custom-override';
    let existingStyle = document.getElementById(styleId);
    
    const styleContent = `
      /* Force override ALL inline styles - maximum specificity */
      .swagger-ui pre[style],
      .swagger-ui pre[style*="background"],
      .swagger-ui pre[style*="color"],
      .swagger-ui pre.microlight[style],
      .swagger-ui pre.example[style],
      .swagger-ui pre.example.microlight[style],
      .swagger-ui pre.body-param__example[style],
      .swagger-ui pre.body-param_example[style],
      .swagger-ui code[style],
      .swagger-ui code[style*="background"],
      .swagger-ui code[style*="color"],
      .swagger-ui .hljs[style],
      .swagger-ui .hljs[style*="background"],
      .swagger-ui .hljs[style*="color"],
      .swagger-ui pre span[style],
      .swagger-ui pre span[style*="color"],
      .swagger-ui code span[style],
      .swagger-ui code span[style*="color"],
      .swagger-ui .hljs span[style],
      .swagger-ui .hljs span[style*="color"],
      .swagger-ui .hljs-attr[style],
      .swagger-ui .hljs-attr[style*="color"],
      .swagger-ui .hljs-string[style],
      .swagger-ui .hljs-string[style*="color"],
      .swagger-ui .hljs-keyword[style],
      .swagger-ui .hljs-keyword[style*="color"],
      .swagger-ui .hljs-number[style],
      .swagger-ui .hljs-number[style*="color"],
      .swagger-ui .hljs-literal[style],
      .swagger-ui .hljs-literal[style*="color"],
      .swagger-ui .hljs-punctuation[style],
      .swagger-ui .hljs-punctuation[style*="color"],
      .swagger-ui .hljs-property[style],
      .swagger-ui .hljs-property[style*="color"],
      .swagger-ui .hljs-attribute[style],
      .swagger-ui .hljs-attribute[style*="color"],
      .swagger-ui .highlight-code[style],
      .swagger-ui .microlight[style],
      .swagger-ui .model-example[style],
      .swagger-ui .model-example pre[style],
      .swagger-ui .model-example code[style],
      .swagger-ui .model-example span[style] {
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      
      /* Specifically target all span elements inside code blocks */
      .swagger-ui pre span,
      .swagger-ui code span,
      .swagger-ui .hljs span,
      .swagger-ui .hljs-attr,
      .swagger-ui .hljs-string,
      .swagger-ui .hljs-keyword,
      .swagger-ui .hljs-number,
      .swagger-ui .hljs-literal,
      .swagger-ui .hljs-punctuation,
      .swagger-ui .hljs-property,
      .swagger-ui .hljs-attribute {
        color: #000000 !important;
        background: transparent !important;
        background-color: transparent !important;
      }
    `;
    
    if (existingStyle) {
      existingStyle.textContent = styleContent;
    } else {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = styleContent;
      document.head.appendChild(style);
      console.log('[Swagger Custom] Injected override styles');
    }
  }
  
  // Remove inline styles from ALL elements - AGGRESSIVE VERSION
  function overrideInlineStyles() {
    let changedCount = 0;
    
    // Target ALL pre elements including pre.example.microlight
    const preSelectors = [
      '.swagger-ui pre',
      '.swagger-ui pre.microlight',
      '.swagger-ui pre.example',
      '.swagger-ui pre.example.microlight',
      '.swagger-ui pre.body-param__example',
      '.swagger-ui pre.body-param_example'
    ];
    
    preSelectors.forEach(function(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(function(element) {
        const bg = element.style.getPropertyValue('background') || element.style.backgroundColor;
        const color = element.style.getPropertyValue('color');
        
        if (bg && (bg.includes('51, 51, 51') || bg.includes('rgb(51, 51, 51)') || bg.includes('#333'))) {
          element.style.setProperty('background', '#ffffff', 'important');
          element.style.setProperty('background-color', '#ffffff', 'important');
          changedCount++;
        }
        if (color && (color.includes('white') || color.includes('#fff') || color.includes('rgb(255'))) {
          element.style.setProperty('color', '#000000', 'important');
          changedCount++;
        }
        // Force set regardless
        element.style.setProperty('background', '#ffffff', 'important');
        element.style.setProperty('background-color', '#ffffff', 'important');
        element.style.setProperty('color', '#000000', 'important');
      });
    });
    
    // Target ALL code elements
    const codeElements = document.querySelectorAll('.swagger-ui code, .swagger-ui code.language-json');
    codeElements.forEach(function(element) {
      element.style.setProperty('background', '#ffffff', 'important');
      element.style.setProperty('background-color', '#ffffff', 'important');
      element.style.setProperty('color', '#000000', 'important');
      changedCount++;
    });
    
    // Target ALL span elements inside code blocks - CRITICAL
    const spanSelectors = [
      '.swagger-ui pre span',
      '.swagger-ui code span',
      '.swagger-ui .hljs span',
      '.swagger-ui .hljs-attr',
      '.swagger-ui .hljs-string',
      '.swagger-ui .hljs-keyword',
      '.swagger-ui .hljs-number',
      '.swagger-ui .hljs-literal',
      '.swagger-ui .hljs-punctuation',
      '.swagger-ui .hljs-property',
      '.swagger-ui .hljs-attribute'
    ];
    
    spanSelectors.forEach(function(selector) {
      const spanElements = document.querySelectorAll(selector);
      spanElements.forEach(function(element) {
        const color = element.style.getPropertyValue('color');
        if (color && (color.includes('162, 252, 162') || color.includes('rgb(162') || color.includes('#a2fc'))) {
          element.style.setProperty('color', '#000000', 'important');
          changedCount++;
        }
        // Force set regardless
        element.style.setProperty('color', '#000000', 'important');
        element.style.setProperty('background', 'transparent', 'important');
        element.style.setProperty('background-color', 'transparent', 'important');
      });
    });
    
    // Target hljs elements
    const hljsElements = document.querySelectorAll('.swagger-ui .hljs');
    hljsElements.forEach(function(element) {
      element.style.setProperty('background', '#ffffff', 'important');
      element.style.setProperty('background-color', '#ffffff', 'important');
      element.style.setProperty('color', '#000000', 'important');
      changedCount++;
    });
    
    // Target highlight-code containers
    const highlightElements = document.querySelectorAll('.swagger-ui .highlight-code, .swagger-ui .microlight, .swagger-ui .model-example');
    highlightElements.forEach(function(element) {
      element.style.setProperty('background', '#ffffff', 'important');
      element.style.setProperty('background-color', '#ffffff', 'important');
      element.style.setProperty('color', '#000000', 'important');
      changedCount++;
    });
    
    if (changedCount > 0) {
      console.log('[Swagger Custom] Overrode', changedCount, 'elements');
    }
  }
  
  // Wait for Swagger UI to be ready
  function waitForSwaggerUI(callback, maxAttempts) {
    maxAttempts = maxAttempts || 50;
    let attempts = 0;
    
    function check() {
      attempts++;
      const swaggerContainer = document.querySelector('#swagger-ui');
      const hasPreElements = swaggerContainer && swaggerContainer.querySelectorAll('pre').length > 0;
      
      if (hasPreElements || attempts >= maxAttempts) {
        callback();
      } else {
        setTimeout(check, 100);
      }
    }
    
    check();
  }
  
  // Initialize
  function init() {
    injectOverrideStyles();
    overrideInlineStyles();
    
    // Wait for Swagger UI to load
    waitForSwaggerUI(function() {
      console.log('[Swagger Custom] Swagger UI detected, applying overrides');
      injectOverrideStyles();
      overrideInlineStyles();
    });
  }
  
  // Run immediately
  init();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
  
  // Run after window load
  window.addEventListener('load', function() {
    setTimeout(init, 500);
  });
  
  // Run after delays to catch dynamically added elements
  setTimeout(init, 100);
  setTimeout(overrideInlineStyles, 500);
  setTimeout(overrideInlineStyles, 1000);
  setTimeout(overrideInlineStyles, 2000);
  setTimeout(overrideInlineStyles, 3000);
  setTimeout(overrideInlineStyles, 5000);
  
  // Continuous interval to catch any missed elements
  setInterval(overrideInlineStyles, 2000);
  
  // Use MutationObserver to watch for dynamically added elements
  const observer = new MutationObserver(function(mutations) {
    let shouldRun = false;
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0 || (mutation.type === 'attributes' && mutation.attributeName === 'style')) {
        shouldRun = true;
      }
    });
    if (shouldRun) {
      setTimeout(function() {
        injectOverrideStyles();
        overrideInlineStyles();
      }, 10);
    }
  });
  
  // Start observing
  function startObserving() {
    const swaggerContainer = document.querySelector('#swagger-ui');
    if (swaggerContainer) {
      observer.observe(swaggerContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
      console.log('[Swagger Custom] MutationObserver started');
    } else {
      setTimeout(startObserving, 500);
    }
  }
  
  startObserving();
  
  // Also observe the entire document for any style changes
  const documentObserver = new MutationObserver(function() {
    setTimeout(overrideInlineStyles, 10);
  });
  
  if (document.body) {
    documentObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });
  }
  
  console.log('[Swagger Custom] Initialization complete');
})();

