import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const apiKey = process.env.API_KEY_TSS;

  if (!apiKey) {
    return res
      .status(500)
      .json({ message: "API key is not defined in environment variables" });
  }

  const config = {
    method: "get",
    url: "https://api.murf.ai/v1/auth/token",
    headers: {
      Accept: "application/json",
      "api-key": apiKey,
    },
  };

  try {
    const response = await axios(config);
    const token = response?.data?.token;

    return res.status(200).json({ token });
  } catch (error) {
    console.error(
      "Error generating token:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Failed to generate token",
      error: error.response?.data || error.message,
    });
  }
}
