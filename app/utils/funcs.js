import { createText, extractContentFormatted, sendChatCompletion } from "./api";

export const playAudio = (audio) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        typeof AudioContext !== "undefined" ||
        typeof webkitAudioContext !== "undefined"
      ) {
        const audioContext = new (AudioContext || webkitAudioContext)();
        await audioContext.resume();
        console.log("Audio context resumed for Safari compatibility.");
      }
      audio.play();
      audio.onended = resolve;
      audio.onerror = reject;
    } catch (error) {}
  });
};

export const getQuestionFromLLM = async (prompt) => {
  const textDataFromLlm = await sendChatCompletion(prompt);
  return await extractContentFormatted(textDataFromLlm);
};

export const listen = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support audio capture.");
    throw new Error("Audio capture is not supported in this browser.");
  }

  return new Promise(async (resolve, reject) => {
    try {
      if (
        typeof AudioContext !== "undefined" ||
        typeof webkitAudioContext !== "undefined"
      ) {
        const audioContext = new (AudioContext || webkitAudioContext)();
        await audioContext.resume();
        console.log("Audio context initialized for Safari compatibility.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      // const mediaRecorder = new MediaRecorder(stream, {
      //   mimeType: "audio/webm",
      // });
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        // Convert Blob to a file for upload
        const audioFile = new File([audioBlob], "audio.webm", {
          type: "audio/webm",
        });

        // Step 2: Send audio to Whisper API for transcription
        const transcription = await createText(audioFile);

        resolve(transcription || "Sorry, I couldn't understand that.");
      };

      mediaRecorder.start();

      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      }, 15000);
    } catch (error) {
      console.error("Error capturing audio:", error);
      reject("Audio capture failed. Please try again.");
    }
  });
};
