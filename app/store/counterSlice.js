import { promptQuestionPool, reviewPrompt } from "../utils/promptRequests";
const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
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
    setNextQuestion: (state, action) => {
      state.nextQuestion = action.payload;
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

export const { setPromptQuestionData, setNextQuestion, setScorePrompt } =
  counterSlice.actions;

export default counterSlice.reducer;
