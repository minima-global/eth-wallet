import { JsonRpcProvider, Wallet } from "ethers";
import { createContext, useRef, useEffect, useState } from "react";
import { sql } from "./utils/SQL";
import { TransactionResponse } from "ethers";
import { ContractTransactionResponse } from "ethers";
import { Asset } from "./types/Asset";
import { Network, Networks } from "./types/Network";
import defaultAssetsStored, { _defaults } from "./constants";
import useSwapWidget from "./hooks/useSwapWidget";
import { UserAccount } from "./types/Accounts";

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

  const swapWidgetProps = useSwapWidget();

  const [isWorking, setWorking] = useState(false);
  const [userKeys, setUserKeys] = useState<{
    apiKey: string;
    apiKeySecret: string;
  } | null>(null);
  const [_defaultAssets, setDefaultAssets] = useState<{ assets: Asset[] }>({
    assets: [],
  });
  const [_tokenDetails, setTokenDetails] = useState<any>(null);
  const [_currentNetwork, setCurrentNetwork] = useState("");
  const [_defaultNetworks, setDefaultNetworks] = useState<Networks | null>(
    null
  );
  const [_addressBook, setAddressBook] = useState([]);
  const [_userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [_activities, setActivities] = useState<
    (TransactionResponse | ContractTransactionResponse)[]
  >([]);

  const [_generatedKey, setGeneratedKey] = useState("");

  // mainnet, sepolia, hardhat, etc...
  const [_provider, setProvider] = useState<JsonRpcProvider | null>(null); //  new JsonRpcProvider(networks["sepolia"].rpc)
  const [_promptReadMode, setReadMode] = useState<null | boolean>(null);
  const [_promptJsonRpcSetup, setPromptJsonRpcSetup] = useState<null | boolean>(
    false
  );
  const [_promptSettings, setPromptSettings] = useState(false);
  const [_promptTokenDetails, setPromptTokenDetails] = useState<false | any>(
    false
  );
  const [_promptSelectNetwork, setSelectNetwork] = useState(false);
  const [_promptTokenImport, setImportTokenImport] = useState(false);

  const [_triggerBalanceUpdate, setTriggerBalanceUpdate] = useState(false);

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

  const [_promptAllowance, setPromptAllowance] = useState(false);
  const [_approving, setApproving] = useState(false);
  const [_allowanceLock, setAllowanceLock] = useState(false);

  const [_promptAllowanceApprovalModal, setPromptAllowanceApprovalModal] =
    useState(false);

  // display db locked, ask for unlock
  const [_promptDatabaseLocked, setPromptDatabaseLocked] = useState(false);

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
    if (loaded && loaded.current && userKeys !== null && userKeys.apiKey) {
      // Check if read or write mode
      (window as any).MDS.cmd(`checkmode`, function (response: any) {
        if (response.status) {
          // If in write mode, generate & set key
          if (response.response.mode === "WRITE") {
            // Generate key for Eth Wallet
            (window as any).MDS.cmd("seedrandom modifier:ghost", (resp) => {
              if (!resp.status) {
                if (resp.error && resp.error.includes("DB locked!")) {
                  return setPromptDatabaseLocked(true);
                }
              }

              (async () => {
                // Get all user's saved accounts
                const userAccounts: any = await sql(
                  `SELECT * FROM cache WHERE name = 'USER_ACCOUNTS'`
                );

                // if they exist init
                if (userAccounts) {
                  console.log("ua", JSON.parse(userAccounts.DATA.replace(/%27/g, "'")));
                  setUserAccounts(JSON.parse(userAccounts.DATA.replace(/%27/g, "'")));
                  // if not exist, create first account of node
                } else {
                  const account = new Wallet(resp.response.seedrandom);

                  await addUserAccount({
                    nickname: "Minimalist",
                    privatekey: resp.response.seedrandom,
                    address: account.address,
                    current: true,
                    type: "normal",
                  });
                }
              })();
            });
          }

          return setReadMode(response.response.mode === "READ");
        }

        return setReadMode(false);
      });
    }
  }, [loaded, userKeys]);

  useEffect(() => {
    if (!loaded.current) {
      (window as any).MDS.init((msg: any) => {
        if (msg.event === "inited") {
          loaded.current = true;
          // do something Minim-y

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

            const cachedApiKeys: any = await sql(
              `SELECT * FROM cache WHERE name = 'API_KEYS'`
            );

            // USER PREFERENCES
            if (cachedApiKeys) {
              setUserKeys(JSON.parse(cachedApiKeys.DATA));

              // DEFAULT NETWORK
              if (cachedNetwork) {
                const previouslySetNetwork = JSON.parse(cachedNetwork.DATA);
                setRPCNetwork(
                  previouslySetNetwork.default,
                  JSON.parse(defaultNetworks.DATA),
                  JSON.parse(cachedApiKeys.DATA)
                );
              } else {
                // initialize it..
                const initializeFirstNetwork = {
                  default: "mainnet",
                };
                await sql(
                  `INSERT INTO cache (name, data) VALUES ('CURRENT_NETWORK', '${JSON.stringify(
                    initializeFirstNetwork
                  )}')`
                );
                setRPCNetwork(
                  initializeFirstNetwork.default,
                  JSON.parse(defaultNetworks.DATA),
                  JSON.parse(cachedApiKeys.DATA)
                );
              }
            } else {
              // No default api keys.. let's set up
              promptJsonRpcSetup();
            }

            if (addressBook) {
              setAddressBook(JSON.parse(addressBook.DATA));
            }

            if (defaultNetworks) {
              // set all networks saved
              setDefaultNetworks(JSON.parse(defaultNetworks.DATA));
            } else {
              // Initialize networks
              await sql(
                `INSERT INTO cache (name, data) VALUES ('DEFAULTNETWORKS', '${JSON.stringify(
                  {
                    mainnet: {
                      name: "Ethereum",
                      rpc: "https://mainnet.infura.io/v3/",
                      chainId: "1",
                      symbol: "ETH",
                    },
                    sepolia: {
                      name: "SepoliaETH",
                      rpc: "https://sepolia.infura.io/v3/",
                      chainId: "11155111",
                      symbol: "SepoliaETH",
                    },
                  }
                )}')`
              );
              setDefaultNetworks({
                mainnet: {
                  name: "Ethereum",
                  rpc: "https://mainnet.infura.io/v3/",
                  chainId: "1",
                  symbol: "ETH",
                },
                sepolia: {
                  name: "SepoliaETH",
                  rpc: "https://sepolia.infura.io/v3/",
                  chainId: "11155111",
                  symbol: "SepoliaETH",
                },
              });
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

  const promptJsonRpcSetup = () => {
    setPromptJsonRpcSetup((prevState) => !prevState);
  };

  const promptTokenDetails = (token: any) => {
    setTokenDetails((prevState) => (prevState === token ? false : token));
    setPromptTokenDetails((prevState) => !prevState);
  };

  const promptAllowanceApprovalModal = () => {
    setPromptAllowanceApprovalModal((prevState) => !prevState);
  };

  const promptDatabaseLocked = () => {
    setPromptDatabaseLocked((prevState) => !prevState);
  };

  const setRPCNetwork = (
    network: string,
    networks: Networks,
    cachedApiKeys: any
  ) => {
    let rpcUrl = networks && networks[network] ? networks[network].rpc : null;

    if (rpcUrl) {
      // Check if the RPC URL is an Infura URL
      const isInfura = rpcUrl.includes("infura.io");

      // If it's an Infura URL and an API key is available, append the API key
      if (isInfura && cachedApiKeys.apiKey) {
        rpcUrl += cachedApiKeys.apiKey;
      }

      const networkToConnect = new JsonRpcProvider(rpcUrl);
      setProvider(networkToConnect);
      setCurrentNetwork(network);
    } else {
      console.error("Network configuration not found.");
    }
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

  const addUserAccount = async (newAccounts: UserAccount[] | UserAccount) => {
    const updatedData = Array.isArray(newAccounts)
      ? [..._userAccounts, ...newAccounts]
      : [..._userAccounts, newAccounts];

    setUserAccounts(updatedData);

    const rows = await sql(`SELECT * FROM cache WHERE name = 'USER_ACCOUNTS'`);

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('USER_ACCOUNTS', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'USER_ACCOUNTS'`
      );
    }
  };

  const setCurrentUserAccount = async (account: UserAccount) => {
    // Update the `current` property for each account
    const updatedData = _userAccounts.map((userAccount) => ({
      ...userAccount,
      current: userAccount.address === account.address, // Set `current` to true for the selected account
    }));

    // Update the state with the modified accounts
    setUserAccounts(updatedData);

    // // If the selected account has a private key, use it; otherwise, generate a new key
    // if (account.privatekey.length) {
    //   createKey(account.privatekey);
    // } else {
    //   (window as any).MDS.cmd(`checkmode`, function (response: any) {
    //     if (response.status) {
    //       // If in write mode, generate & set key
    //       if (response.response.mode === "WRITE") {
    //         // Generate key for Eth Wallet
    //         (window as any).MDS.cmd("seedrandom modifier:ghost", (resp) => {
    //           if (!resp.status) {
    //             if (resp.error && resp.error.includes("DB locked!")) {
    //               return setPromptDatabaseLocked(true);
    //             }
    //           }

    //           createKey(resp.response.seedrandom);
    //         });
    //       }

    //       return setReadMode(response.response.mode === "READ");
    //     }

    //     return setReadMode(false);
    //   });
    // }

    // Retrieve the existing rows from the cache
    const rows = await sql(`SELECT * FROM cache WHERE name = 'USER_ACCOUNTS'`);

    // If the row doesn't exist, insert a new one; otherwise, update the existing row
    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('USER_ACCOUNTS', '${JSON.stringify(
          updatedData
        ).replace(/'/g, '%27')}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        ).replace(/'/g, '%27')}' WHERE name = 'USER_ACCOUNTS'`
      );
    }
  };

  const deleteUserAccount = async (acc: UserAccount) => {
    // set all the current accounts to false, set the passed account to current true
    const updatedData = [
      ..._userAccounts.filter(
        (account) => account.privatekey !== acc.privatekey
      ),
    ];

    setUserAccounts(updatedData);

    const rows = await sql(`SELECT * FROM cache WHERE name = 'USER_ACCOUNTS'`);

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('USER_ACCOUNTS', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'USER_ACCOUNTS'`
      );
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

  const deleteAsset = async (assetToRemove: string, chainId: string) => {
    // Step 1: Update the local state
    const updatedAssets = _defaultAssets.assets.filter(
      (asset) => asset.address !== assetToRemove
    );
    const nested = { assets: updatedAssets };
    setDefaultAssets(nested);

    // Step 2: Update the database
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

  const updateApiKeys = async (apiKey: string, apiKeySecret: string) => {
    const updatedData: { apiKey: string; apiKeySecret: string } = {
      apiKey,
      apiKeySecret,
    };

    setUserKeys(updatedData);

    const rows = await sql(`SELECT * FROM cache WHERE name = 'API_KEYS'`);

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('API_KEYS', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'API_KEYS'`
      );
    }
  };

  const updatePreferredNetwork = async (name: string) => {
    const updatedData = {
      default: name,
    };

    // Fetch all saved networks
    const defaultNetworks: any = await sql(
      `SELECT * FROM cache WHERE name = 'DEFAULTNETWORKS'`
    );

    setRPCNetwork(name, JSON.parse(defaultNetworks.DATA), userKeys);

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

        _currentAccount: _userAccounts.find(a => a.current),
        _userAccounts,
        addUserAccount,
        setCurrentUserAccount,
        deleteUserAccount,

        userKeys,
        updateApiKeys,

        _promptReadMode,

        updatePreferredNetwork,

        _promptTokenImport,
        promptTokenImport,

        _promptJsonRpcSetup,
        promptJsonRpcSetup,

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
        deleteAsset,

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

        _approving,
        setApproving,
        _promptAllowance,
        setPromptAllowance,
        _allowanceLock,
        setAllowanceLock,

        _promptAllowanceApprovalModal,
        promptAllowanceApprovalModal,

        _promptAccountNameUpdate,
        promptAccountNameUpdate,

        _promptDatabaseLocked,
        promptDatabaseLocked,

        _triggerBalanceUpdate,
        setTriggerBalanceUpdate,

        _provider,
        setProvider,
        setRPCNetwork,
        verifyRPCNetwork,
        _currencyFormat,

        ...swapWidgetProps,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export default AppProvider;
