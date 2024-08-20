import { useContext, useState, useEffect, useRef } from "react";
import { UserAccount } from "../../../types/Accounts";
import Bear from "../../UI/Avatars/Bear";
import { appContext } from "../../../AppContext";
import SideMenuIcon from "../../UI/Icons/SideMenuIcon";
import RubbishIcon from "../../UI/Icons/RubbishIcon";

interface Props {
  account: UserAccount;
}

const Account = ({ account }: Props) => {
  const { _userAccounts, deleteUserAccount, setCurrentUserAccount } = useContext(appContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Reference to the dropdown menu

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleDeleteAccount = async (accToDelete: UserAccount) => {
    // Implement delete account functionality
    setDropdownOpen(false);
    const filteredData = _userAccounts.filter(account => account.address !== accToDelete.address);
    const currAccount = _userAccounts.find(account => account.current);
    // Set back to default opt   
    if (accToDelete.address === currAccount.address) {
        setCurrentUserAccount(filteredData[0], filteredData);
    }
    await deleteUserAccount(accToDelete.address === currAccount.address ? filteredData[0] : currAccount, accToDelete); 
  };

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <li
      onClick={() => {
        setCurrentUserAccount(account);
      }}
      className={`relative grid grid-cols-[48px_1fr] gap-1 px-4 py-2  ${
        account.current ? "bg-teal-500 py-2 text-white dark:text-neutral-100 dark:bg-neutral-900" : "hover:bg-teal-100 dark:hover:bg-neutral-800 dark:text-neutral-400"
      }`}
    >
      <Bear input={account.address} extraClass="w-12 h-12 min-w-12" />
      <div className="my-auto truncate">
        <h3 className="font-bold">{account.nickname}</h3>
        <input
          value={account.address}
          readOnly
          className="font-mono text-xs max-w-full focus:outline-none bg-transparent w-full truncate tracking-wide"
        />
      </div>
      {account.type !== "normalmain" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDropdownToggle();
          }}
          className="absolute right-2 top-2 p-2 focus:outline-none"
        >
          <SideMenuIcon fill="currentColor" />
        </button>
      )}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-neutral-800 dark:border-neutral-700 z-50"
        >
          <ul>
            <li
              onClick={(e) => {
                e.stopPropagation();

                handleDeleteAccount(account);
              }}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer flex items-center gap-2"
            >
              <span className="inline-block">
                <RubbishIcon fill="currentColor" size={18} />
              </span>
              <p className="font-bold tracking-wide text-sm text-center">
                Remove Account
              </p>
            </li>
          </ul>
        </div>
      )}
    </li>
  );
};

export default Account;
