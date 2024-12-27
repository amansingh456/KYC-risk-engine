"use client";

import { useState, useEffect } from "react";
import WebcamCapture from "../components/Camera";
import { startRecording, stopRecording } from "../utils/recording";
import { listen, playAudio } from "../utils/funcs";
import {
  createSpeech,
  extractContentFormatted,
  getScore,
  sendChatCompletion,
} from "../utils/api";
import CircularTimer from "../components/CircularTimer";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsLoading,
  setIsProcessStart,
  setIsSystemSpeaking,
  setNextQuestion,
  setPromptQuestionData,
  setQuestionCount,
  setScorePrompt,
  setShowSpinerTimer,
} from "../store/counterSlice";
import { Instructions } from "../components/Instructions";
import { LoadingAnimation } from "../components/Loading";
import { SpeakingAnimation } from "../components/Speaking";

export default function Interaction() {
  const dispatch = useDispatch();
  const [showReviewButton, setShowReviewButton] = useState(false);
  const [showResult, setShowResult] = useState(undefined);
  const {
    isLoading,
    isProcessStart,
    isSystemSpeaking,
    promptQuestion,
    questionCount,
    showSpinerTimer,
    nextQuestion,
    scorePrompt,
  } = useSelector((state) => state.counterSlice);

  let obj = [...promptQuestion];

  const handleStart = async () => {
    await startRecording();
    dispatch(setIsProcessStart(true));

    //! system Intro
    dispatch(setIsLoading(true));
    const voice = await createSpeech(
      "नमस्कार, मै ऑनमेटा की वर्चुअल असिस्टेंट हूं  में आपसे कुछ सवाल करुँगी , और आपके पास हर सवाल के लिए दस सेकण्ड्स होंगे "
    );
    try {
      const audioBlob = new Blob([voice.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      dispatch(setIsLoading(false));
      dispatch(setIsSystemSpeaking(true));
      await playAudio(audio);
      dispatch(setIsSystemSpeaking(false));
    } catch (error) {
      console.error("Error playing audio:", error);
    }

    //! system Intro complete

    //! First Question ...
    dispatch(setIsLoading(true));
    const initialQuestion = await getQuestionFromLLM(promptQuestion);
    dispatch(setNextQuestion(initialQuestion));
    dispatch(setQuestionCount());
    dispatch(setIsLoading(false));
  };

  const handleFlow = async (question) => {
    dispatch(setIsLoading(true));
    dispatch(setPromptQuestionData({ role: "system", content: question }));
    dispatch(setScorePrompt(JSON.stringify({ question: question })));
    obj.push({ role: "system", content: question });
    const voice = await createSpeech(question);

    try {
      const audioBlob = new Blob([voice.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      dispatch(setIsLoading(false));
      dispatch(setIsSystemSpeaking(true));
      await playAudio(audio);
      dispatch(setIsSystemSpeaking(false));
    } catch (error) {
      console.error("Error playing audio:", error);
    }

    dispatch(setShowSpinerTimer(true));
    const userAnswer = await listen();
    dispatch(setShowSpinerTimer(false));
    if (userAnswer) {
      dispatch(setPromptQuestionData({ role: "user", content: userAnswer }));
      dispatch(setScorePrompt(JSON.stringify({ answer: userAnswer })));

      obj.push({ role: "user", content: userAnswer });
      dispatch(setIsLoading(true));
      const nextQues = await getQuestionFromLLM(obj);
      dispatch(setNextQuestion(nextQues));
      dispatch(setIsLoading(false));
      dispatch(setQuestionCount());
    } else {
      console.log("No user response detected.");
    }
  };

  const getQuestionFromLLM = async (prompt) => {
    const textDataFromLlm = await sendChatCompletion(prompt);
    return await extractContentFormatted(textDataFromLlm);
  };

  const handleReview = async () => {
    dispatch(setIsLoading(true));
    setShowReviewButton(false);
    const scoreResult = await getScore(scorePrompt);
    const r = await extractContentFormatted(scoreResult);
    setShowResult(r);
    dispatch(setIsLoading(false));
    await stopRecording();
  };

  useEffect(() => {
    if (questionCount > 0 && questionCount <= 3) {
      handleFlow(nextQuestion);
      return;
    }
    if (questionCount >= 3) {
      setShowReviewButton(true);
      console.log("review button");
      return;
    }
    if (true) {
      console.log("running else block");
    }
  }, [questionCount]);

  return (
    <>
      <div className="relative w-[375px] h-[667px] border bg-gray-800 rounded-lg shadow-lg flex flex-col items-center border-white-700">
        <div className="flex flex-col justify-between space-y-6 w-full h-full p-2">
          <div className="w-[full]  rounded-md bg-gray-700  flex items-center justify-center overflow-hidden border-2">
            <WebcamCapture />
          </div>

          {!isProcessStart && <Instructions />}
          {showResult && (
            <p className="flex justify-center items-center">{showResult}</p>
          )}
          {!isProcessStart && (
            <button
              onClick={handleStart}
              className="px-6 py-3 w-full text-black text-xl bg-white rounded-md hover:bg-slate-50 transition"
            >
              Start
            </button>
          )}

          {showReviewButton && (
            <button
              onClick={handleReview}
              className="px-6 py-3 w-full text-black text-xl bg-white rounded-md hover:bg-slate-50 transition"
            >
              Review
            </button>
          )}

          {isLoading && <LoadingAnimation />}

          {isSystemSpeaking && <SpeakingAnimation />}

          {showSpinerTimer && (
            <div className="flex items-center justify-center">
              <div className="relative h-40 w-40  flex items-center justify-center">
                <CircularTimer />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
