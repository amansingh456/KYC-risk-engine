"use client";
import { useState, useEffect } from "react";
import { startRecording, stopRecording } from "../utils/recording";
import { getQuestionFromLLM, listen, playAudio } from "../utils/funcs";
import { useDispatch, useSelector } from "react-redux";
import {
  setNextQuestion,
  setPromptQuestionData,
  setScorePrompt,
  setStoreResult,
} from "../store/counterSlice";
import { createSpeech, extractContentFormatted, getScore } from "../utils/api";

export const useMainhook = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessStart, setIsProcessStart] = useState(false);
  const [isSystemSpeaking, setIsSystemSpeaking] = useState(false);
  const [showSpinerTimer, setShowSpinerTimer] = useState(false);
  const [showAnsBox, setShowAnsBox] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [errorx, setErrorx] = useState(false);
  const [showReviewButton, setShowReviewButton] = useState(false);
  const [showThankYouMsg, setShowThankYouMsg] = useState(false);
  const [showCamera, SetShowCamera] = useState(true);
  const [shouldSaveData, setShouldSaveData] = useState(false);
  const [isHandleStartClicked, setIsHandleStartClicked] = useState(false);
  const [countErr, setCountErr] = useState(0);

  const { promptQuestion, scorePrompt, storeResult } = useSelector(
    (state) => state.counterSlice
  );
  const [showScoreInScreen, setShowScoreInScreen] = useState("");
  const dispatch = useDispatch();
  const obj = [...promptQuestion];
  const regex = /\b(thank\s?you|thankyou)\b[\W]*$/i;

  const handleStart = async () => {
    if (isHandleStartClicked) return;
    setIsHandleStartClicked(true);
    const isOK = await startRecording();
    if (isOK) {
      setIsProcessStart(true);

      //! System Intro
      setIsLoading(true);
      try {
        const voice = await createSpeech(
          "नमस्कार, मै डिटेक्स की केवाईसी एजेंट हू"
        );

        const audioBlob = new Blob([voice.data], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        //! use myra.ai for girl best audio....
        // const audioUrl = voice.audioFile;
        // const audio = new Audio(audioUrl);

        setIsLoading(false);
        setShowAnsBox("नमस्कार, मै DETEX की केवाईसी एजेंट हू");
        setIsSystemSpeaking(true);

        await playAudio(audio);
      } catch (error) {
        setIsLoading(false);
        setIsSystemSpeaking(false);
        setShowAnsBox(false);
        setErrorx(
          "something went wrong while creating speech or playing audio"
        );
        return;
      }

      //! First Question
      try {
        setIsLoading(true);
        const initialQuestion = await getQuestionFromLLM(promptQuestion);
        dispatch(setNextQuestion(initialQuestion));
        setQuestionCount((prev) => prev + 1);
      } catch (error) {
        setErrorx("something went wrong while generating prompt from AI");
        setIsLoading(false);
        setShowAnsBox(false);
        setShowAnsBox(false);
        setIsSystemSpeaking(false);
        return;
      } finally {
        setIsLoading(false);
        setShowAnsBox(false);
        setShowAnsBox(false);
        setIsSystemSpeaking(false);
      }
    } else {
      setIsLoading(false);
      setShowAnsBox(false);
      setShowAnsBox(false);
      setIsSystemSpeaking(false);
      setErrorx("Failed to start Process or recording...");
    }
  };

  const handleFlow = async (question) => {
    setIsLoading(true);
    dispatch(setPromptQuestionData({ role: "system", content: question }));
    dispatch(setScorePrompt(JSON.stringify({ question: question })));

    dispatch(setStoreResult({ ques: question }));
    obj.push({ role: "system", content: question });

    let voice;
    try {
      voice = await createSpeech(question);
      if (!voice || !voice.data)
        throw new Error("No valid audio data returned");

      const audioBlob = new Blob([voice.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      //! use myra.ai for girl best audio....
      // const audioUrl = voice.audioFile;
      // const audio = new Audio(audioUrl);

      setIsLoading(false);
      setShowAnsBox("Please listen carefully .... !!");
      setIsSystemSpeaking(true);
      await playAudio(audio);
      setShowAnsBox(false);
      setIsSystemSpeaking(false);
    } catch (error) {
      setErrorx("Failed to speak the question");
      setIsLoading(false);
      setShowSpinerTimer(false);
      setShowAnsBox(false);
      return;
    }

    if (regex.test(question)) {
      setShowReviewButton(true);
      setIsLoading(false);
      setShowSpinerTimer(false);
      setShowAnsBox(false);
      return;
    }

    if (questionCount === 20) {
      setShowReviewButton(true);
      setIsLoading(false);
      setShowSpinerTimer(false);
      setShowAnsBox(false);
      return;
    }

    setShowSpinerTimer(true);
    setShowAnsBox("Speak Now...I'm listening !!");

    let userAnswer = "";
    try {
      userAnswer = await listen();
      if (!userAnswer) throw new Error("No response detected");

      setIsLoading(true);
      setShowSpinerTimer(false);
      setShowAnsBox(false);

      dispatch(setPromptQuestionData({ role: "user", content: userAnswer }));
      dispatch(setScorePrompt(JSON.stringify({ answer: userAnswer })));
      obj.push({ role: "user", content: userAnswer });

      dispatch(setStoreResult({ ans: userAnswer }));
      const nextQues = await getQuestionFromLLM(obj);
      dispatch(setNextQuestion(nextQues));
      setQuestionCount((prev) => prev + 1);
    } catch (error) {
      setIsLoading(false);
      setShowSpinerTimer(false);
      setShowAnsBox(false);
      setErrorx("No user response detected or error in listening");
      return;
    } finally {
      setIsLoading(false);
      setShowSpinerTimer(false);
      setShowAnsBox(false);
    }
  };

  const handleReview = async () => {
    try {
      setIsLoading(true);
      setShowReviewButton(false);
      const scoreResult = await getScore(scorePrompt);

      const r = await extractContentFormatted(scoreResult);
      setShowScoreInScreen(r);
      setIsLoading(false);
      dispatch(setStoreResult({ confidenceScore: r }));
      setShouldSaveData(true);
    } catch (error) {
      setErrorx("Something went wrong while posting data to the DB");
      console.error("Error posting data to the API:", error);
    } finally {
      SetShowCamera(false);
      setShowThankYouMsg(true);
      setShowAnsBox(false);
      setIsLoading(false);
      setIsSystemSpeaking(false);
      setQuestionCount(0);
      setShowSpinerTimer(false);
      await stopRecording();
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const saveData = async () => {
      if (shouldSaveData) {
        try {
          console.log(storeResult, "storeResult");
          const response = await fetch("/api/postResult", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(storeResult),
            signal,
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Data successfully saved to MongoDB:", data);
          } else {
            const errorData = await response.json();
            console.error("Failed to save data:", errorData);
          }
        } catch (error) {
          if (error.name === "AbortError") {
            console.log("Fetch request was aborted.");
          } else {
            console.error("Error saving data:", error.message);
          }
        }
      }
    };

    saveData();

    return () => {
      controller.abort();
    };
  }, [shouldSaveData]);

  return {
    handleStart,
    isLoading,
    isProcessStart,
    isSystemSpeaking,
    questionCount,
    errorx,
    showReviewButton,
    handleFlow,
    showSpinerTimer,
    showAnsBox,
    handleReview,
    showScoreInScreen,
    showThankYouMsg,
    showCamera,
    countErr,
    setCountErr,
  };
};
