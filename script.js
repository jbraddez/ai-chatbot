const sanitizeString = (str) => {
    return str.replace(/\\/g, '\\\\')   
              .replace(/'/g, "\\'")     
              .replace(/"/g, '\\"')     
              .replace(/\n/g, '\\n')    
              .replace(/\r/g, '\\r');   
};

const apiKey = "3264e88eb4cf4d1a92bb7a6354b758d7"; 
const baseURL = "https://api.aimlapi.com/v1"; 

const updateCharacterCount = () => {
    const userInput = document.getElementById('user-input').value;
    const charCount = userInput.length;
    const charCountElement = document.getElementById('char-count');

    charCountElement.textContent = `${charCount}/256`;

    if (charCount > 256) {
        charCountElement.style.color = 'red';
        document.getElementById('error-message').style.display = 'block'; 
    } else {
        charCountElement.style.color = '#555';
        document.getElementById('error-message').style.display = 'none'; 
    }
};

document.getElementById('user-input').addEventListener('input', updateCharacterCount);

const sendMessage = async () => {
    const userInput = document.getElementById('user-input').value.trim();

    if (!userInput) {  // Check if input is empty before sanitizing
        return;
    }

    const sanitizedUserInput = sanitizeString(userInput);

    const systemPrompt = "You are a friendly chatbot. Please respond naturally to user questions or conversations, and avoid focusing on technical explanations unless requested.";

    if (sanitizedUserInput.length > 256) {
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
                    { role: "system", content: systemPrompt },
                    { role: "user", content: sanitizedUserInput }
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
            chatBox.innerHTML += `<div class="message user-message"><strong>User:</strong> ${userInput}</div>`;

            const aiMessageElement = document.createElement('div');
            aiMessageElement.classList.add("message", "ai-message", "typing-animation");
            aiMessageElement.innerHTML = `<strong>AI:</strong> ...`;
            chatBox.appendChild(aiMessageElement);

            setTimeout(() => {
                aiMessageElement.innerHTML = `<strong>AI:</strong> ${aiResponse}`;
                aiMessageElement.classList.remove("typing-animation");
            }, 1500);

            document.getElementById('user-input').value = '';
            updateCharacterCount(); // Reset character count after sending message
        } else {
            console.error("No valid 'choices' found in response.");
            alert("Error: No valid response from AI.");
        }
    } catch (error) {
        console.error("Error during API request:", error);
        alert("Error: Something went wrong while sending the request.");
    }
};

// Auto-expand textarea on input
const textarea = document.getElementById('user-input');
textarea.addEventListener('input', function () {
    this.style.height = 'auto'; 
    this.style.height = (this.scrollHeight) + 'px'; 
});
