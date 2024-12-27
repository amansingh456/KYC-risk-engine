export const AnswerBox = () => (
  <>
    <textarea
      className="w-full h-32 bg-gray-700 p-4 rounded-md text-sm focus:outline-none border border-gray-600"
      placeholder="speak..."
      readOnly
    ></textarea>

    <style jsx>{`
      textarea::placeholder {
        text-align: center;
        font-size: 1.125rem;
        color: #a1a1a1;
      }
    `}</style>
  </>
);
