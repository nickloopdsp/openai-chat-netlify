// netlify/functions/chat.js

const fetch = require('node-fetch'); // Ensure node-fetch is installed

exports.handler = async (event) => {
  const allowedOrigins = ['https://loopv1-copy.cargo.site']; // Replace with your actual Cargo site URL
  const origin = event.headers.origin;

  // Log the incoming origin for debugging
  console.log(`Incoming request from origin: ${origin}`);

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
  } catch (error) {
    console.error("Invalid JSON:", error);
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

    // Check if the response is ok
    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: data.error || "OpenAI API Error" })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Internal Server Error:", error); // Log the error for debugging
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
