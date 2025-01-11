"use client";
import { useEffect, Suspense } from "react";
import animationData from "../public/animationLottie.json";
import Toggel from "./components/Toggel";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUserEmail, setUserToken } from "./store/counterSlice";
import dynamic from "next/dynamic";

const LottieNoSSR = dynamic(() => import("lottie-react"), { ssr: false });

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  useEffect(() => {
    if (email && token) {
      dispatch(setUserEmail(email));
      dispatch(setUserToken(token));
    }
  }, [email, token]);
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black items-center justify-center">
      <div className="w-[375px] h-[600px] bg-gradient-to-b from-green-50 to-white rounded-3xl shadow-2xl flex flex-col justify-between p-6">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-4">
          Video KYC
        </h1>

        <div className="w-full h-[30%] flex items-center justify-center">
          <LottieNoSSR
            animationData={animationData}
            loop={true}
            className="w-60"
          />
        </div>

        <p className="text-lg font-bold text-gray-700 text-center mb-4">
          Let’s first get to know you...
        </p>

        <div className="flex justify-center items-center">
          <label className="text-sm  text-gray-700 text-center">
            Prefer Language ?
          </label>

          <Toggel />
        </div>

        {/* Footer */}
        <footer className="mt-6">
          <button
            onClick={() => router.push("/check")}
            className="bg-gradient-to-r from-green-300 to-green-700 p-2 rounded-lg w-[100%] text-white font-bold"
          >
            Let's Start
          </button>
          <div className="italic text-sm flex items-end justify-end text-black mt-1">
            Powered By
            <span className="font-bold pl-1">DETEX.Tech</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
