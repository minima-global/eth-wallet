import { createContext, useContext } from "react"

type Props = {
    children: React.ReactNode;
  };
type Context = {
    // todo
}
const AllowanceContext = createContext<any>(null);

const useAllowanceProvider = ({ children }: Props) => {

    


    return (
        <AllowanceContext.Provider value={{}}>
            {children}
        </AllowanceContext.Provider>
    )
}


export const useAllowanceContext = () => {
    const context = useContext(AllowanceContext);

    if (!context)
        throw new Error(
            "AllowanceContext must be called from within the AllowanceContextProvider"
        );

    return context;
}
