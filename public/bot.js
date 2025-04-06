// Ensure DOM is fully loaded before accessing elements
document.addEventListener("DOMContentLoaded", function () {
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-btn");
    const chatOutput = document.getElementById("chat-output");
    const topicButtons = document.querySelectorAll(".topic-btn");
  
    if (!userInput || !sendButton || !chatOutput) {
      console.error("❗️ Error: Required elements not found in DOM.");
      return;
    }
  
    // Handle topic button clicks
    topicButtons.forEach(button => {
      button.addEventListener("click", function() {
        const topic = this.dataset.topic;
        let promptText = "";
        
        switch(topic) {
          case "career":
            promptText = "I need very brief career guidance and professional development advice.";
            break;
          case "mental-health":
            promptText = "I need very brief support with my mental health.";
            break;
          case "abuse":
            promptText = "I need help with reporting abuse or harassment.";
            break;
        }
        
        userInput.value = promptText;
        sendMessage();
      });
    });
  
    // Send message when button is clicked
    sendButton.addEventListener("click", sendMessage);
  
    // Allow sending with 'Enter' key
    userInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  
    function sendMessage() {
      const message = userInput.value.trim();
      if (message === "") return;
  
      // Add user's message to chat
      addMessage("user", message);
      userInput.value = "";
      userInput.focus();
  
      // Disable input while waiting for response
      setInputState(false);
  
      // Add retry logic
      const maxRetries = 3;
      let attempts = 0;
  
      function attemptSend() {
          attempts++;
          fetch("http://127.0.0.1:5000/chat", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ message: message }),
          })
          .then((response) => {
              if (!response.ok) {
                  if (response.status === 404) {
                      console.warn("Chat endpoint not found. Check if the Flask server is running.");
                      throw new Error('Flask server not running or endpoint not found');
                  } else {
                      throw new Error('Network response was not ok: ' + response.status);
                  }
              }
              return response.json();
          })
          .then((data) => {
              if (data.response) {
                  addMessage("bot", data.response);
              } else {
                  throw new Error('Invalid response format');
              }
          })
          .catch((error) => {
              console.error(`Attempt ${attempts} failed:`, error);
              if (attempts < maxRetries) {
                  addMessage("bot", `⚠️ Retrying... (attempt ${attempts}/${maxRetries})`);
                  setTimeout(attemptSend, 1000 * attempts); // Exponential backoff
              } else {
                  addMessage("bot", generateFallbackResponse(message));
              }
          })
          .finally(() => {
              // Always re-enable input after response
              setInputState(true);
          });
      }
  
      attemptSend();
    }
  
    function addMessage(sender, message) {
      const messageDiv = document.createElement("div");
      messageDiv.className = sender === "user" ? "user-message" : "bot-message";
      messageDiv.innerHTML = message;
      chatOutput.appendChild(messageDiv);
      chatOutput.scrollTop = chatOutput.scrollHeight;
    }
  
    function setInputState(enabled) {
      userInput.disabled = !enabled;
      sendButton.disabled = !enabled;
      topicButtons.forEach(btn => btn.disabled = !enabled);
    }
    
    function generateFallbackResponse(userInput) {
        // Fallback responses based on categories if the API fails
        const userInputLower = userInput.toLowerCase();
        
        // Career-related keywords
        if (userInputLower.includes("career") || userInputLower.includes("job") || 
            userInputLower.includes("work") || userInputLower.includes("resume") || 
            userInputLower.includes("interview")) {
            return "Building a successful career takes time and persistence. Consider exploring your strengths, networking with professionals in your field, and continuing to develop relevant skills. Remember that your career path is unique to you, and it's okay to take steps at your own pace.";
        } 
        // Mental health-related keywords
        else if (userInputLower.includes("stress") || userInputLower.includes("anxiety") || 
                 userInputLower.includes("depression") || userInputLower.includes("mental health") || 
                 userInputLower.includes("therapy")) {
            return "Your mental well-being is important. Consider practices like mindfulness, establishing healthy boundaries, and seeking support when needed. Remember that taking care of yourself isn't selfish—it's necessary. If you're struggling, please consider reaching out to a mental health professional.";
        }
        // Abuse-related keywords
        else if (userInputLower.includes("abuse") || userInputLower.includes("harassment") || 
                 userInputLower.includes("violence") || userInputLower.includes("assault") || 
                 userInputLower.includes("safety")) {
            return "Your safety is the priority. If you're in immediate danger, please contact emergency services. Organizations like the National Domestic Violence Hotline (1-800-799-7233) can provide confidential support. Remember that abuse is never your fault, and help is available.";
        }
        else if (userInputLower.includes("hello") || userInputLower.includes("hi") || 
                 userInputLower.includes("hey")) {
            return "Hello! I'm your Well Wisher for Women. How can I assist you today? I can provide guidance on career development, mental health resources, or safety information.";
        }
        else {
            return "Thank you for reaching out. As your well-wisher, I'm here to support you. Every woman deserves respect, opportunity, and well-being. What specific area would you like guidance on today? I can help with career development, mental health resources, or safety information.";
        }
    }
});