import { promptQuestionPool, reviewPrompt } from "../utils/promptRequests";
const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  nextQuestion: "",
  storeResult: [],
  email: "",
  token: "",
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
    setNextQuestion: (state, action) => {
      state.nextQuestion = action.payload;
    },
    setUserEmail: (state, action) => {
      state.email = action.payload;
    },
    setUserToken: (state, action) => {
      state.token = action.payload;
    },

    setPromptQuestionData: (state, action) => {
      state.promptQuestion = [...state.promptQuestion, action.payload];
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
    setResetReduxState: (state) => {
      state.nextQuestion = "";
      state.storeResult = [];
      state.promptQuestion = [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: promptQuestionPool,
        },
      ];
      state.scorePrompt = [
        {
          role: "assistant",
          content: [
            {
              type: "text",
              text: reviewPrompt,
            },
          ],
        },
      ];
    },
  },
});

export const {
  setPromptQuestionData,
  setNextQuestion,
  setScorePrompt,
  setStoreResult,
  setResetReduxState,
  setUserEmail,
  setUserToken,
} = counterSlice.actions;

export default counterSlice.reducer;
