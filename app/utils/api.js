import axios from "axios";

const createSpeech = async (text) => {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/audio/speech",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ENV_OPENAI_API}`,
        "Content-Type": "application/json",
      },
      data: {
        model: "tts-1",
        input: text,
        voice: "shimmer",
        speed: 0.9,
      },
      responseType: "arraybuffer",
    });
    return response;
  } catch (error) {
    console.log("Error:", error.response ? error.response.data : error.message);
    return error;
  }
};

// const createSpeech = async (text) => {
//   try {
//     let data = JSON.stringify({
//       voiceId: "hi-IN-ayushi",
//       style: "Conversational",
//       text: text,
//       rate: 0,
//       pitch: 0,
//       sampleRate: 48000,
//       format: "MP3",
//       channelType: "MONO",
//       pronunciationDictionary: {},
//       encodeAsBase64: false,
//       variation: 1,
//       audioDuration: 0,
//       modelVersion: "GEN2",
//       multiNativeLocale: "hi-IN",
//     });

//     let config = {
//       method: "post",
//       url: "https://api.murf.ai/v1/speech/generate",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "api-key": `${process.env.NEXT_PUBLIC_ENV_TSS_KEY}`,
//       },
//       data: data,
//     };

//     const response = await axios(config);

//     return response.data;
//   } catch (error) {
//     console.log("Error:", error.response ? error.response.data : error.message);
//     return error;
//   }
// };

const sendChatCompletion = async (promptMsg) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: promptMsg,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ENV_OPENAI_API}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error:", error.response ? error.response.data : error.message);
    return error;
  }
};

const extractContentFormatted = async (apiResponse) => {
  try {
    if (apiResponse?.choices?.length > 0) {
      const content = apiResponse.choices[0]?.message?.content;
      if (content) {
        return content;
      } else {
        throw new Error("No content found in the response.");
      }
    } else {
      throw new Error("Invalid response structure or no choices available.");
    }
  } catch (error) {
    console.error("Error extracting useful text:", error.message);
    return { error: error.message };
  }
};

const getScore = async (promptMsg) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: promptMsg,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ENV_OPENAI_API}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error:", error.response ? error.response.data : error.message);
    return error;
  }
};

const createText = async (audioFilePath) => {
  try {
    const formData = new FormData();
    formData.append("file", audioFilePath, "audio.mp3");
    formData.append("model", "whisper-1");
    formData.append("language", "hi");

    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/audio/transcriptions",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ENV_OPENAI_API}`,
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    });

    return response.data.text;
  } catch (error) {
    console.log("Error:", error.response ? error.response.data : error.message);
    return error;
  }
};

export {
  sendChatCompletion,
  extractContentFormatted,
  createSpeech,
  getScore,
  createText,
};
