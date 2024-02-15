import { useEffect, useState } from "react";
import * as utils from "../../utils";
import useFormatMinimaNumber from "../../utils/useMakeNumber";

interface IProps {
  amount: string;
  asset: string;
}
const ConversionRateUSD = ({ amount, asset }: IProps) => {
  const [conversionRate, setConversionRate] = useState<string | null>(null);
  const { makeMinimaNumber } = useFormatMinimaNumber();

  useEffect(() => {
    (async () => {
      if (asset === "ether") {
        const etherPriceUSD = await utils.getEthereumPrice();
        const conversion = Number(amount) * etherPriceUSD;
  
        setConversionRate(conversion.toString());
      }
      
      if (asset === "minima") {
        const etherPriceUSD = await utils.getMinimaPrice();
        const conversion = Number(amount) * etherPriceUSD;
  
        setConversionRate(conversion.toString());
      }
    })();
  }, [amount, asset]);

  return (
    <div className="mb-2">
      {amount && (
        <p className="text-sm font-mono">
          ${makeMinimaNumber("" + conversionRate, 2)} USD
        </p>
      )}
    </div>
  );
};

export default ConversionRateUSD;
