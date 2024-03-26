import { JsonRpcProvider } from "ethers";
import { createContext, useRef, useEffect, useState } from "react";
import { sql } from "./utils/SQL";
import { TransactionResponse } from "ethers";
import { ContractTransactionResponse } from "ethers";
import { Asset } from "./types/Asset";
import { Network, Networks } from "./types/Network";
import defaultAssetsStored, { _defaults, networks } from "./constants";

export const appContext = createContext({} as any);

/**
 * Network
 * -------
 * ChainID
 * Name
 * Asset Symbol
 * JSON RPC URL
 */

interface IProps {
  children: any;
}
const AppProvider = ({ children }: IProps) => {
  const loaded = useRef(false);
  const [isWorking, setWorking] = useState(false);
  const [_defaultAssets, setDefaultAssets] = useState<{ assets: Asset[] }>({
    assets: [],
  });
  const [_tokenDetails, setTokenDetails] = useState<any>(null);
  const [_currentNetwork, setCurrentNetwork] = useState("");
  const [_defaultNetworks, setDefaultNetworks] = useState<Networks | null>(
    null
  );
  const [_addressBook, setAddressBook] = useState([]);
  const [_activities, setActivities] = useState<
    (TransactionResponse | ContractTransactionResponse)[]
  >([]);
  const [_generatedKey, setGeneratedKey] = useState("");
  // mainnet, sepolia, hardhat, etc...
  const [_provider, setProvider] = useState<JsonRpcProvider | null>(null); //  new JsonRpcProvider(networks["sepolia"].rpc)
  const [_promptReadMode, setReadMode] = useState<null | boolean>(null);
  const [_promptSettings, setPromptSettings] = useState(false);
  const [_promptTokenDetails, setPromptTokenDetails] = useState<false | any>(false);
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
    (async () => {
      // if MDS inited then we can run our init SQL/re-sql on network change
      if (loaded && loaded.current && _provider) {
        setWorking(true);
        setDefaultAssets({ assets: [] });

        // We get the current provider
        const currentNetwork = await _provider.getNetwork();
        // Fetch assets according to the default network (different network, different assets)
        const defaultAssets: any = await sql(
          `SELECT * FROM cache WHERE name = 'DEFAULTASSETS_${currentNetwork.chainId}'`
        );

        // if exists, set them in memory
        if (defaultAssets) {
          setDefaultAssets(JSON.parse(defaultAssets.DATA));
        } else {
          // let's initialize the default assets
          const _d = defaultAssetsStored
            .filter((asset) => {
              // Check if _defaults has the network for the current asset
              const networkExists =
                _defaults[asset.name] &&
                _defaults[asset.name][currentNetwork.name];

              // Return true if the network exists, false otherwise
              return networkExists;
            })
            .map((asset) => ({
              ...asset,
              address: _defaults[asset.name]
                ? _defaults[asset.name][currentNetwork.name]
                : "",
            }));

          await sql(
            `INSERT INTO cache (name, data) VALUES ('DEFAULTASSETS_${
              currentNetwork.chainId
            }', '${JSON.stringify({ assets: _d })}')`
          );
          setDefaultAssets({ assets: _d });
        }
        setWorking(false);
      }
    })();
  }, [_provider, loaded]);

  useEffect(() => {
    if (!loaded.current) {
      (window as any).MDS.init((msg: any) => {
        if (msg.event === "inited") {
          loaded.current = true;
          // do something Minim-y

          // Check if read or write mode
          (window as any).MDS.cmd(`checkmode`, function (response: any) {
            if (response.status) {
              return setReadMode(response.response.mode === "READ");
            }

            return setReadMode(false);
          });

          // Generate key for Eth Wallet
          (window as any).MDS.cmd("seedrandom modifier:ghost", (resp) => {
            setGeneratedKey(resp.response.seedrandom);
          });

          (async () => {
            setWorking(true);
            // Initialize cache-ing table
            await sql(
              `CREATE TABLE IF NOT EXISTS cache (name varchar(255), data longtext);`
            );

            // Now we check if user has previously chosen a network, if not connect Sepolia
            const cachedNetwork: any = await sql(
              `SELECT * FROM cache WHERE name = 'CURRENT_NETWORK'`
            );
            // Fetch all saved networks
            const defaultNetworks: any = await sql(
              `SELECT * FROM cache WHERE name = 'DEFAULTNETWORKS'`
            );
            // Get all user's saved addresses
            const addressBook: any = await sql(
              `SELECT * FROM cache WHERE name = 'ADDRESSBOOK'`
            );           

            if (addressBook) {
              setAddressBook(JSON.parse(addressBook.DATA));
            }

            if (defaultNetworks) {
              console.log(JSON.parse(defaultNetworks.DATA));
              // set all networks saved
              setDefaultNetworks(JSON.parse(defaultNetworks.DATA));
            } else {
              // Initialize networks
              await sql(
                `INSERT INTO cache (name, data) VALUES ('DEFAULTNETWORKS', '${JSON.stringify(
                  networks
                )}')`
              );
              setDefaultNetworks(networks);
            }

            // User preference
            if (cachedNetwork) {
              const previouslySetNetwork = JSON.parse(cachedNetwork.DATA);
              setRPCNetwork(
                previouslySetNetwork.default,
                JSON.parse(defaultNetworks.DATA)
              );
            } else {
              // initialize
              await sql(
                `INSERT INTO cache (name, data) VALUES ('CURRENT_NETWORK', '${JSON.stringify(
                  { default: "sepolia" }
                )}')`
              );

              setRPCNetwork("sepolia", networks);
            }

            setWorking(false);
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
  
  const promptTokenDetails = (token: any) => {
    setTokenDetails(prevState => prevState === token ? false : token);
    setPromptTokenDetails((prevState) => !prevState);
  };

  const setRPCNetwork = (network: string, networks: Networks) => {
    const networkToConnect =
      networks && networks[network]
        ? new JsonRpcProvider(networks[network].rpc)
        : null;

    setProvider(networkToConnect);
    setCurrentNetwork(network);
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

  const updateDefaultAssets = async (asset: Asset, chainId: string) => {
    const updatedData = [..._defaultAssets.assets, asset];
    const nested = { assets: updatedData };
    setDefaultAssets(nested);

    const rows = await sql(
      `SELECT * FROM cache WHERE name = 'DEFAULTASSETS_${chainId}'`
    );

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('DEFAULTASSETS_${chainId}', '${JSON.stringify(
          nested
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          nested
        )}' WHERE name = 'DEFAULTASSETS_${chainId}'`
      );
    }
  };

  const addCustomNetwork = async (network: Network) => {
    const updatedData = { ..._defaultNetworks, [network.name]: network };

    setDefaultNetworks(updatedData);

    const rows = await sql(
      `SELECT * FROM cache WHERE name = 'DEFAULTNETWORKS'`
    );

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('DEFAULTNETWORKS', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'DEFAULTNETWORKS'`
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

  const updatePreferredNetwork = async (name: string) => {
    const updatedData = {
      default: name,
    };

    // Fetch all saved networks
    const defaultNetworks: any = await sql(
      `SELECT * FROM cache WHERE name = 'DEFAULTNETWORKS'`
    );

    setRPCNetwork(name, JSON.parse(defaultNetworks.DATA));

    const rows = await sql(
      `SELECT * FROM cache WHERE name = 'CURRENT_NETWORK'`
    );

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('CURRENT_NETWORK', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'CURRENT_NETWORK'`
      );
    }

    promptSelectNetwork();
    promptSettings();
  };

  const createKey = (key: string) => {
    setGeneratedKey(key);
  };

  return (
    <appContext.Provider
      value={{
        loaded,
        isWorking,

        _promptReadMode,

        updatePreferredNetwork,

        _promptTokenImport,
        promptTokenImport,

        _promptSettings,
        promptSettings,

        _generatedKey,
        createKey,

        _tokenDetails,
        _promptTokenDetails,
        promptTokenDetails,

        _promptSelectNetwork,
        promptSelectNetwork,

        _currentNavigation,
        handleNavigation,

        _defaultAssets,
        setDefaultAssets,
        updateDefaultAssets,

        _currentNetwork,
        _defaultNetworks,
        addCustomNetwork,

        _addressBook,
        updateAddressBook,

        _activities,
        setActivities,
        // updateActivities,

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
