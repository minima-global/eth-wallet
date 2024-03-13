import Decimal from "decimal.js";
import { formatEther, parseUnits } from "ethers";
import { GasFeeCalculated } from "../../types/GasFeeInterface";
/**
 * 
 * @param _gasUnits gas units required for transaction
 * @param _baseFee suggested base fee from Infura Gas API
 * @param _priorityFee suggested priority fee from Infura Gas API
 * @returns finalGasFee (total for display reasons), baseFee (base fee from Infura as is), priorityFee (from infura as is), gasUnits
 */
export const calculateGasFee = async (
  _gasUnits: string,
  _baseFee: string,
  _priorityFee: string
): Promise<GasFeeCalculated> => {
  const priorityFeeBaseFee = new Decimal(_baseFee).plus(_priorityFee);
  const toWei = parseUnits(priorityFeeBaseFee.toString(), "gwei");
  const gasFee = new Decimal(formatEther(toWei.toString())).times(
    _gasUnits
  );

  return {
    finalGasFee: gasFee.toString(),
    baseFee: _baseFee,
    priorityFee: _priorityFee, 
    gasUnits: _gasUnits
  };
};

export default calculateGasFee;
