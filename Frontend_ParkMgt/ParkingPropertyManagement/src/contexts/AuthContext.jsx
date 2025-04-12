import {createContext, useEffect, useState, useContext, useRef} from 'react'
import {app, auth} from '../firebase.js'
import {onAuthStateChanged,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
        updateProfile,
        setPersistence,
        browserSessionPersistence} from "firebase/auth"

const AuthContext = createContext();

const useAuth = ()=>{
    return useContext(AuthContext);
}

const AuthProvider = ({children}) => {

    const[currentUser, setCurrentUser] = useState(null);
    const[isLoadingUser, setIsLoadingUser] = useState(false);
    const[toggleCheckAuthChange, setToggleCheckAuthChange] = useState(0)

    const signUp = async (userName, email, password)=>{
        try
        {
            setIsLoadingUser(true);
            unregisterCurrentUser();
            setToggleCheckAuthChange(0) // Off and clear previous subscribe first

            // Step 1: Request create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // this user having the token is for a short moment during signup
            const user = userCredential.user;

             // Step 2: Update the profile after user creation
            await updateProfile(user, {
                displayName: userName,
            });

            // Manual Trigger to check the AuthChanged
            setToggleCheckAuthChange(Date.now()) // use timestamp since every stamp is new
        }
        catch(error)
        {
            setIsLoadingUser(false);
            throw error;
        }
    }

    const logIn = async (email, password)=>{
        try
        {
            setIsLoadingUser(true);
            unregisterCurrentUser();

            // Ensure Firebase persists session
            await setPersistence(auth, browserSessionPersistence);

            await signInWithEmailAndPassword(auth, email, password);

            // Manual Trigger to check the AuthChanged
            setToggleCheckAuthChange(Date.now()) // use timestamp since every stamp is new
        }
        catch(error)
        {
            setIsLoadingUser(false);
            throw error
        }
    }

    const signOutHandle = async ()=>{
        try
        {
            setIsLoadingUser(true);
            unregisterCurrentUser();
            await signOut(auth);
            setIsLoadingUser(false);
        }
        catch(error)
        {
            setIsLoadingUser(false);
            throw error
        }
    }

    const setToLocalStorage = (user)=>{
        const data = {
            uid : user.uid,
            userName : user.UserName,
            accessToken : user.accessToken
        }
        localStorage.clear()
        localStorage.setItem("userData", JSON.stringify(data))
    }

    const getLocalStorage = ()=>{
        return JSON.parse(getItem("userData"))
    }

    const registerCurrentUser = (user)=>{
        setCurrentUser(user)
        setToLocalStorage(user)
    }
    const unregisterCurrentUser = ()=>{
        setCurrentUser(null)
        localStorage.clear()
    }

    // Every Auth() render would check the current authed user and compare the uid
    // useEffect(() => {

    //     const storedUser = localStorage.getItem("userData");

    //     // only process if current local storage had user registered
    //     if (storedUser) {

    //         const user = JSON.parse(storedUser);

    //         console.log(auth);

    //         // retrieve the full Firebase user object using the stored uid
    //         const authUser = auth.currentUser;
    //         if (authUser && 
    //             authUser.uid === user.uid) 
    //         {
    //             registerCurrentUser(authUser)
    //         }
    //         else
    //         {
    //             console.log("Refresh No Auth User Or UID Not Match", authUser);
    //         }
    //     }
    //   }, []);

    useEffect(()=>{

        let unsubscribe = null;

        if (toggleCheckAuthChange > 0 || auth)
        {
            unsubscribe = onAuthStateChanged(auth, user=>{

                console.log("On Auth Changed", user);
    
                if (user)
                {
                    // add Back the updated profile to the current User
                    const addUser = {
                        ...user,
                        userName : user.displayName
                    }
                    registerCurrentUser(addUser);
                }
                else
                {
                    unregisterCurrentUser()
                }

                setIsLoadingUser(false);
            })
        }

        return () =>{
            if (unsubscribe)
            {
                unsubscribe();
            }
        }
        
    }, [toggleCheckAuthChange, auth])

    const value = {
        currentUser, setCurrentUser, isLoadingUser,
        getLocalStorage, registerCurrentUser, unregisterCurrentUser,
        signUp, logIn, signOutHandle
    }

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
}

export {AuthProvider, useAuth}