exports.handler = async (event, context) => {
  const { messages } = JSON.parse(event.body);
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages
    })
  });
  
  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};