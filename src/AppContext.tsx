import { JsonRpcProvider } from "ethers";
import { createContext, useRef, useEffect, useState } from "react";
import { sql } from "./utils/SQL";
import { TransactionResponse } from "ethers";
import { ContractTransactionResponse } from "ethers";
import { Asset } from "./types/Asset";
import defaultAssetsStored, { _defaults, networks } from "./constants";

export const appContext = createContext({} as any);

interface IProps {
  children: any;
}
const AppProvider = ({ children }: IProps) => {
  const loaded = useRef(false);
  const [_defaultAssets, setDefaultAssets] = useState<{ assets: Asset[] }>({
    assets: [],
  });
  const [_addressBook, setAddressBook] = useState([]);
  const [_activities, setActivities] = useState<
    (TransactionResponse | ContractTransactionResponse)[]
  >([]);
  const [_generatedKey, setGeneratedKey] = useState("");
  // mainnet, sepolia, hardhat, etc...
  const [_provider, setProvider] = useState<JsonRpcProvider>(
    new JsonRpcProvider(networks["sepolia"].rpc)
  );

  const [_promptSettings, setPromptSettings] = useState(false);
  const [_promptSelectNetwork, setSelectNetwork] = useState(false);
  const [_promptTokenImport, setImportTokenImport] = useState(false);
  const [_promptAccountNameUpdate, setPromptAccountNameUpdate] =
    useState(false);
  const [_promptAddressBookAdd, setPromptAddressBookAdd] = useState(false);
  const [_currentNavigation, setCurrentNavigation] = useState("balance");
  const [_currencyFormat] = useState<{
    decimal: string;
    thousands: string;
  }>({
    decimal: ".",
    thousands: ",",
  });

  useEffect(() => {
    if (!loaded.current) {
      (window as any).MDS.init((msg: any) => {
        if (msg.event === "inited") {
          loaded.current = true;
          // do something Minim-y
          (window as any).MDS.keypair.get("_k", function (val) {
            if (val.status) {
              createKey(val.value);
            }
          });

          (async () => {
            await sql(
              `CREATE TABLE IF NOT EXISTS cache (name varchar(255), data longtext);`
            );

            const addressBook: any = await sql(
              `SELECT * FROM cache WHERE name = 'ADDRESSBOOK'`
            );

            const currentNetwork = await _provider.getNetwork();

            const activities: any = await sql(
              `SELECT * FROM cache WHERE name = 'ACTIVITIES_${currentNetwork.chainId}'`
            );

            // Fetch assets according to the default network
            const defaultAssets: any = await sql(
              `SELECT * FROM cache WHERE name = 'DEFAULTASSETS_${currentNetwork.chainId}'`
            );

            if (addressBook) {
              setAddressBook(JSON.parse(addressBook.DATA));
            }

            if (activities) {
              setActivities(JSON.parse(activities.DATA));
            }

            if (defaultAssets) {
              setDefaultAssets(JSON.parse(defaultAssets.DATA));
            } else {
              // let's initialize the default assets
              const _d = defaultAssetsStored.map((asset) => ({
                ...asset,
                address: _defaults[asset.name]
                  ? _defaults[asset.name][currentNetwork.name]
                  : "",
              }));

              await sql(
                `INSERT INTO cache (name, data) VALUES ('DEFAULTASSETS_${
                  currentNetwork.chainId
                }', '${JSON.stringify({assets: _d})}')`
              );
              setDefaultAssets({assets: _d});
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

  const promptSettings = () => {
    setPromptSettings((prevState) => !prevState);
  };

  const promptTokenImport = () => {
    setImportTokenImport((prevState) => !prevState);
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

    const currentNetwork = await _provider.getNetwork();

    const rows = await sql(
      `SELECT * FROM cache WHERE name = 'ACTIVITIES_${currentNetwork.chainId}'`
    );

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('ACTIVITIES_${
          currentNetwork.chainId
        }', '${JSON.stringify(updatedData)}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'ACTIVITIES_${currentNetwork.chainId}'`
      );
    }
  };

  const updateDefaultAssets = async (asset: Asset) => {
    const updatedData = [ ..._defaultAssets.assets,  asset ];
    const nested = { assets: updatedData };
    setDefaultAssets(nested);

    const currentNetwork = await _provider.getNetwork();

    const rows = await sql(
      `SELECT * FROM cache WHERE name = 'DEFAULTASSETS_${currentNetwork.chainId}'`
    );


    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('DEFAULTASSETS_${
          currentNetwork.chainId
        }', '${JSON.stringify(nested)}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          nested
        )}' WHERE name = 'DEFAULTASSETS_${currentNetwork.chainId}'`
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

  const createKey = (key: string) => {
    setGeneratedKey(key);
  };

  return (
    <appContext.Provider
      value={{
        loaded,

        _promptTokenImport,
        promptTokenImport,

        _promptSettings,
        promptSettings,

        _generatedKey,
        createKey,

        _promptSelectNetwork,
        promptSelectNetwork,

        _currentNavigation,
        handleNavigation,

        _defaultAssets,
        setDefaultAssets,
        updateDefaultAssets,

        _addressBook,
        updateAddressBook,

        _activities,
        setActivities,
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
