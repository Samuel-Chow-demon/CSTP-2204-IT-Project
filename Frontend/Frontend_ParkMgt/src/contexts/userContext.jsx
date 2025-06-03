import { createContext, useContext } from "react";

const userContext = createContext(null);

const useUserContext = ()=>useContext(userContext);

const UserContextProvider = ({children, currentUser})=>{

    return (
        <userContext.Provider value={currentUser}>
            {children}
        </userContext.Provider>
    )
}

export {useUserContext, UserContextProvider};