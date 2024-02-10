import { useContext } from "react";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { appContext } from "../../AppContext";
import { useFormikContext } from "formik";

interface IProps {
    setStep: any;
}
const AddressBook = ({setStep}: IProps) => {
  const { _wallet } = useWalletContext();
  const { _addressBook, updateAddressBook } = useContext(appContext);
  const formik = useFormikContext();


  return (
    <div className="">
      <h3 className="mx-4 font-bold text-sm mb-2">Address book</h3>
      <ul className="max-h-[50%] overflow-y-scroll">
        <li onClick={() => {formik.setFieldValue("address", _wallet!.address); setStep(2)}} className="px-4 py-2 hover:bg-opacity-50 hover:bg-slate-800 hover:cursor-pointer">
          <h3 className="font-bold text-sm">Your Account</h3>
          <p>{_wallet!.address}</p>
        </li>
        
      </ul>
    </div>
  );
};

export default AddressBook;
