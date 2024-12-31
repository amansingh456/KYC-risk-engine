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
  setNextQuestion,
  setPromptQuestionData,
  setQuestionCount,
  setScorePrompt,
} from "../store/counterSlice";
import { Instructions } from "../components/Instructions";
import { LoadingAnimation } from "../components/Loading";
import { SpeakingAnimation } from "../components/Speaking";
import { AnswerBox } from "../components/AnswerBox";
import { useRouter } from "next/navigation";

export default function Interaction() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [showReviewButton, setShowReviewButton] = useState(false);
  const [showResult, setShowResult] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessStart, setIsProcessStart] = useState(false);
  const [isSystemSpeaking, setIsSystemSpeaking] = useState(false);
  const [showSpinerTimer, setShowSpinerTimer] = useState(false);
  const [storeResult, setStoreResult] = useState([]);
  const [showAnsBox, setShowAnsBox] = useState(false);
  const [ansBoxValue, setAnsBoxValue] = useState("");
  const [showWebCamera, setShowWebCamera] = useState(true);
  const [showThankYouMsg, setShowThankYouMsg] = useState(false);
  const { promptQuestion, questionCount, nextQuestion, scorePrompt } =
    useSelector((state) => state.counterSlice);

  let obj = [...promptQuestion];

  const addToStoreResult = (value) => {
    setStoreResult((prevStoreResult) => [...prevStoreResult, value]);
  };

  const handleStart = async () => {
    const isOK = await startRecording();
    if (isOK) {
      setIsProcessStart(true);
      //! system Intro
      setIsLoading(true);
      const voice = await createSpeech(
        "नमस्कार, मै डिटेक्स की केवाईसी एजेंट हू"
      );

      try {
        const audioBlob = new Blob([voice.data], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        // const audioUrl = voice.audioFile;
        // const audio = new Audio(audioUrl);

        setIsLoading(false);
        setAnsBoxValue("नमस्कार, मै डिटेक्स की केवाईसी एजेंट हू");
        setShowAnsBox(true);
        setIsSystemSpeaking(true);
        await playAudio(audio);

        setIsSystemSpeaking(false);
        setShowAnsBox(true);
        setAnsBoxValue("");
      } catch (error) {
        console.log("Error playing audio:", error);
      }

      //! system Intro complete

      //! First Question ...
      setIsLoading(true);
      const initialQuestion = await getQuestionFromLLM(promptQuestion);
      dispatch(setNextQuestion(initialQuestion));
      dispatch(setQuestionCount());
      setIsLoading(false);
    }
  };

  const handleFlow = async (question) => {
    setIsLoading(true);
    dispatch(setPromptQuestionData({ role: "system", content: question }));
    dispatch(setScorePrompt(JSON.stringify({ question: question })));
    addToStoreResult({ ques: question });
    obj.push({ role: "system", content: question });
    const voice = await createSpeech(question);

    try {
      const audioBlob = new Blob([voice.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      // const audioUrl = voice.audioFile;
      // const audio = new Audio(audioUrl);
      setIsLoading(false);
      setAnsBoxValue("Question .... !!");
      setShowAnsBox(true);
      setIsSystemSpeaking(true);
      await playAudio(audio);
      setIsSystemSpeaking(false);
      setShowAnsBox(false);
      setAnsBoxValue("");
    } catch (error) {
      console.error("Error playing audio:", error);
    }

    const regex = /\b(thank\s?you|thankyou)\b[\W]*$/i;
    const isStop = regex.test(question);
    console.log(isStop, question);

    if (isStop) {
      setShowReviewButton(true);
      return;
    }

    setShowSpinerTimer(true);
    setAnsBoxValue("Speak Now...I'm listening !!");
    setShowAnsBox(true);
    const userAnswer = await listen();
    setShowSpinerTimer(false);
    setShowAnsBox(false);
    setAnsBoxValue("");

    if (userAnswer) {
      dispatch(setPromptQuestionData({ role: "user", content: userAnswer }));
      dispatch(setScorePrompt(JSON.stringify({ answer: userAnswer })));
      obj.push({ role: "user", content: userAnswer });
      addToStoreResult({ ans: userAnswer });
      setIsLoading(true);
      const nextQues = await getQuestionFromLLM(obj);
      dispatch(setNextQuestion(nextQues));
      setIsLoading(false);
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
    setIsLoading(true);
    setShowReviewButton(false);
    const scoreResult = await getScore(scorePrompt);
    const r = await extractContentFormatted(scoreResult);
    setShowResult(r);
    setIsLoading(false);
    addToStoreResult({ confidenceScore: r });
    try {
      const response = await fetch("/api/postResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeResult),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Data successfully saved to MongoDB:", data);
      } else {
        const errorData = await response.json();
        console.error("Failed to save data:", errorData);
      }
    } catch (error) {
      console.error("Error posting data to the API:", error);
    }
    await stopRecording();
    setAnsBoxValue("");
    setIsLoading(false);
    setIsSystemSpeaking(false);
    setShowSpinerTimer(false);
    setShowWebCamera(false);
    setShowThankYouMsg(true);
  };

  const takeToHome = () => {
    setAnsBoxValue("");
    setIsLoading(false);
    setIsSystemSpeaking(false);
    setShowSpinerTimer(false);
    setShowWebCamera(false);
    setIsProcessStart(false);
    router.push("/");
  };

  useEffect(() => {
    if (questionCount > 0 && questionCount <= 10) {
      handleFlow(nextQuestion);
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
          <div className="w-[full]  rounded-md bg-gray-800  flex flex-col items-center justify-center overflow-hidden">
            {showWebCamera && <WebcamCapture />}
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

          {showReviewButton && (
            <button
              onClick={handleReview}
              className="px-6 py-3 w-full text-black text-xl bg-white rounded-md hover:bg-slate-50 transition"
            >
              Review
            </button>
          )}

          {showThankYouMsg && (
            <div className="flex flex-col items-center justify-center py-4 bg-white rounded-xl">
              <p className="text-2xl text-green-500 text-center">
                Thank You for your time... 🙂
              </p>
              <button className="p-2 rounded-3xl border border-black text-black">
                Start Again
              </button>
            </div>
          )}
          {showResult && (
            <p className="flex justify-center items-center">{showResult}</p>
          )}
          {showAnsBox && !isLoading && <AnswerBox text={ansBoxValue} />}

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
        <footer className="text-[12px] italic flex items-end justify-end">
          Powered By
          <span className="font-bold  rounded-md pl-1">DETEX.Tech</span>
        </footer>
      </div>
    </>
  );
}
