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
            promptText = "I need career guidance and professional development advice.";
            break;
          case "mental-health":
            promptText = "I need support with my mental health.";
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
          fetch("/chat", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ message: message }),
          })
          .then((response) => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
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
                  addMessage("bot", "⚠️ Sorry, something went wrong. Please try asking about career guidance, mental health, or abuse reporting.");
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
  
  });
  