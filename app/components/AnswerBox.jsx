export const AnswerBox = ({ text }) => (
  <>
    <textarea
      className="w-full h-12 p-4 rounded-md text-sm text-black text-center focus:outline-none border border-[#DCDCDC]"
      readOnly
      value={text}
      placeholder="Enter your answer"
    />

    <style jsx>{`
      textarea {
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      textarea::placeholder {
        text-align: center;
        font-size: 1.125rem;
        color: black;
      }
    `}</style>
  </>
);
