import React, { useState, useEffect } from "react";

const CircularTimer = () => {
  const [seconds, setSeconds] = useState(10);
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
        setPercentage((prev) => prev - 10);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setPercentage(0);
    }
  }, [seconds]);

  return (
    <div>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#4B5563"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#ffffff"
          strokeWidth="10"
          fill="none"
          strokeDasharray="282.6" /* Circumference of the circle (2 * Math.PI * r) */
          strokeDashoffset={282.6 - (282.6 * percentage) / 100}
          strokeLinecap="round"
          className="transition-stroke-dashoffset duration-1000 ease-linear"
        />
      </svg>

      {/* Timer Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-white text-6xl font-bold">{seconds}</span>
          <p className="text-gray-400 text-sm mt-2">Seconds Left</p>
        </div>
      </div>
    </div>
  );
};

export default CircularTimer;
