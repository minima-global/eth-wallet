import { useFormikContext } from "formik";
import { useContext } from "react";
import { appContext } from "../../../AppContext";
import SwitchIcon from "../../UI/Icons/SwitchIcon";

const SwapDirection = () => {
  const formik: any = useFormikContext();

  const { setSwapDirection } = useContext(appContext);

  const handleFlip = () => {
    formik.setFieldValue("locked", null);
    formik.setFieldValue("gas", null);

    formik.setFieldValue("input", formik.values.output);
    formik.setFieldValue("output", formik.values.input);
    
    formik.setFieldValue("inputAmount", "0");
    formik.setFieldValue("outputAmount", "0");
    
    formik.setFieldValue("tokenA", formik.values.tokenB);
    formik.setFieldValue("tokenB", formik.values.tokenA);

    setSwapDirection(prevState => prevState === 'wminima' ? 'usdt' : 'wminima');
  };

  return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <hr className="border border-neutral-500 my-6 w-full" />
        <button
        type="button"
        onClick={handleFlip}        
        className={`w-max text-neutral-800 dark:text-neutral-300`}
        
      >
        <SwitchIcon fill="currentColor" />
      </button>
        <hr className="border border-neutral-500 my-6 w-full" />
      </div>
  );
};

export default SwapDirection;
