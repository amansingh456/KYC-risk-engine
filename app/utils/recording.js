let mediaRecorder;
let recordedChunks = [];

export const startRecording = async () => {
  recordedChunks = [];
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true,
    });

    return new Promise((resolve, reject) => {
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstart = () => {
          console.log("Recording started");
          resolve(mediaRecorder);
        };

        mediaRecorder.onerror = (err) => {
          console.error("MediaRecorder error:", err);
          reject(new Error("MediaRecorder failed to start."));
        };

        mediaRecorder.start();
      } catch (err) {
        console.error("Error initializing MediaRecorder:", err);
        reject(new Error("Unable to initialize MediaRecorder."));
      }
    });
  } catch (err) {
    console.error("Error accessing media devices:", err);
    throw new Error("Camera permissions are not granted.");
  }
};

export const stopRecording = async () => {
  return new Promise((resolve, reject) => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        console.log("Recording stopped");
        resolve(blob);
      };

      mediaRecorder.onerror = (err) => {
        console.error("MediaRecorder stop error:", err);
        reject(new Error("Failed to stop MediaRecorder."));
      };

      mediaRecorder.stop();
    } else {
      reject(new Error("MediaRecorder is not active."));
    }
  });
};
