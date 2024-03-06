import { useEffect, useState } from "react";
import * as utils from "../../utils";
import useFormatMinimaNumber from "../../utils/useMakeNumber";

interface IProps {
  amount: string;
  asset: any;
}
const ConversionRateUSD = ({ amount, asset }: IProps) => {
  const [conversionRate, setConversionRate] = useState<string | null>(null);
  const { makeMinimaNumber } = useFormatMinimaNumber();

  useEffect(() => {
    (async () => {
      return;
      setConversionRate(null);
      if (asset && asset.type === "ether") {
        const etherPriceUSD = await utils.getEthereumPrice();
        const conversion = Number(amount) * etherPriceUSD;
  
        setConversionRate(conversion.toString());
      }
      
      if (asset && asset.type === "erc20") {
        if (asset.name === 'wMinima') {
          const etherPriceUSD = await utils.getMinimaPrice();
          console.log('Minima Price', etherPriceUSD);
          const conversion = Number(amount) * etherPriceUSD;
    
          setConversionRate(conversion.toString());
        }
      }
    })();
  }, [amount, asset]);

  return (
    <div className="mb-2">
      {amount && conversionRate !== null && (
        <p className="text-sm text-purple-500 font-bold font-mono">
          ${makeMinimaNumber("" + conversionRate, 2)} USD
        </p>
      )}
    </div>
  );
};

export default ConversionRateUSD;
