import { useContext } from "react";
import { UserAccount } from "../../../types/Accounts";
import Bear from "../../UI/Avatars/Bear";
import { appContext } from "../../../AppContext";

interface Props {
    account: UserAccount;
}
const Account = ({account}: Props) => {

    const { setCurrentUserAccount } = useContext(appContext)

    return <li onClick={() => setCurrentUserAccount(account)} className={`grid grid-cols-[48px_1fr] gap-1 px-4 ${account.current ? "bg-neutral-50 dark:bg-neutral-900" : ""}`}>
        <Bear input={account.address} extraClass="w-12 h-12 min-w-12" />
        <div className="my-auto truncate">
            <h3 className="font-bold dark:text-neutral-300">
                {account.nickname}
            </h3>
            <p className="font-mono text-xs max-w-full overflow-x-auto dark:text-neutral-200 tracking-wide">
                {account.address}
            </p>
        </div>
    </li>
}


export default Account;