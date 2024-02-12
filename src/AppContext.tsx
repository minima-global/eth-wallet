import { JsonRpcProvider } from "ethers";
import { createContext, useRef, useEffect, useState } from "react";
import { sql } from "./utils/SQL";

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

  const [_addressBook, setAddressBook] = useState([]);
  const [_provider, setProvider] = useState<JsonRpcProvider>(
    new JsonRpcProvider("http://127.0.0.1:8545")
  ); // mainnet, sepolia, hardhat, etc...
  const [_promptSelectNetwork, setSelectNetwork] = useState(false);
  const [_promptAccountNameUpdate, setPromptAccountNameUpdate] = useState(false);
  const [_currentNavigation, setCurrentNavigation] = useState("balance");
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
        
          (async () => {
            await sql(
              `CREATE TABLE IF NOT EXISTS cache (name varchar(255), data longtext);`
            );

            const addressBook: any = await sql(
              `SELECT * FROM cache WHERE name = 'ADDRESSBOOK'`
            );

            if (addressBook) {
              setAddressBook(JSON.parse(addressBook.DATA));
            }
          })();
        }
      });
    }
  }, [loaded]);

  const handleNavigation = (page: string) => {
    setCurrentNavigation(page);
  };

  const promptSelectNetwork = () => {
    setSelectNetwork((prevState) => !prevState);
  };
  
  const promptAccountNameUpdate = () => {
    setPromptAccountNameUpdate((prevState) => !prevState);
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

  const updateAddressBook = async (address: string, nickname: string) => {
    const updatedData = {
      ..._addressBook,
      [address]: nickname,
    };

    setAddressBook(updatedData);

    const rows = await sql(`SELECT * FROM cache WHERE name = 'ADDRESSBOOK'`);

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('ADDRESSBOOK', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'ADDRESSBOOK'`
      );
    }

    setPromptAccountNameUpdate(false);
  };

  return (
    <appContext.Provider
      value={{
        _promptSelectNetwork,
        promptSelectNetwork,

        _currentNavigation,
        handleNavigation,

        _addressBook,
        updateAddressBook,

        _promptAccountNameUpdate,
        promptAccountNameUpdate,

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
