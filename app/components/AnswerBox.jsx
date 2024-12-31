export const AnswerBox = ({ text }) => (
  <>
    <textarea
      className="w-full h-12 bg-gray-700 p-4 rounded-md text-sm flex items-center justify-center focus:outline-none border border-gray-600"
      readOnly
      value={text}
    />

    <style jsx>{`
      textarea::placeholder {
        text-align: center;
        font-size: 1.125rem;
        color: #a1a1a1;
      }
    `}</style>
  </>
);
