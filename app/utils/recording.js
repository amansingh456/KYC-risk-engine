let mediaRecorder;
let recordedChunks = [];

export const startRecording = async () => {
  recordedChunks = [];
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    return new Promise((resolve) => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.push(event.data);
      };
      mediaRecorder.onstart = resolve;
      mediaRecorder.start();
    });
  } catch (error) {
    console.log("Error accessing media devices:", error);
    alert("Please allow camera and microphone permissions.");
    const retry = confirm("Would you like to retry granting permissions?");
    if (retry) {
      return startRecording();
    } else {
      throw new Error("Camera and microphone permissions not granted.");
    }
  }
};

export const stopRecording = async () => {
  return new Promise((resolve) => {
    if (mediaRecorder) {
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        resolve(blob);
      };
      mediaRecorder.stop();
    }
  });
};
