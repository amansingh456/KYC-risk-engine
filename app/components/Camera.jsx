"use client";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";
import { LoadingAnimation } from "./Loading";

export default function WebcamCapture({
  webcamRef,
  onFaceDetected,
  setCountErr,
}) {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [noFaceCount, setNoFaceCount] = useState(0);
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceapi = await import("@vladmandic/face-api");

        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      } catch (err) {
        console.error("Error loading face detection models:", err);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    let interval;

    const detectFace = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        faceapi.nets.tinyFaceDetector.isLoaded
      ) {
        const video = webcamRef.current.video;
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.4,
          })
        );

        if (detection) {
          onFaceDetected(true);
          setError(null);
          setNoFaceCount(0);
        } else {
          setNoFaceCount((prev) => prev + 1);

          if (noFaceCount >= 3) {
            onFaceDetected(false);
            setCountErr((prev) => prev + 1);
            setError("Face not detected! Keep your face in the center.");
          }
        }
      }
    };

    if (isCameraReady) {
      interval = setInterval(detectFace, 400);
    }

    return () => clearInterval(interval);
  }, [isCameraReady, webcamRef, onFaceDetected, noFaceCount]);

  return (
    <div>
      {!isCameraReady && !error && <LoadingAnimation />}
      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <div className="bg-white text-center p-4 rounded-md shadow-md ml-2 mr-2">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        </div>
      )}
      <Webcam
        ref={webcamRef}
        videoConstraints={videoConstraints}
        onUserMedia={() => setIsCameraReady(true)}
        onUserMediaError={(err) => setError("Unable to access the camera.")}
        style={{
          transform: "scaleX(-1)",
          display: isCameraReady ? "block" : "none",
          border: "1px solid #DCDCDC",
          borderRadius: "6px",
          height: "300px",
          width: "100%",
        }}
      />
    </div>
  );
}
