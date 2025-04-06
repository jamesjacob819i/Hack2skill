/**
 * Helper function to stream content from the Gemini API
 * @param {Object} options - Configuration for the API call
 * @returns {AsyncGenerator} - A stream of text chunks
 */
export async function* streamGemini(options) {
  try {
    // Use the full URL to ensure we're connecting to the correct endpoint
    const response = await fetch('http://127.0.0.1:5000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n\n');
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.text) {
              yield data.text;
            }
          } catch (e) {
            console.warn('Failed to parse JSON from stream:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in streamGemini:', error);
    
    // If there's an error communicating with the server, yield a fallback message
    yield 'Unable to connect to the storytelling service. Please check if the server is running.';
    
    throw error;
  }
}