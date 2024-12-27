import { promptQuestionPool, reviewPrompt } from "../utils/promptRequests";
const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  isProcessStart: false,
  isLoading: false,
  isSystemSpeaking: false,
  showAnsBox: false,
  showSpinerTimer: false,
  appendData: {},
  questionCount: 0,
  nextQuestion: "",
  promptQuestion: [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "user",
      content: promptQuestionPool,
    },
  ],
  scorePrompt: [
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: reviewPrompt,
        },
      ],
    },
  ],
};

const counterSlice = createSlice({
  name: "counterSlice",
  initialState,
  reducers: {
    setIsProcessStart: (state, action) => {
      state.isProcessStart = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setIsSystemSpeaking: (state, action) => {
      state.isSystemSpeaking = action.payload;
    },
    setShowAnsBox: (state, action) => {
      state.showAnsBox = action.payload;
    },
    setShowSpinerTimer: (state, action) => {
      state.showSpinerTimer = action.payload;
    },
    setNextQuestion: (state, action) => {
      state.nextQuestion = action.payload;
    },
    setQuestionCount: (state, action) => {
      state.questionCount = state.questionCount + 1;
    },
    setAppendData: (state, action) => {
      state.appendData = action.payload;
    },
    setPromptQuestionData: (state, action) => {
      state.promptQuestion = [...state.promptQuestion, action.payload];
    },
    setScorePrompt: (state, action) => {
      const reviewPromptContent = state.scorePrompt[0]?.content[0]?.text || "";
      const newString = action.payload;

      // Update the text field with the new string appended
      state.scorePrompt[0].content[0].text = reviewPromptContent
        ? `${reviewPromptContent} ${newString}` // Append with a space if not empty
        : newString; // Otherwise, just set the new string
    },
  },
});

export const {
  setAppendData,
  setShowSpinerTimer,
  setShowAnsBox,
  setIsSystemSpeaking,
  setIsLoading,
  setIsProcessStart,
  setPromptQuestionData,
  setQuestionCount,
  setNextQuestion,
  setScorePrompt,
} = counterSlice.actions;

export default counterSlice.reducer;
