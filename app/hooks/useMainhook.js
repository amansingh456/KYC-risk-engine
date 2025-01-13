"use client";
import { useState, useEffect } from "react";
import { startRecording, stopRecording } from "../utils/recording";
import { getQuestionFromLLM, listen, playAudio } from "../utils/funcs";
import { useDispatch, useSelector } from "react-redux";
import {
  setNextQuestion,
  setReduxEnglishQuestion,
  setReduxHinidQuestion,
  setScorePrompt,
  setStoreResult,
} from "../store/counterSlice";
import {
  createSpeech,
  extractContentFormatted,
  getScore,
  uploadToS3,
} from "../utils/api";
import { englishPrompt, hindiPrompt } from "../utils/promptRequests";

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
  const {
    language,
    scorePrompt,
    storeResult,
    token,
    email,
    reduxHindiQuestion,
    reduxEnglishQuestion,
  } = useSelector((state) => state.counterSlice);

  const [promptHinidQuestion, setPromptHinidQuestionData] = useState([
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "user",
      content: hindiPrompt(token),
    },
  ]);
  const [promptEnglishQuestion, setPromptEnglishQuestionData] = useState([
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "user",
      content: englishPrompt(token),
    },
  ]);

  const dispatch = useDispatch();
  const regex = /\b(thank\s?you|thankyou)\b[\W]*$/i;
  const wantVoice = language === "English" ? "en-IN-isha" : "hi-IN-ayushi";
  const wantNative = language === "English" ? "en-IN" : "hi-IN";
  const obj =
    language === "English" ? promptEnglishQuestion : promptHinidQuestion;
  const nextFollowingObject =
    language === "English"
      ? [...reduxEnglishQuestion]
      : [...reduxHindiQuestion];

  const handleStart = async () => {
    if (isHandleStartClicked) return;
    setIsHandleStartClicked(true);
    const isOK = await startRecording();
    if (isOK) {
      setIsProcessStart(true);

      //! First Question
      try {
        setIsLoading(true);
        const initialQuestion = await getQuestionFromLLM(obj);
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
    language === "English"
      ? dispatch(setReduxEnglishQuestion({ role: "system", content: question }))
      : dispatch(setReduxHinidQuestion({ role: "system", content: question }));

    nextFollowingObject.push({ role: "system", content: question });

    dispatch(setScorePrompt(JSON.stringify({ question: question })));
    dispatch(setStoreResult({ ques: question }));

    let voice;
    try {
      voice = await createSpeech(question);
      const audioBlob = new Blob([voice.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      // //! use myra.ai for girl best audio....
      // voice = await createSpeech(question, wantVoice, wantNative);
      // const audioUrl = voice.audioFile;
      // const audio = new Audio(audioUrl);

      setIsSystemSpeaking(true);
      setIsLoading(false);
      setShowAnsBox(question);

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
      userAnswer = await listen(wantNative);
      if (!userAnswer) throw new Error("No response detected");

      setIsLoading(true);
      setShowSpinerTimer(false);
      setShowAnsBox(false);

      language === "English"
        ? dispatch(
            setReduxEnglishQuestion({ role: "user", content: userAnswer })
          )
        : dispatch(
            setReduxHinidQuestion({ role: "user", content: userAnswer })
          );

      nextFollowingObject.push({ role: "user", content: userAnswer });

      dispatch(setScorePrompt(JSON.stringify({ answer: userAnswer })));
      dispatch(setStoreResult({ ans: userAnswer }));

      const nextQues = await getQuestionFromLLM(nextFollowingObject);
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
      setShowReviewButton(false);
      setIsLoading(true);

      const vidUrl = await stopRecording();

      const blob = new Blob([vidUrl], { type: "video/webm" });
      const names = `detex-data/recording-${Date.now()}.webm`;
      const videoFile = new File([blob], names, { type: "video/webm" });
      const dataOfVdo = await uploadToS3(videoFile);
      const scoreResult = await getScore(scorePrompt);
      const r = await extractContentFormatted(scoreResult);

      setIsLoading(false);
      dispatch(setStoreResult({ confidenceScore: r }));
      dispatch(setStoreResult({ videoLink: dataOfVdo?.fileUrl }));
      dispatch(setStoreResult({ email: email }));
      dispatch(setStoreResult({ token: token }));
      setShouldSaveData(true);
    } catch (error) {
      setErrorx("Something went wrong..!");
      console.log("Error posting data to the API:", error);
    } finally {
      SetShowCamera(false);
      setShowThankYouMsg(true);
      setShowAnsBox(false);
      setIsLoading(false);
      setIsSystemSpeaking(false);
      setQuestionCount(0);
      setShowSpinerTimer(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const saveData = async () => {
      if (shouldSaveData) {
        try {
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
          console.error("Error saving data:", error.message);
        } finally {
          SetShowCamera(false);
          setShowThankYouMsg(true);
          setShowAnsBox(false);
          setIsLoading(false);
          setIsSystemSpeaking(false);
          setShowSpinerTimer(false);
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
    showThankYouMsg,
    showCamera,
    setCountErr,
    setShouldSaveData,
  };
};
