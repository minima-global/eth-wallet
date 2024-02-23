import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
// import useFormatMinimaNumber from "../../utils/useMakeNumber";


const Balance = () => {
  const { _balance } = useWalletContext();
  // const { makeMinimaNumber } = useFormatMinimaNumber();      
    
  

  return (
    <div className="mx-auto text-center">
      <h3 className="font-bold text-2xl">{_balance ? _balance : 'n/a'} ETH</h3>      
      {/* <p className="font-bold text-lg opacity-70">{_netWorth ? "$"+makeMinimaNumber(_netWorth+ "", 2) : 'n/a'}</p>       */}
    </div>
  );
};

export default Balance;
