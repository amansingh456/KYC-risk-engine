export const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center ">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 border-4 border-transparent border-t-green-700 border-b-green-600 rounded-full animate-spin"></div>
      <div className="absolute inset-4 border-4 border-transparent border-t-green-600 border-b-green-700 rounded-full animate-ping"></div>
    </div>
    <p className="text-lg font-semibold text-black animate-pulse">
      ...Loading!
    </p>
  </div>
);
