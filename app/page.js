"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

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
        className="relative w-[375px] h-[667px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-2xl flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Header */}
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
          Video KYC
        </h1>

        {/* Button */}
        <button
          onClick={() => router.push("/check")}
          className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition duration-300"
        >
          Let's Start
        </button>
        <footer className="text-[12px] text-black italic flex items-right justify-right mt-10">
          Powered By
          <span className="font-bold  rounded-md pl-1">DETEX.Tech</span>
        </footer>
      </motion.div>
    </div>
  );
}
