import { useContext } from "react";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { appContext } from "../../AppContext";
import { useFormikContext } from "formik";
import Profile from "../UI/Profile";

interface IProps {
  setStep: any;
}
const AddressBook = ({ setStep }: IProps) => {
  const { _addressBook, _currentAccount } = useContext(appContext);
  const formik = useFormikContext();

  // Define the filter condition
  const filterCondition = ([key]) => key !== _currentAccount.address;

  // Filter out entries based on the condition
  const filteredEntries = Object.entries(_addressBook).filter(
    filterCondition as any
  );

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <hr className="border border-neutral-900 my-6 w-full" />
        <span className="mx-4 text-xs font-bold text-black dark:text-neutral-300">
          Address Book
        </span>
        <hr className="border border-neutral-900 my-6 w-full" />
      </div>
      <ul className="max-h-[50%] h-[250px] overflow-y-scroll">
        <li
          key={_currentAccount.address}
          onClick={() => {
            formik.setFieldValue("address", _currentAccount.address);
            setStep(2);
          }}
          className="cursor-pointer px-2 py-2 hover:bg-teal-100 !bg-opacity-30 dark:hover:bg-[#1B1B1B] grid grid-cols-[48px_1fr] items-center gap-3"
        >
          <div>
            {_currentAccount.address && (
              <Profile extraClass=" w-[48px]" input={_currentAccount.address} />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-teal-500 dark:text-teal-300">
              {_currentAccount.nickname || "My Account"}
            </h3>
            <p className="break-all text-sm tracking-widest">
              {_currentAccount.address}
            </p>
          </div>
        </li>
        {_addressBook &&
          filteredEntries.map(([key, value]: any) => (
            <li
              key={key}
              onClick={() => {
                formik.setFieldValue("address", key);
                setStep(2);
              }}
              className="cursor-pointer px-2 py-2 hover:bg-teal-100 !bg-opacity-30 dark:hover:bg-[#1B1B1B] grid grid-cols-[48px_1fr] items-center gap-3"
            >
              <div>
                <Profile extraClass=" w-[48px]" input={key} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{value}</h3>
                <p className="break-all text-sm tracking-widest">{key}</p>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AddressBook;
