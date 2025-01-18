const sanitizeString = (str) => {
    return str.replace(/\\/g, '\\\\')   
              .replace(/'/g, "\\'")     
              .replace(/"/g, '\\"')     
              .replace(/\n/g, '\\n')    
              .replace(/\r/g, '\\r');   
};

const sendMessage = async () => {
    const userInput = document.getElementById('user-input').value;
    const sanitizedUserInput = sanitizeString(userInput);

    const systemPrompt = "You are a friendly chatbot. Please respond naturally to user questions or conversations, and avoid focusing on technical explanations unless requested.";

    const combinedMessage = `${systemPrompt} ${sanitizedUserInput}`;
    if (combinedMessage.length > 256) {
        document.getElementById('error-message').style.display = 'block'; 
        return; 
    }

    document.getElementById('error-message').style.display = 'none';

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: sanitizedUserInput }
                ]
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
            const userMessage = `<div class="message user-message"><strong>User:</strong> ${userInput}</div>`;
            chatBox.innerHTML += userMessage;

            const aiMessageElement = document.createElement('div');
            aiMessageElement.classList.add("message", "ai-message", "typing-animation");
            aiMessageElement.innerHTML = `<strong>AI:</strong> ...`;
            chatBox.appendChild(aiMessageElement);

            setTimeout(() => {
                aiMessageElement.innerHTML = `<strong>AI:</strong> ${aiResponse}`;
                aiMessageElement.classList.remove("typing-animation");
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
