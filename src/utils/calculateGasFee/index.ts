import Decimal from "decimal.js";
import { formatEther, parseUnits } from "ethers";
import { GasFeeCalculated } from "../../providers/GasProvider/GasFeeInterface";

export const calculateGasFee = async (
  _gasUnits: bigint,
  _baseFee: string,
  _priorityFee: string
): Promise<GasFeeCalculated> => {
  const priorityFeeBaseFee = new Decimal(_baseFee).plus(_priorityFee);
  const toWei = parseUnits(priorityFeeBaseFee.toString(), "gwei");
  const gasFee = new Decimal(formatEther(toWei.toString())).times(
    _gasUnits.toString()
  );

  return {
    finalGasFee: gasFee.toString(),
    baseFee: _baseFee,
    priorityFee: _priorityFee, 
    gasUnits: _gasUnits.toString()
  };
};

export default calculateGasFee;
