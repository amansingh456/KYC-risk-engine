import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../store/counterSlice";

const LanguageToggle = () => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.counterSlice);

  const toggleLanguage = () => {
    dispatch(setLanguage(language === "English" ? "Hindi" : "English"));
  };

  return (
    <div className="flex items-center space-x-4 ml-2">
      <span className="text-gray-700 w-[60px] font-bold text-center">
        {language}
      </span>
      <button
        onClick={toggleLanguage}
        className={`relative w-14 h-8 ${
          language == "English" ? "bg-green-200" : "bg-[#d6d8ea]"
        } rounded-full flex items-center p-1 transition-all`}
      >
        <div
          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
            language === "Hindi"
              ? "translate-x-6  !bg-[#8a94ee]"
              : "translate-x-0  !bg-green-500"
          }`}
        ></div>
      </button>
    </div>
  );
};

export default LanguageToggle;
