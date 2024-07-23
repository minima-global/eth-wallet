import Decimal from "decimal.js";
import { _defaults } from "../../../constants";
import { Asset } from "../../../types/Asset";

const getTokenWrapper = (asset: Asset, amount?: string) => {
    if (!asset) return null;
  
    const { address } = asset;
  
    const isWMINIMA = address.toUpperCase() === _defaults["wMinima"].mainnet.toUpperCase();
    const isUSDT = address.toUpperCase() === _defaults["Tether"].mainnet.toUpperCase();
  
    let tokenIconSrc = "";
  
    if (isWMINIMA) {
      tokenIconSrc = "./assets/wtoken.svg";
    } else if (isUSDT) {
      tokenIconSrc = "./assets/tether.svg";      
    }
  
    return (
      <div className="text-center flex items-center gap-1 p-1 rounded">
        {tokenIconSrc && (
          <img
            alt="token-icon"
            src={tokenIconSrc}
            className="w-[36px] h-[36px] min-h-[36px] min-w-[36px] rounded-full"
          />
        )}
        {amount &&  <p className="font-mono">{new Decimal(amount).toFixed(2)}</p>}
        {/* {tokenName && <p className="font-bold">{tokenName}</p>} */}
      </div>
    );
  };


  export default getTokenWrapper;