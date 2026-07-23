importScripts('config.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarizePage') {
    summarizePage(request.text).then(result => {
      sendResponse({ summary: result.summary, durationMs: result.durationMs });
    }).catch(error => {
      console.error("Error summarizing page:", error);
      sendResponse({ error: error.message || 'Failed to summarize page' });
    });
    return true; // Keep the message channel open for asynchronous response
  }
});

async function summarizePage(text) {
  const apiKey = globalThis.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    throw new Error('API key is not configured. Please set GEMINI_API_KEY in config.js');
  }

  const model = 'gemini-3.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const startTime = Date.now();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `Summarize the following text from a web page:\n\n${text}` }]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const endTime = Date.now();
  const durationMs = endTime - startTime;

  try {
    const summary = data.candidates[0].content.parts[0].text;
    return { summary: summary.trim(), durationMs: durationMs };
  } catch (e) {
    console.error("Failed to parse response:", data);
    throw new Error('Failed to parse response from Gemini API');
  }
}
