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
    showScoreInScreen,
    showThankYouMsg,
    showCamera,
    errorx,
    countErr,
    setCountErr,
  } = useMainhook();

  const { nextQuestion } = useSelector((state) => state.counterSlice);

  useEffect(() => {
    if (questionCount > 0) {
      handleFlow(nextQuestion);
      return;
    }
  }, [questionCount]);

  console.log(countErr, "countErr");
  return (
    <div className="relative w-[330px] h-[600px] border bg-gray-800 rounded-lg shadow-lg flex flex-col items-center border-white-700">
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

        {!isProcessStart && (
          <button
            onClick={handleStart}
            className="px-6 py-3 w-full text-black text-xl bg-white rounded-md hover:bg-slate-50 transition"
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
            className="px-6 py-3 w-full text-black text-xl bg-white rounded-md hover:bg-slate-50 transition"
          >
            Review
          </button>
        )}
        {showThankYouMsg && (
          <div className="flex flex-col items-center justify-center py-4 bg-gray-700 rounded-xl">
            <p className="text-2xl text-green-500 text-center">
              Thank You for your time... 🙂
            </p>
            {/* <button className="p-2 rounded-3xl border border-black text-black">
              Start Again
            </button> */}
          </div>
        )}
        {showScoreInScreen && (
          <p className="flex justify-center items-center">
            {showScoreInScreen}
          </p>
        )}
      </div>
      {errorx && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white text-center p-4 rounded-md shadow-md">
            <p className="text-red-500 font-bold">{errorx}</p>
          </div>
        </div>
      )}
      <footer className="text-[12px] italic flex items-right justify-right">
        Powered By
        <span className="font-bold  rounded-md pl-1">DETEX.Tech</span>
      </footer>
    </div>
  );
};

export default Interaction;
