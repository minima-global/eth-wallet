import { useContext } from "react";
import { appContext } from "../../AppContext";
import SelectNetwork from "../SelectNetwork";
import AppThemeSwitch from "../AppThemeSwitch";
import AnimatedDialog from "../UI/AnimatedDialog";
import Cross from "../UI/Cross";

const Settings = () => {
  const { _promptSettings, promptSettings, promptJsonRpcSetup } =
    useContext(appContext);


  return (    
      <AnimatedDialog display={_promptSettings} dismiss={promptSettings}>
        <div className="">
          <div className="flex justify-between items-center pr-4">
            <h3 className="font-bold ml-4">Settings</h3>
            <Cross dismiss={promptSettings} />
          </div>
          <SelectNetwork />

          <div
            className="my-4 p-2 hover:cursor-pointer bg-gray-50 bg-opacity-80 dark:bg-[#1B1B1B] hover:bg-opacity-30 dark:bg-opacity-50 grid grid-cols-[auto_1fr] items-center gap-1"
            onClick={promptJsonRpcSetup}
          >
            <span className=" dark:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="32"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z" />
                <path d="M15 9h.01" />
              </svg>
            </span>
            <p className="font-bold pl-2">Setup API Keys</p>
          </div>

          <div className="flex justify-center my-3">
            <AppThemeSwitch />
          </div>
        </div>
      </AnimatedDialog>
  );
};

export default Settings;
