import { _defaults } from "../../../constants";
import { Asset } from "../../../types/Asset";

const getTokenWrapper = (asset: Asset, amount?: string) => {
    if (!asset) return null;
  
    const { address } = asset;
  
    const isWMINIMA = address === _defaults["wMinima"].mainnet;
    const isUSDT = address === _defaults["Tether"].mainnet;
  
    let tokenIconSrc = "";
    let tokenName = "";
  
    if (isWMINIMA) {
      tokenIconSrc = "./assets/token.svg";
      tokenName = "WMINIMA";
    } else if (isUSDT) {
      tokenIconSrc = "./assets/tether.svg";
      tokenName = "USDT";
    }
  
    return (
      <div className="text-center flex items-center gap-1 p-1 rounded">
        {tokenIconSrc && (
          <img
            alt="token-icon"
            src={tokenIconSrc}
            className="w-[24px] h-[24px] rounded-full"
          />
        )}
        {amount &&  <p className="font-mono">{amount}</p>}
        {tokenName && <p className="font-bold">{tokenName}</p>}
      </div>
    );
  };


  export default getTokenWrapper;