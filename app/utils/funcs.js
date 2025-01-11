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

export const listen = async (wantNative) => {
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

      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        const audioFile = new File([audioBlob], "audio.webm", {
          type: "audio/webm",
        });

        const transcription = await createText(audioFile, wantNative);

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

// export const listen = async (wantNative) => {
//   if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
//     alert("Your browser does not support speech recognition.");
//     throw new Error("Speech recognition is not supported in this browser.");
//   }

//   return new Promise((resolve, reject) => {
//     try {
//       const SpeechRecognition =
//         window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognition = new SpeechRecognition();

//       recognition.lang = wantNative;
//       recognition.interimResults = true;
//       recognition.maxAlternatives = 1;

//       let finalTranscript = "";
//       let isListening = true;

//       const stopListeningAfterTimeout = setTimeout(() => {
//         isListening = false;
//         recognition.stop();
//       }, 15000);

//       recognition.onstart = () => {};

//       recognition.onresult = (event) => {
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           if (event.results[i].isFinal) {
//             finalTranscript += event.results[i][0].transcript + " ";
//           }
//         }
//       };

//       recognition.onspeechend = () => {
//         if (isListening) {
//           recognition.stop();
//           recognition.start();
//         }
//       };

//       recognition.onerror = (error) => {
//         clearTimeout(stopListeningAfterTimeout);
//         reject("Error occurred during speech recognition. Please try again.");
//       };

//       recognition.onend = () => {
//         if (isListening) {
//           recognition.start();
//         } else {
//           clearTimeout(stopListeningAfterTimeout);
//           resolve(
//             finalTranscript.trim() || "Sorry, I couldn't understand that."
//           );
//         }
//       };

//       recognition.start();
//     } catch (error) {
//       console.error("Error initializing speech recognition:", error);
//       reject("Speech recognition initialization failed. Please try again.");
//     }
//   });
// };
