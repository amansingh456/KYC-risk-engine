import React, { useEffect, useState, useRef } from "react";

export const AnswerBox = ({ text }) => {
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const words = text.split(" ");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (words.length > 5 && !animationCompleted) {
      const interval = setInterval(() => {
        setHighlightIndex((prev) => {
          if (prev + 1 === words.length) {
            setAnimationCompleted(true);
            clearInterval(interval);
          }
          return (prev + 1) % words.length;
        });
      }, 450);
      return () => clearInterval(interval);
    }
  }, [words.length, animationCompleted]);

  useEffect(() => {
    if (!animationCompleted) {
      const highlightedElement = scrollRef.current?.querySelector(
        `span[data-index="${highlightIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
    }
  }, [highlightIndex, animationCompleted]);

  return (
    <>
      <div
        ref={scrollRef}
        className="w-full h-auto max-h-[100px] overflow-y-auto overflow-x-hidden p-2 rounded-md text-sm text-black text-center focus:outline-none border border-[#DCDCDC]"
      >
        {words.map((word, index) => (
          <span
            key={index}
            data-index={index}
            style={{
              color: index === highlightIndex ? "green" : "black",
              fontWeight: index === highlightIndex ? "bold" : "",
              marginRight: "4px",
              display: "inline-block",
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </>
  );
};
