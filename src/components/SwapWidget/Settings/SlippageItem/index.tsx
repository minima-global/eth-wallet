import { useState, useContext, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { debounce } from "lodash";
import { appContext } from "../../../../AppContext";
import CaretIcon from "../../../UI/Icons/CaretIcon";

const SlippageItem = () => {
  const { swapWidgetSettings, updateSwapWidgetSettings } =
    useContext(appContext);
  console.log(swapWidgetSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    swapWidgetSettings && swapWidgetSettings.slippage  && swapWidgetSettings.slippage !== null ? swapWidgetSettings.slippage.toString() : ""
  );
  const [warning, setWarning] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Spring animation for dropdown content
  const animation = useSpring({
    opacity: isOpen ? 1 : 0,
    height: isOpen ? "auto" : 0,
    overflow: "hidden",
    config: { tension: 200, friction: 20 },
  });

  // Debounced function to update swap settings
  const debouncedUpdateSettings = debounce((value) => {
    updateSwapWidgetSettings({ slippage: parseFloat(value) });
  }, 500); // Adjust debounce time as needed

  const handleChangeSlippage = (evt) => {
    const value = evt.target.value;
    
    // Allow numbers with multiple decimal places
    if (value.length === 0 || /^\d+(\.\d{0,2})?$/.test(value)) {
      setInputValue(value);
      const numberValue = parseFloat(value);
      
      // Validation
      if (numberValue < 0.05) {
        setWarning("Slippage below 0.5% may result in a failed transaction");
      } else if (numberValue > 1) {
        setWarning("Your transaction may be frontrun and result in an unfavorable trade");
      } else {
        setWarning("");
      }
  
      // Debounce call to update settings
      updateSwapWidgetSettings({ slippage: numberValue > 50 ? "50" : isNaN(numberValue) ? null : numberValue });
    } else {
      setWarning("");
    }
  };

  // Handle input focus and blur
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Cleanup debounce on unmount
  useEffect(() => {
    if (swapWidgetSettings && swapWidgetSettings.slippage !== null && swapWidgetSettings.slippage < 0.05) {
      setWarning("Slippage below 0.5% may result in a failed transaction");
    } else if (swapWidgetSettings && swapWidgetSettings.slippage > 1) {
      setWarning("Your transaction may be frontrun and result in an unfavorable trade");
    } else {
      setWarning("");
    }


    return () => {
      debouncedUpdateSettings.cancel();
    };
  }, [debouncedUpdateSettings, swapWidgetSettings]);

  return (
    <li className="grid grid-cols-2 items-center px-3 py-2 pb-0 font-bold">
      <h6 className="text-neutral-800 dark:text-neutral-200">Max. slippage</h6>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-neutral-800 p-0 m-0 font-bold dark:text-neutral-200 tracking-wide focus:outline-none text-right flex justify-end items-center"
      >
        {swapWidgetSettings && swapWidgetSettings.slippage && swapWidgetSettings.slippage !== null
          ? swapWidgetSettings.slippage.toString() + "%"
          : "Auto"}

      <span><CaretIcon extraClass={`${isOpen && "rotate-180 transition-all ease-in-out"}`} size={18} fill="currentColor" /></span>
      </button>
      <animated.div
        style={animation}
        className="col-span-3 mt-2 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 text-xs rounded-lg p-2"
      >
        <div>
          <p className="text-neutral-800 dark:text-neutral-400">
            Your transaction will revert if the price changes unfavorably by
            more than this percentage.
          </p>
          <div className="grid grid-cols-1">
            <form className={`mt-3 bg-neutral-100 dark:bg-[#1B1B1B] p-2 text-base rounded-lg grid grid-cols-[1fr_3ch] ${isFocused && "border border-neutral-500 dark:border-neutral-700"}`}>
              <input
                type="text"
                value={inputValue}
                placeholder="0.5"
                className="bg-transparent truncate text-right placeholder:text-neutral-300 placeholder:dark:text-neutral-600 focus:outline-none pr-3"
                onChange={handleChangeSlippage}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <span className="text-right">%</span>
            </form>
            {warning && (
                <p className="dark:text-yellow-500 text-xs col-span-4 mt-3 text-center">
                  {warning}
                </p>
              )}
              
          </div>
        </div>
      </animated.div>
    </li>
  );
};

export default SlippageItem;
