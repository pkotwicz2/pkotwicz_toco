(function() {
  // We want to run this as soon as the body is available.
  // Content scripts by default run at "document_idle", which is after DOM is complete.
  // So body should be available.

  const pageText = document.body ? document.body.innerText : "";

  if (pageText) {
    chrome.runtime.sendMessage({ action: 'summarizePage', text: pageText }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error communicating with background script:", chrome.runtime.lastError);
        return;
      }

      if (response && response.error) {
        console.warn("Could not get summary:", response.error);
        injectMessage(`Error fetching summary: ${response.error}`);
        return;
      }

      if (response && response.summary) {
        injectSummary(response.summary, response.durationMs);
      }
    });
  } else {
    console.warn("No text found on page to summarize.");
  }

  function injectSummary(summaryText, durationMs) {
    const container = document.createElement('div');
    container.className = 'gemini-summary-container';
    container.style.marginBottom = '20px';

    if (durationMs !== undefined) {
      const info = document.createElement('div');
      const durationSeconds = (durationMs / 1000).toFixed(2);
      info.textContent = `Gemini summary (took ${durationSeconds}s):`;
      info.style.fontSize = '0.8em';
      info.style.color = '#666';
      info.style.marginBottom = '5px';
      container.appendChild(info);
    }

    const blockquote = document.createElement('blockquote');
    blockquote.textContent = summaryText;
    blockquote.style.borderLeft = '5px solid #ccc';
    blockquote.style.margin = '0';
    blockquote.style.padding = '0.5em 10px';
    blockquote.style.background = '#f9f9f9';
    blockquote.className = 'gemini-injected-summary';
    container.appendChild(blockquote);

    // Insert at the start of the document body
    if (document.body) {
      document.body.insertBefore(container, document.body.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.insertBefore(container, document.body.firstChild);
      });
    }
  }

  function injectMessage(messageText) {
    const div = document.createElement('div');
    div.textContent = messageText;
    div.style.padding = '10px';
    div.style.background = '#ffebee';
    div.style.color = '#c62828';
    div.style.border = '1px solid #ef9a9a';
    div.style.marginBottom = '20px';
    div.style.fontWeight = 'bold';

    if (document.body) {
        document.body.insertBefore(div, document.body.firstChild);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.insertBefore(div, document.body.firstChild);
        });
    }
  }
})();
