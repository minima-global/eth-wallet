import { useQuoteProvider } from "../../providers/QuoteProvider/QuoteProvider";

const SwapWidget = () => {
  const {outputAmount} = useQuoteProvider();

  return <div>Swap widget.. {outputAmount}</div>;
};

export default SwapWidget;
