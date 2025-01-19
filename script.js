const sanitizeString = (str) => {
    return str.replace(/\\/g, '\\\\')   
              .replace(/'/g, "\\'")     
              .replace(/"/g, '\\"')     
              .replace(/\n/g, '\\n')    
              .replace(/\r/g, '\\r');   
};
const sendMessage = async () => {
    const userInput = document.getElementById('user-input').value.trim();

    if (!userInput) return;

    const sanitizedUserInput = sanitizeString(userInput);

    if (sanitizedUserInput.length > 256) {
        document.getElementById('error-message').style.display = 'block';
        return;
    }

    document.getElementById('error-message').style.display = 'none';

    try {
        const response = await fetch("/pages/api/chat", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are a friendly chatbot." },
                    { role: "user", content: sanitizedUserInput }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error from API:", data);
            alert("Error: " + (data.message || "Something went wrong"));
            return;
        }

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
            updateCharacterCount();
        } else {
            console.error("No valid response.");
            alert("Error: No valid response from AI.");
        }
    } catch (error) {
        console.error("Request error:", error);
        alert("Error: Failed to send request.");
    }
};
