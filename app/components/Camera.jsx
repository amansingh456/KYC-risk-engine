import React, { useState } from "react";
import Webcam from "react-webcam";
import { LoadingAnimation } from "./Loading";

export default function WebcamCapture({ webcamRef }) {
  const [isCameraReady, setIsCameraReady] = useState(false);

  return (
    <div>
      {!isCameraReady && <LoadingAnimation />}
      <Webcam
        ref={webcamRef}
        className=""
        videoConstraints={{
          facingMode: "user",
        }}
        onUserMedia={() => setIsCameraReady(true)}
        style={{
          transform: "scaleX(-1)",
          display: isCameraReady ? "block" : "none",
          border: "1px solid white",
          borderRadius: "6px",
          height: "300px",
          width: full,
        }}
      />
    </div>
  );
}
