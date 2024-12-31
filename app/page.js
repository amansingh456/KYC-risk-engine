"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {}, [router]);
  return (
    <div className="flex h-screen bg-black items-center justify-center relative">
      {/* Gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-[-1]"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      ></motion.div>

      {/* Main card */}
      <motion.div
        className="relative w-[375px] h-[667px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-2xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Header */}
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
          Video KYC{" "}
        </h1>

        <button
          text="Start Interaction"
          onClick={() => router.push("/auth")}
          className="relative px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-transform duration-300"
        >
          Let's Start
        </button>
      </motion.div>
    </div>
  );
}
