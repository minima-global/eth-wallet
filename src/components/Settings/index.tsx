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
                  
                  <h3 className="font-bold ml-4">Settings</h3>

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
