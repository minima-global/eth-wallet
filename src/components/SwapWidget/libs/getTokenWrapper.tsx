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
      <div>
        {tokenIconSrc && (
          <img
            alt="token-icon"
            src={tokenIconSrc}
            className="w-[36px] h-[36px] min-h-[36px] min-w-[36px] rounded-full"
          />
        )}
        {amount &&  <p className="font-mono">{new Decimal(amount).toFixed(2)}</p>}
      </div>
    );
  };


  export default getTokenWrapper;