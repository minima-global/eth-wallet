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
      const etherPriceUSD = await utils.getEthereumPrice();
      const conversion = Number(amount) * etherPriceUSD;

      setConversionRate(conversion.toString());
    })();
  }, [amount]);

  return (
    <div className="mb-2">
      <p className="text-sm font-mono">
        ${makeMinimaNumber("" + conversionRate, 2)} USD
      </p>
    </div>
  );
};

export default ConversionRateUSD;
