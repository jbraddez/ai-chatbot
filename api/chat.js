export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userInput } = req.body;

    if (!userInput || userInput.trim() === "") {
        return res.status(400).json({ message: 'User input is required' });
    }

    const sanitizedUserInput = userInput
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');

    const systemPrompt = "You are a friendly chatbot. Please respond naturally to user questions or conversations, and avoid focusing on technical explanations unless requested.";
    const combinedMessage = `${systemPrompt} ${sanitizedUserInput}`;

    if (combinedMessage.length > 256) {
        return res.status(400).json({ message: 'Message too long' });
    }

    const apiKey = process.env.API_KEY; 

    try {
        const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'mistralai/Mistral-7B-Instruct-v0.2',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: sanitizedUserInput }
                ],
                temperature: 0.7,
                max_tokens: 256
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ message: errorData.message || 'Error with AI API' });
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return res.status(200).json({ aiResponse: data.choices[0].message.content });
        } else {
            return res.status(500).json({ message: 'No valid response from AI' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error during API request', error });
    }
}
