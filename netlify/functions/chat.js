// netlify/functions/chat.js

const fetch = require('node-fetch'); // Ensure node-fetch is installed

exports.handler = async (event) => {
  const allowedOrigins = ['https://loopv1-copy.cargo.site/']; // Replace with your actual Cargo site URL
  const origin = event.headers.origin;

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Parse the request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
      },
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  if (!body.messages) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
      },
      body: JSON.stringify({ error: "Missing 'messages'" }),
    };
  }

  try {
    // Call OpenAI Assistant API using the assistant's ID
    const response = await fetch(`https://api.openai.com/v1/assistants/asst_OZ8WpGNkuUv3sPH3wYPLVTFR/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        messages: body.messages
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
