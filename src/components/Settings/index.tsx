import { useContext } from "react";
import { appContext } from "../../AppContext";
import Dialog from "../UI/Dialog";
import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";
import SelectNetwork from "../SelectNetwork";

const Settings = () => {
  const { _promptSettings, promptSettings } = useContext(appContext);

  const springProps = useSpring({
    opacity: _promptSettings ? 1 : 0,
    transform: _promptSettings
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.gentle,
  });

  if (!_promptSettings) {
    return null;
  }

  return (
    <>
      {_promptSettings &&
        createPortal(
          <Dialog dismiss={promptSettings}>
            <div className="h-full grid items-start">
              <animated.div style={springProps}>
                <div className="bg-white shadow-lg mt-[80px] shadow-slate-300  dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
                  <div className="flex justify-between items-center pr-4">
                    <h3 className="font-bold ml-4">Settings</h3>
                    <svg
                      onClick={promptSettings}
                      xmlns="http://www.w3.org/2000/svg"                      
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 6l-12 12" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </div>

                  <SelectNetwork />
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}
    </>
  );
};

export default Settings;
