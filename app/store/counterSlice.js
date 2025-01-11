import {
  englishPromptCopy,
  hindiPromptCopy,
  reviewPrompt,
} from "../utils/promptRequests";
const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  nextQuestion: "",
  storeResult: [],
  email: "",
  token: "",
  language: "English",
  reduxHindiQuestion: [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "user",
      content: hindiPromptCopy,
    },
  ],
  reduxEnglishQuestion: [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "user",
      content: englishPromptCopy,
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
    setNextQuestion: (state, action) => {
      state.nextQuestion = action.payload;
    },
    setUserEmail: (state, action) => {
      state.email = action.payload;
    },
    setUserToken: (state, action) => {
      state.token = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },

    setReduxHinidQuestion: (state, action) => {
      state.reduxHindiQuestion = [...state.reduxHindiQuestion, action.payload];
    },

    setReduxEnglishQuestion: (state, action) => {
      state.reduxEnglishQuestion = [
        ...state.reduxEnglishQuestion,
        action.payload,
      ];
    },

    setStoreResult: (state, action) => {
      state.storeResult = [...state.storeResult, action.payload];
    },
    setScorePrompt: (state, action) => {
      const reviewPromptContent = state.scorePrompt[0]?.content[0]?.text || "";
      const newString = action.payload;

      state.scorePrompt[0].content[0].text = reviewPromptContent
        ? `${reviewPromptContent} ${newString}`
        : newString;
    },
  },
});

export const {
  setReduxHinidQuestion,
  setReduxEnglishQuestion,
  setNextQuestion,
  setScorePrompt,
  setStoreResult,
  setUserEmail,
  setUserToken,
  setLanguage,
} = counterSlice.actions;

export default counterSlice.reducer;
