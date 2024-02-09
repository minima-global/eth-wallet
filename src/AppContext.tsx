import { JsonRpcProvider } from "ethers";
import { createContext, useRef, useEffect, useState } from "react";

export const appContext = createContext({} as any);


interface IProps {
  children: any;
}
// http://127.0.0.1:8545
const AppProvider = ({ children }: IProps) => {
  const loaded = useRef(false);

  const networks = {
    mainnet: "https://mainnet.infura.io/v3/05c98544804b478994665892aeff361c",
    sepolia: "https://sepolia.infura.io/v3/05c98544804b478994665892aeff361c",
  }

  const [_provider, setProvider] = useState<JsonRpcProvider>(
    new JsonRpcProvider("http://127.0.0.1:8545")
  ); // mainnet, sepolia, hardhat, etc...
  const [_promptSelectNetwork, setSelectNetwork] = useState(false);
  const [_currencyFormat, setCurrencyFormat] = useState<{
    decimal: string;
    thousands: string;
  }>({
    decimal: ".",
    thousands: ",",
  });

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      (window as any).MDS.init((msg: any) => {
        if (msg.event === "inited") {
          // do something Minim-y
        
        }
      });
    }
  }, [loaded]);

  const promptSelectNetwork = () => {
    setSelectNetwork((prevState) => !prevState);
  };

  const setRPCNetwork = (network: string) => {
    setProvider(networks[network] ? new JsonRpcProvider(networks[network]) : new JsonRpcProvider(network));
  }

  const verifyRPCNetwork = async (network: string) => {
    
    try {
      const _temp = new JsonRpcProvider(network);

      await _temp.getBlockNumber();
      
    } catch (error) {
      console.error(error);
      throw error;
    }
    
  }

  return (
    <appContext.Provider
      value={{
        _promptSelectNetwork,
        promptSelectNetwork,

        _provider,
        setProvider,
        setRPCNetwork,
        verifyRPCNetwork,
        _currencyFormat

      }}
    >
      {children}
    </appContext.Provider>
  );
};

export default AppProvider;
