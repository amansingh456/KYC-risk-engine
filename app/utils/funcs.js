import lamejs from "lamejs";

export const speak = (text, lang = "hi-IN") => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support speech synthesis.");
      resolve();
      return;
    }

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = lang;

    speech.pitch = 0.8; // Adjust pitch for a more natural tone
    speech.rate = 1; // Adjust rate for clarity
    speech.volume = 1; // Adjust volume if needed

    speech.onend = resolve;
    speech.onerror = (error) => {
      resolve();
      console.log("Speech synthesis error:", error);
    };

    window.speechSynthesis.speak(speech);
  });
};

// !

// export const listen = async (duration = 10000) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorder = new MediaRecorder(stream);

//       // Collect data as it becomes available
//       mediaRecorder.ondataavailable = (event) => {
//         audioChunks.push(event.data);
//       };

//       // Start the recording
//       mediaRecorder.start();

//       // Set a timer for the desired duration to stop recording
//       setTimeout(() => {
//         mediaRecorder.stop();
//       }, duration);

//       // When recording stops, resolve the promise with the audio blob
//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//         resolve(audioBlob);
//       };

//       // Handle errors
//       mediaRecorder.onerror = (error) => {
//         reject(new Error("Error while recording: " + error.message));
//       };
//     } catch (error) {
//       reject(new Error("Error starting the recording: " + error.message));
//     }
//   });
// };

export const playAudio = (audio) => {
  return new Promise((resolve, reject) => {
    audio.onended = () => {
      resolve();
    };
    audio.onerror = (error) => {
      reject(error);
    };
    audio.play();
  });
};

// export const listen = () => {
//   return new Promise((resolve) => {
//     const recognition = new (window.SpeechRecognition ||
//       window.webkitSpeechRecognition)();
//     recognition.lang = "hi-IN";

//     let transcript = "";
//     let isStoppedByTimer = false;

//     const startRecognition = () => {
//       recognition.start();
//     };

//     recognition.onresult = (event) => {
//       transcript += event.results[0][0].transcript;
//     };

//     recognition.onerror = (event) => {
//       console.log("Recognition error:", event.error);
//       if (event.error !== "no-speech") {
//         resolve("Sorry, I couldn't understand that.");
//       }
//     };

//     recognition.onend = () => {
//       if (!isStoppedByTimer) {
//         startRecognition(); // Restart recognition if the timer has not stopped it
//       }
//     };

//     // Start recognition for the first time
//     startRecognition();

//     // Stop recognition after 10 seconds
//     setTimeout(() => {
//       isStoppedByTimer = true;
//       recognition.stop();
//       resolve(transcript || "Sorry, I couldn't understand that.");
//     }, 10000);
//   });
// };

export const listen = () => {
  return new Promise((resolve, reject) => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      reject("Speech Recognition API is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";

    let transcript = "";
    let isStoppedByTimer = false;

    recognition.onresult = (event) => {
      transcript += event.results[0][0].transcript;
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      if (event.error !== "no-speech") {
        resolve("Sorry, I couldn't understand that.");
      }
    };

    recognition.onend = () => {
      if (!isStoppedByTimer) {
        recognition.start(); // Restart recognition if the timer has not stopped it
      }
    };

    recognition.onaudiostart = () => {
      console.log("Audio capturing started.");
    };

    recognition.onaudioend = () => {
      console.log("Audio capturing ended.");
    };

    // Start recognition
    try {
      recognition.start();
    } catch (err) {
      console.error("Error starting recognition:", err);
      reject("Failed to start speech recognition.");
      return;
    }

    // Stop recognition after 10 seconds
    setTimeout(() => {
      isStoppedByTimer = true;
      recognition.stop();
      resolve(transcript.trim() || "Sorry, I couldn't understand that.");
    }, 10000);
  });
};
