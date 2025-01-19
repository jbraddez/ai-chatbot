const sanitizeString = (str) => {
    return str.replace(/\\/g, '\\\\')   
              .replace(/'/g, "\\'")     
              .replace(/"/g, '\\"')     
              .replace(/\n/g, '\\n')    
              .replace(/\r/g, '\\r');   
};

const apiKey = process.env.API_KEY;
const baseURL = "https://api.aimlapi.com/v1"; 

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
        const response = await fetch(baseURL + "/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: sanitizedUserInput
                    }
                ],
                temperature: 0.7,
                max_tokens: 256
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from API:", errorData);
            alert("Error: " + (errorData.message || "Something went wrong"));
            return;
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const aiResponse = data.choices[0].message.content;

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
        } else {
            console.error("No valid 'choices' found in response.");
            alert("Error: No valid response from AI.");
        }
    } catch (error) {
        console.error("Error during API request:", error);
        alert("Error: Something went wrong while sending the request.");
    }
};
