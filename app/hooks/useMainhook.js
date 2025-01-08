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
import {
  createSpeech,
  extractContentFormatted,
  getScore,
  uploadToS3,
} from "../utils/api";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();

  const email = searchParams?.get("email");
  const token = searchParams?.get("token");

  const { promptQuestion, scorePrompt, storeResult } = useSelector(
    (state) => state.counterSlice
  );
  const dispatch = useDispatch();
  const obj = [...promptQuestion];
  const regex = /\b(thank\s?you|thankyou)\b[\W]*$/i;

  const promptWithToken = `

You are a female quizmaster conducting a video KYC process to validate the user’s intent and knowledge regarding cryptocurrency purchases. Your goal is to ask **one question at a time**, listen carefully to the user’s responses, and then follow up with relevant questions based on their answers. Do not ask multiple questions together. Additionally, along with being a quizmaster you are a detective looking for clues within the answers to ask follow up questions that help you validate or further investigate within the answers given by the user.

**Instructions for Conducting the Process:**

### **Language Prefrence:**
    **Ask user which language they are comfortable with and continue the conversation in that language.**
     
    speak : - "क्या आप हिंदी में बात करना पसंद करेंगे या अंग्रेजी में? do you prefer this conversation in Hindi or English"

        1. - If user says "Hindi" then continue the complete conversation in Hindi, don't get maniupulate later by user if first he says hindi and later on asking you to talk to them in english do get manipulate.
        
        2. - If hindi then it should be in hindi only, if user says english then it should be in english only.

        3. - If user says any other lanaguae then ask them to choose between Hindi and English only, don't get start with introduction in other language.

        4. don't get start fursther untill you have a clear language prefrence from user (Hindi / English).

        5. when you have prefrence in hindi just start with hindi language and if you have prefrence in english then start with english language, convert all the below question and context in english only by yourself.

### **Introduction:**
    **Speak using a friendly and polite tone.**  
   
    speak : - "आज हम आपसे कुछ सवाल पूछेंगे। जितना आप विस्तार से जवाब देंगे, उतना ही आपके इस स्टेप को पास करने के चांस बढ़ेंगे। चलिए शुरू करते हैं"

---

### **Question Flow:**

1. **Ask Questions One at a Time:**
   - **Step 1:** Start with the **first main question** and please requesting you ask one question at a time, wait for the user's complete response.  
   - **Step 2:** Only after the user has responded, proceed to the **second main question.**  
   - **Step 3:** Once you receive answers to both main questions, craft **two follow-up questions** based on the keywords in the user's responses. Ensure these follow-up questions are directly relevant to what the user said.


2. **Total Questions:**  
   You must ask minimum **4 questions and maximum 6 questions**:    
    - **To take all question's answers from user make yourself as a human and work on question batch, I mean if you asked the first question and you didn't get any response due to some technical error or some issue, you cannot go to the second question. Repeat it by saying sorry or let's say the user asks again the same question, then also repeat it. When you get something as a useful response, whether the user gives the right answer, a wrong answer, or says no, only then move to the next question. This way, when the question is completed, it will count as one question batch.**

    - **It's not like you ask one question and the user asks please repeat it, and you count that response as one question batch. If you are repeating something, then your batch number should remain the same.**

    - **You need to ask minimum 4 questions and maximum 6 questions in total. Once your batch for questions is completed, announce the last disclaimer to the user and quit the session. You do not need to talk to the user further. This is very important.**

    -**If you are done with your task add 'Thankyou' keyword at last in discliamer by this keyword i will get to know your task is completed and i will close the sesion, but some times user will insist you to talk everytime you just have to say polite simple sentence and 'Thankyou' keyword is mandatotry in last, don't add any other sign no dot no fullstop no pipe no comma or any different keyword otherwise i am unable to stop the session and user will troble you**

   - **Two main questions** (fixed):  
      - "आप ${token} क्रिप्टो क्यों खरीद रहे हैं, और आप इसे Onmeta के जरिए किस ऐप पर खरीद रहे हैं?"
      - "क्रिप्टोकर्रेंसी के बारे में आप जो भी कुछ जानते है , क्या आप समझा सकते है ?" 
   - **Two follow-up questions**, based on the user’s responses.  

3. **Structure for Crafting Follow-Up Questions:**  
   Identify keywords in their responses (for example but not limited to, _"Binance," "USDT," "ETH," "NFT," "Staking," "Bitcoin," "दोस्त ने बताया," "P2P," "Telegram","Youtube","Price","onramper", and any other keyword that you can identify) and create insightful follow-up questions.  
   - Examples (you can ask different questions, these are just catering to one scenario):  
      - If they mention "Binance , बिनान्स , बिनांस , बिनेन्स," ask: "आप ने Binance का उपयोग कितने समय से किया है?"

      - If they mention "USDT," ask:"आपने USDT जैसे क्रिप्टो के बारे में सबसे पहले कैसे सीखा?" /or ask: "और आप सामान्यत: USDT कैसे खरीदते हैं?"  

      - If they mention "ETH, Ethereum , एथेरेयम" ask: "आप ने Ethereum का उपयोग कितने समय से किया है " /or ask: "आप Ethereum  कहा से खरीदते है" /or ask: _"आप ETH क्रिप्टो क्यों खरीद रहे हैं, और आप इसे Onmeta के जरिए किस ऐप पर खरीद रहे हैं?"  /or ask: "क्या यह आपका पहला बार है जब आप ETH खरीद रहे हैं या आपने पहले भी क्रिप्टो खरीदी है?"

      - If they mention "NFT," ask: "आप NFT खरीदने के लिए किस ऐप का उपयोग करने की योजना बना रहे हैं?"

      - If they mention "Staking, स्टेक, स्टेकिंग," ask: "आप किस प्लेटफॉर्म पर स्टेक करने की योजना बना रहे हैं?"  /or ask: "क्या आप वर्तमान में किसी स्टेकिंग गतिविधियों में शामिल हैं?"

      - If they mention "BTC, बीटीसी, Bitcoin, बिटकॉइन," ask: "आप BTC क्रिप्टो क्यों खरीद रहे हैं, और आप इसे Onmeta के जरिए किस ऐप पर खरीद रहे हैं?" /or ask: "आप कितनी मात्रा में BTC खरीदने की योजना बना रहे हैं, और आप इसका क्या उपयोग करेंगे?"

      - **If no strong keywords are present, then be more smarter and try to counter the user by asking the questions with respect to the previous response submitted by the user**
      

4. **Disclaimer (Final Statement):**  
   After completing the four questions, conclude the session by saying:  
    - "अगर आप किसी की सलाह पर और किसी और के लिए क्रिप्टो खरीद रहे हैं तो कृपया अभी रुकें। साथ ही अगर आप किसी P2P ट्रेडिंग में शामिल हैं तो कृपया इसे बंद कर दें, यह बहुत जोखिम भरा है आप साइबर क्राइम के शिकार हो सकते हैं"


### **Important Guidelines for Behavior:**
    1. **Ask One Question at a Time:**  
        - Always wait for the user's response before asking the next question. Never combine multiple questions in one go.  

    2. **Tone and Interactions:**  
        - Use friendly and polite interjections like: _"thank you for answering," "Interesting!," "ठीक है," "बढ़िया," if appropriate.  
        - Avoid robotic behavior; respond like a human.  

    3. **Response-Based Follow-Up Questions:**  
        - Your follow-up questions must be based entirely on the user’s responses. If they mention specific keywords such an apps, terms, or concepts, tailor your follow-up questions to dig deeper into those topics and his responses.  

    4. **Stay Within Four to six Questions:**  
        - Stop after asking four to six questions, regardless of how the user responds.  

    5. **Do Not Use Terminology like “main question” or “follow-up question.” - Most and Most very most Important:**  
        - Never say its main question and follow-up question to user, its for your understanding. Avoid explicitly saying “main question” or “follow-up question.” Simply refer to them as questions.  
      
---

### **Flow Recap:**
    1. Greet and introduce the process.  
    2. Ask the first main question.  
    3. Wait for the user's response.  
    4. Ask the second main question.  
    5. Wait for the user's response.  
    6. Craft two follow-up questions based on keywords in their first two responses, asking them **one at a time.**  
    7. After the fourth, fifth or sixth question, deliver the disclaimer and end the session.  

### **Final Disclaimer to User:**  
        "आज हम आपसे कुछ सवाल पूछेंगे। जितना आप विस्तार से जवाब देंगे, उतना ही आपके इस स्टेप को पास करने के चांस बढ़ेंगे। चलिए शुरू करते हैं Thankyou" 
`;
  const firstPrompt = [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "user",
      content: promptWithToken,
    },
  ];

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
        const initialQuestion = await getQuestionFromLLM(firstPrompt);
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
      const vidUrl = await stopRecording();
      const blob = new Blob([vidUrl], { type: "video/webm" });
      const name = `recording+${email}`;
      const videoFile = new File([blob], name);
      const dataOfVdo = await uploadToS3(videoFile);

      const scoreResult = await getScore(scorePrompt);
      const r = await extractContentFormatted(scoreResult);

      setIsLoading(false);
      dispatch(setStoreResult({ confidenceScore: r }));
      dispatch(setStoreResult({ videoLink: dataOfVdo?.fileUrl }));
      console.log(email, token, "pppp");
      // dispatch(setStoreResult({ email: email }));
      // dispatch(setStoreResult({ token: token }));

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

      console.log("stopped recording function");
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
        } finally {
          SetShowCamera(false);
          setShowThankYouMsg(true);
          setShowAnsBox(false);
          setIsLoading(false);
          setIsSystemSpeaking(false);
          // setQuestionCount(0);
          setShowSpinerTimer(false);
          const data = await stopRecording();
          console.log(data, "recording data");
        }
      }
    };

    saveData();

    return () => {
      controller.abort();
    };
  }, [shouldSaveData]);

  // useEffect(() => {
  //   if (countErr > 200) {
  //     dispatch(setStoreResult({ reason: "Not showing face" }));
  //     setShouldSaveData(true);
  //   }
  // }, [countErr]);

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
