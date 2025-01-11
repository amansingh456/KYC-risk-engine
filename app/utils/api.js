import axios from "axios";
import {
  S3Client,
  S3,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";

const generateToken = async () => {
  let config = {
    method: "get",
    url: "https://api.murf.ai/v1/auth/token",
    headers: {
      Accept: "application/json",
      "api-key": `${process.env.NEXT_PUBLIC_ENV_TSS}`,
    },
  };

  try {
    const res = await axios(config);
    const token = res?.data?.token;
    if (token) {
      localStorage.setItem("authTokenMurf", token);
    }

    return token;
  } catch (error) {
    console.log(error);
  }
};

const createSpeech = async (text, wantVoice, wantNative) => {
  const tokenData =
    localStorage.getItem("authTokenMurf") || (await generateToken());

  try {
    let data = JSON.stringify({
      audioDuration: 0,
      channelType: "MONO",
      encodeAsBase64: false,
      format: "WAV",
      modelVersion: "GEN2",
      multiNativeLocale: wantNative,
      pitch: 0,
      pronunciationDictionary: {},
      rate: 0,
      sampleRate: 24000,
      style: "Conversational",
      text: text,
      variation: 1,
      voiceId: wantVoice,
    });

    const config = {
      method: "post",
      url: "https://api.murf.ai/v1/speech/generate",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        token: tokenData,
        "api-key": `${process.env.NEXT_PUBLIC_ENV_TSS}`,
      },
      data: data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log("Error:", error.response ? error.response.data : error.message);
    return error;
  }
};

// Optimize sendChatCompletion function
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

// Optimize createText function
const createText = async (audioFilePath, wantNative) => {
  try {
    const formData = new FormData();
    formData.append("file", audioFilePath, "audio.mp3");
    formData.append("model", "whisper-1");
    formData.append("language", wantNative === "en-IN" ? "en" : "hi");

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

const uploadToS3 = async (blob) => {
  const s3Client = new S3({
    endpoint: "https://fra1.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  });

  const fileName = `detex-data/recording-${Date.now()}.webm`;
  const bucketParams = {
    Bucket: "stg-kyc-docs",
    Key: fileName,
    Body: blob,
    ContentType: "video/webm",
    ACL: "public-read",
  };

  try {
    const response = await s3Client.send(new PutObjectCommand(bucketParams));

    const fileUrl = `https://fra1.digitaloceanspaces.com/stg-kyc-docs/${fileName}`;

    console.log("Upload successful:", { fileUrl, response });
    return { success: true, fileUrl };
  } catch (error) {
    console.log("Error whileUpload failed:", error);
    return { success: false, error };
  }
};

export {
  sendChatCompletion,
  extractContentFormatted,
  createSpeech,
  getScore,
  createText,
  uploadToS3,
};
