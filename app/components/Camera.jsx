import Webcam from "react-webcam";

export default function WebcamCapture({ webcamRef }) {
  return (
    <Webcam
      ref={webcamRef}
      className=""
      videoConstraints={{
        facingMode: "user",
      }}
      style={{
        transform: "scaleX(-1)",
      }}
    />
  );
}
