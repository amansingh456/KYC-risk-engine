"use client";
import React, { useEffect, useRef, useState } from "react";

import { useMainhook } from "../hooks/useMainhook";
import { LoadingAnimation } from "../components/Loading";
import { SpeakingAnimation } from "../components/Speaking";
import { useSelector } from "react-redux";
import { Instructions } from "../components/Instructions";
import { AnswerBox } from "../components/AnswerBox";
import CircularTimer from "../components/CircularTimer";
import dynamic from "next/dynamic";

const WebcamCapture = dynamic(() => import("../components/Camera"), {
  ssr: false,
});

const Interaction = () => {
  const webcamRef = useRef(null);
  const [isFaceDetected, setIsFaceDetected] = useState(true);

  const {
    handleStart,
    isLoading,
    isProcessStart,
    isSystemSpeaking,
    questionCount,
    handleFlow,
    showAnsBox,
    showSpinerTimer,
    showReviewButton,
    handleReview,
    showThankYouMsg,
    showCamera,
    errorx,
    setCountErr,
  } = useMainhook();

  const { nextQuestion } = useSelector((state) => state.counterSlice);

  useEffect(() => {
    if (questionCount > 0) {
      handleFlow(nextQuestion);
      return;
    }
  }, [questionCount]);

  return (
    <div className="relative w-[330px] h-[600px]  bg-gradient-to-b from-green-100 to-white rounded-lg shadow-lg flex flex-col items-center border-white-700">
      <div className="flex flex-col justify-between space-y-6 w-full h-full p-2">
        <div>
          {showCamera && (
            <WebcamCapture
              webcamRef={webcamRef}
              onFaceDetected={(detected) => setIsFaceDetected(detected)}
              setCountErr={setCountErr}
            />
          )}
        </div>
        {!isProcessStart && <Instructions />}
        {showThankYouMsg && (
          <div
            style={{ marginBottom: "200px" }}
            className="flex flex-col items-center justify-center py-4 border border-[#DCDCDC] rounded-xl"
          >
            <p className="text-2xl text-green-500 text-center">
              Thank You for your time... 🙂
            </p>
          </div>
        )}
        {!isProcessStart && (
          <button
            onClick={handleStart}
            className="p-2  w-full text-white text-xl bg-gradient-to-r from-green-300 to-green-700  rounded-md hover:bg-green-800 transition"
          >
            Start
          </button>
        )}
        {isLoading && <LoadingAnimation />}
        {showAnsBox && !isLoading && <AnswerBox text={showAnsBox} />}
        {isSystemSpeaking && <SpeakingAnimation />}
        {showSpinerTimer && (
          <div className="flex items-center justify-center">
            <div className="relative h-40 w-40  flex items-center justify-center">
              <CircularTimer />
            </div>
          </div>
        )}

        {showReviewButton && (
          <button
            onClick={handleReview}
            className="p-2 w-full text-white text-xl bg-gradient-to-r from-green-300 to-green-700  rounded-md hover:bg-green-800 transition"
          >
            Finish It
          </button>
        )}
      </div>

      {errorx && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white text-center p-4 rounded-md shadow-md">
            <p className="text-red-500 font-bold">{errorx}</p>
          </div>
        </div>
      )}

      <footer className="text-[12px] text-black italic flex items-right justify-right">
        Powered By
        <span className="font-bold rounded-md pl-1">DETEX.Tech</span>
      </footer>
    </div>
  );
};

export default Interaction;
