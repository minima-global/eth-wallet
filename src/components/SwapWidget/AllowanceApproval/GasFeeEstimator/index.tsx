
  import { useFormikContext } from "formik";
  import { useContext, useEffect } from "react";
  
  import { appContext } from "../../../../AppContext";
  import * as utils from "../../../../utils";

  import { useWalletContext } from "../../../../providers/WalletProvider/WalletProvider";
import { estimateGasForApproval } from "../../libs/getTokenTransferApproval";
import { NonceManager } from "ethers";
  
  
  const GasFeeEstimator = ({token}) => {
    const formik: any = useFormikContext();
    const { _provider } = useContext(appContext);
    const { _address,  _wallet } = useWalletContext();
  
    const { isValid } = formik;
    const { amount, gas } = formik.values;
    useEffect(() => {

      if (utils.createDecimal(amount) === null || !isValid) return;
  
      (async () => {
        const nonceManager = new NonceManager(_wallet!);
        const gasUnits = await estimateGasForApproval(token, amount, nonceManager, _address!)
        const gasFee = await _provider.getFeeData();
        const { maxFeePerGas, maxPriorityFeePerGas } = gasFee; // wei
  
        if (maxFeePerGas) {
          const _gas = await utils.calculateGasFee(
            gasUnits.toString(),
            maxFeePerGas.toString(),
            maxPriorityFeePerGas.toString()
          );
  
          // calculated gas..
          formik.setFieldValue("gas", _gas!.finalGasFee);
        }        
      })();
    }, [formik.values.amount]);
  
    return (
      <div className="grid grid-cols-[1fr_auto] items-center">
        <div>
          <a
            href="https://eth-converter.com/"
            target="_blank"
            className="text-sm text-violet-500 font-bold"
          >
            Convert to $ value
          </a>
        </div>
        <div className="grid grid-cols-[auto_auto_1fr] items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="18"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3 -3" />
            <path d="M4 20v-14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14" />
            <path d="M3 20l12 0" />
            <path d="M18 7v1a1 1 0 0 0 1 1h1" />
            <path d="M4 11l10 0" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 12c0 -1.657 1.592 -3 3.556 -3c1.963 0 3.11 1.5 4.444 3c1.333 1.5 2.48 3 4.444 3s3.556 -1.343 3.556 -3" />
          </svg>
          <p className="text-sm font-bold text-black dark:text-[#f9e79f]">
            <span className="font-mono">{Math.floor(gas).toString()}</span> GWEI
          </p>
        </div>
      </div>
    );
  };
  
  export default GasFeeEstimator;
  