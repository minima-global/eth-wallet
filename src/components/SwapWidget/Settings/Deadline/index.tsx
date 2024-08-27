import { useState, useContext, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { debounce } from "lodash";
import { appContext } from "../../../../AppContext";
import Decimal from "decimal.js";
import CaretIcon from "../../../UI/Icons/CaretIcon";

const Deadline = () => {
  const { swapWidgetSettings, updateSwapWidgetSettings } =
    useContext(appContext);
  console.log(swapWidgetSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    swapWidgetSettings && swapWidgetSettings.deadline && swapWidgetSettings.deadline !== null ? swapWidgetSettings.deadline.toString() : ""
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
    updateSwapWidgetSettings({ deadline: parseFloat(value) });
  }, 500); // Adjust debounce time as needed

  const handleChangeDeadline = (evt) => {
    const value = evt.target.value;

    // Allow empty input and integers between 1 and 1000
    if (value.length === 0 || /^[0-9][0-9]{0,3}$/.test(value)) {
      setInputValue(value);
      const numberValue = parseInt(value, 10);

      // Validation
      if (value.length === 0) {
        setWarning(""); // No warning for empty input
      } else if (numberValue < 1) {
        setWarning("Deadline must be greater than 0.");
      } else if (numberValue > 4320) {
        setWarning("Deadline must be less than or equal to 1000.");
      } else {
        setWarning("");
        // Debounce call to update settings
      }

      updateSwapWidgetSettings({ deadline: numberValue > 4320 ? 4320 : numberValue < 1 ? 1 : isNaN(numberValue) ? null : numberValue });
    } else {
      setWarning("");
    }
  };

  // Handle input focus and blur
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSettings.cancel();
    };
  }, [debouncedUpdateSettings]);

   const deadline = swapWidgetSettings&& swapWidgetSettings.deadline && swapWidgetSettings.deadline !== null ? swapWidgetSettings.deadline : null;

  return (
    <li className="grid grid-cols-2 items-center px-3 py-2 pb-0 font-bold">
      <h6 className="text-neutral-800 dark:text-neutral-200">Transaction deadline</h6>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-neutral-800 p-0 m-0 font-bold dark:text-neutral-200 tracking-wide focus:outline-none text-right flex justify-end items-center"
      >
        {swapWidgetSettings && swapWidgetSettings.deadline && swapWidgetSettings.deadline !== null
          ? swapWidgetSettings.deadline + "m"
          : "10m"}

        <span><CaretIcon extraClass={`${isOpen && "rotate-180 transition-all ease-in-out"}`} size={18} fill="currentColor" /></span>
      </button>
      <animated.div
        style={animation}
        className="col-span-3 mt-2 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 text-xs rounded-lg p-2"
      >
        <div>
          <p className="text-neutral-800 dark:text-neutral-400">
          Your transaction will revert if it is pending for more than this period of time.
          </p>
          <div>            
            <form className={`${warning && 'border-2 !border-red-500 !text-red-500'} mt-3 bg-neutral-100 dark:bg-[#1B1B1B] grid grid-cols-[1fr_auto] gap-4 p-2 text-base rounded-lg ${isFocused && "border border-neutral-500 dark:border-neutral-700"}`}>
              <input
                type="text"
                value={inputValue}
                placeholder="10"
                className="bg-transparent text-right truncate placeholder:text-neutral-300 placeholder:dark:text-neutral-600 focus:outline-none"
                onChange={handleChangeDeadline}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <span className="text-right">min{deadline && new Decimal(deadline).gt(1) ? "s": !deadline ? "s" : ""}</span>
            </form>              
          </div>
        </div>
      </animated.div>
    </li>
  );
};

export default Deadline;
