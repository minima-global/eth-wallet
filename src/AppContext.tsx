import { JsonRpcProvider } from "ethers";
import { createContext, useRef, useEffect, useState } from "react";
import { sql } from "./utils/SQL";
import { TransactionResponse } from "ethers";
import { ContractTransactionResponse } from "ethers";

export const appContext = createContext({} as any);

interface IProps {
  children: any;
}
export const networks = {
  mainnet: {
    rpc: "https://mainnet.infura.io/v3/05c98544804b478994665892aeff361c",
    chainId: 1,
  },
  sepolia: {
    rpc: "https://sepolia.infura.io/v3/05c98544804b478994665892aeff361c",
    chainId: "11155111",
  },
};
// http://127.0.0.1:8545
const AppProvider = ({ children }: IProps) => {
  const loaded = useRef(false);

  const [_addressBook, setAddressBook] = useState([]);
  const [_activities, setActivities] = useState<
    (TransactionResponse | ContractTransactionResponse)[]
  >([]);
  // mainnet, sepolia, hardhat, etc...
  const [_provider, setProvider] = useState<JsonRpcProvider>(
    new JsonRpcProvider(networks["sepolia"].rpc)
  );
  const [_promptLogin, setPromptLogin] = useState<boolean>(true);
  const [loginForm, setLoginForm] = useState<{
    _seedPhrase: string;
    _rememberMe: boolean;
    _secret: string;
  }>({
    _seedPhrase: "",
    _rememberMe: false,
    _secret: "",
  });
  const [_promptSelectNetwork, setSelectNetwork] = useState(false);
  const [_promptAccountNameUpdate, setPromptAccountNameUpdate] =
    useState(false);
  const [_promptAddressBookAdd, setPromptAddressBookAdd] = useState(false);
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

            const activities: any = await sql(
              `SELECT * FROM cache WHERE name = 'ACTIVITIES'`
            );

            if (addressBook) {
              setAddressBook(JSON.parse(addressBook.DATA));
            }

            if (activities) {
              setActivities(JSON.parse(activities.DATA));
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

  const promptAddressBookAdd = () => {
    setPromptAddressBookAdd((prevState) => !prevState);
  };

  const setRPCNetwork = (network: string) => {
    setProvider(
      networks[network]
        ? new JsonRpcProvider(networks[network].rpc)
        : new JsonRpcProvider(network)
    );
  };

  const verifyRPCNetwork = async (network: string) => {
    try {
      const _temp = new JsonRpcProvider(network);

      await _temp.getBlockNumber();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateActivities = async (activity: TransactionResponse) => {
    const updatedData = [..._activities, activity];

    setActivities(updatedData);

    const rows = await sql(`SELECT * FROM cache WHERE name = 'ACTIVITIES'`);

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('ACTIVITIES', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'ACTIVITIES'`
      );
    }
  };

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
    setPromptAddressBookAdd(false);
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

        _activities,
        updateActivities,

        _promptAddressBookAdd,
        promptAddressBookAdd,

        _promptAccountNameUpdate,
        promptAccountNameUpdate,

        _provider,
        setProvider,
        setRPCNetwork,
        verifyRPCNetwork,
        _currencyFormat,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export default AppProvider;
