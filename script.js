const sanitizeString = (str) => {
    return str.replace(/\\/g, '\\\\')   
              .replace(/'/g, "\\'")     
              .replace(/"/g, '\\"')     
              .replace(/\n/g, '\\n')    
              .replace(/\r/g, '\\r');   
};


const updateCharacterCount = () => {
    const userInput = document.getElementById('user-input').value.trim();
    const charCount = userInput.length;
    document.getElementById('char-count').textContent = `${charCount}/256`;

    if (charCount > 256) {
        document.getElementById('char-count').style.color = 'red';
    } else {
        document.getElementById('char-count').style.color = '#555';
    }
};

// Send to API
const sendMessage = async () => {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput === "") {
        return;
    }    
    const sanitizedUserInput = sanitizeString(userInput);

    const systemPrompt = "You are a friendly chatbot. Please respond naturally to user questions or conversations, and avoid focusing on technical explanations unless requested.";
    const combinedMessage = `${systemPrompt} ${sanitizedUserInput}`;
    if (combinedMessage.length > 256) {
        document.getElementById('error-message').style.display = 'block'; 
        return; 
    }

    document.getElementById('error-message').style.display = 'none';

    try {
        const response = await fetch('/api/chat', { // Sending request to the server-side API route
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userInput: sanitizedUserInput })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error response from API:", data);
            alert("Error: " + (data.message || "Something went wrong"));
            return;
        }

        const aiResponse = data.aiResponse;

        const chatBox = document.getElementById("chat-box");
        const userMessage = `<div class="message"><strong>User:</strong> ${userInput}</div>`;
        chatBox.innerHTML += userMessage;

        const aiMessage = `<div class="message"><strong>AI:</strong> <span class="typing-animation">...</span></div>`;
        chatBox.innerHTML += aiMessage;
        
        setTimeout(() => {
            const aiMessageElement = chatBox.lastElementChild;
            aiMessageElement.innerHTML = `<strong>AI:</strong> ${aiResponse}`;
            aiMessageElement.classList.add("message"); 
        }, 1500);

        document.getElementById('user-input').value = '';
        updateCharacterCount(); 
    } catch (error) {
        console.error("Error during API request:", error);
        alert("Error: Something went wrong while sending the request.");
    }
};
