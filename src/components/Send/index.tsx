import { useContext } from "react";
import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";
import { appContext } from "../../AppContext";
import Dialog from "../UI/Dialog";
import { Formik } from "formik";

import styles from "./Balance.module.css";

const Send = () => {
  const { _currentNavigation, handleNavigation } = useContext(appContext);

  const springProps = useSpring({
    opacity: _currentNavigation === "send" ? 1 : 0,
    transform:
      _currentNavigation === "send"
        ? "translateY(0%) scale(1)"
        : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  if (_currentNavigation !== "send") {
    return null;
  }

  console.log("hello");

  return (
    _currentNavigation === "send" &&
    createPortal(
      <Dialog dismiss={() => handleNavigation("balance")}>
        <div className="h-full grid items-start mt-[80px]">
          <animated.div className={styles["tokens"]} style={springProps}>
            <div className="bg-white shadow-xl dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
              <h3 className="px-4 text-lg font-bold">Send</h3>
              <Formik
                initialValues={{ amount: "", address: "" }}
                onSubmit={() => console.log("send")}
              >
                {({
                  handleSubmit,
                  isSubmitting,
                  getFieldProps,
                  touched,
                  errors,
                }) => (
                  <form onSubmit={handleSubmit} className="m-4">
                    <input
                      disabled={isSubmitting}
                      required
                      {...getFieldProps("address")}
                      type="text"
                      placeholder="Recipient Ethereum Address"
                      className={`mb-2 ${
                        touched.address && errors.address
                          ? "outline !outline-red-500"
                          : ""
                      }`}
                    />
                    {touched.address && errors.address && (
                      <span className="my-2 bg-red-500 rounded px-4 py-1">
                        {errors.address}
                      </span>
                    )}
                    <div className="relative">
                      <input
                        disabled={isSubmitting}
                        required
                        {...getFieldProps("amount")}
                        type="text"
                        placeholder="Amount"
                        className={`mb-2 ${
                          touched.amount && errors.amount
                            ? "outline !outline-red-500"
                            : ""
                        }`}
                      />
                      <button className="p-1 px-2 text-sm hover:bg-opacity-80 dark:hover:bg-opacity-30 text-white dark:text-slate-300 font-bold rounded-full absolute right-4 top-4 bg-black dark:bg-white dark:bg-opacity-10">
                        Max
                      </button>
                      {touched.amount && errors.amount && (
                        <span className="my-2 bg-red-500 rounded px-4 py-1">
                          {errors.amount}
                        </span>
                      )}
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </animated.div>
        </div>
      </Dialog>,
      document.body
    )
  );
};

export default Send;
