import { useFormikContext } from "formik";
import styles from "./Styles.module.css";

const SwapDirection = () => {
  const formik: any = useFormikContext();

  const handleFlip = () => {
    formik.setFieldValue("input", formik.values.output);
    formik.setFieldValue("output", formik.values.input);
    
    formik.setFieldValue("inputAmount", formik.values.outputAmount);
    formik.setFieldValue("outputAmount", formik.values.inputAmount);
    
    formik.setFieldValue("tokenA", formik.values.tokenB);
    formik.setFieldValue("tokenB", formik.values.tokenA);
  };

  return (
    <div className={styles["overlay"]}>
      <button
        type="button"
        onClick={handleFlip}
        className="bg-slate-800 p-1 outline outline-offset-2 outline-black focus:outline-offset-4 focus:outline-teal-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="#5eead4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
          <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
        </svg>
      </button>
    </div>
  );
};

export default SwapDirection;
