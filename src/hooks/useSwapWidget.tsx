import { useState } from "react";

const useSwapWidget = () => {
  const [swapDirection, setSwapDirection] = useState<"wminima" | "usdt">(
    "usdt"
  );

  return {
    swapDirection,
    setSwapDirection,
  };
};

export default useSwapWidget;
