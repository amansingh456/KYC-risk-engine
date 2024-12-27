export const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center ">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 border-4 border-transparent border-t-gray-500 border-b-gray-100 rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-transparent border-t-gray-100 border-b-gray-500 rounded-full animate-spin-slow"></div>
    </div>
    <p className="text-lg font-semibold text-gray-300 animate-pulse">
      ...Loading!
    </p>
  </div>
);
