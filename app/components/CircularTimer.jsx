import React, { useState, useEffect } from "react";

const CircularTimer = () => {
  const [seconds, setSeconds] = useState(15);
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    const intervalDuration = 1000;
    if (seconds > 0) {
      const timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
        setPercentage((prev) => prev - 100 / 15);
      }, intervalDuration);
      return () => clearInterval(timer);
    }
  }, [seconds]);

  const circumference = 2 * Math.PI * 45; // Circumference of the circle (2πr = 2 * π * 45)
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

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
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
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
