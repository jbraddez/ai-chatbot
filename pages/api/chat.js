export default async (req, res) => {
    const apiKey = process.env.API_KEY;
  
    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: req.body.messages,
        temperature: 0.7,
        max_tokens: 256
      })
    });
  
    const data = await response.json();
  
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(400).json({ message: "Error" });
    }
  };
  