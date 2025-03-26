const axios = require("axios");

const callGroqAPI = async (question, maxTokens = 2100) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "deepseek-r1-distill-llama-70b",
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Error calling Groq API:",
      error?.response?.data || error.message
    );
    throw new Error("Failed to get response from Groq API");
  }
};

module.exports = {
  callGroqAPI,
};
