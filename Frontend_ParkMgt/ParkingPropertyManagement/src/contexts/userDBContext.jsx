import { createContext, useContext, useEffect, useState } from 'react';
import { deleteDoc, addDoc, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import {userCollectionRef, USER_DB_NAME} from '../database/database.js'
import {db} from "../firebase.js"
import {getCollectionDocByRefAndID} from "../utilities/DBUtility.js"
import { useAuth } from './AuthContext.jsx';

const userDBContext = createContext()

const useUserDB = ()=>useContext(userDBContext)

const UserDBProvider = ({children})=>{

    const [isLoadingUserDB, SetIsLoadingUserDB] = useState(false)
    const [currentUserAtDB, setCurrentUserToDB] = useState(null)
    const [alertUserDB, setAlertUserDB] = useState({});

    const {registerCurrentUser} = useAuth()

    // Run Once when currentUserID changes
    useEffect(()=>{

        const loadUserDB = async()=>{

            if (currentUserAtDB && isLoadingUserDB)
            {
                console.log("currentUserAtDB", currentUserAtDB)
                const {docRef:userDocRef, docObj:userDoc, docData:userData} = await getCollectionDocByRefAndID(userCollectionRef, currentUserAtDB.uid);
    
                if (!userDoc.exists())
                {
                    await addUserDocWithId({id: currentUserAtDB.uid,
                                            userName: currentUserAtDB.userName, 
                                            email: currentUserAtDB.email, 
                                            token: currentUserAtDB.accessToken})
                }
                else
                {
                    // Register back the Database stored userName back to the AuthContext currentUser
                    registerCurrentUser({
                        ...currentUserAtDB,
                        userName : userData.username
                    })

                    // TO DO
                    // Read the currentUser ID and load the corresponding Location Res Collection IDs attribute
            
                    // Read the currentUser ID and load the corresponding Stream Res Collection IDs attribute
                }
        
                SetIsLoadingUserDB(false)
            }
        }

        loadUserDB();

    }, [currentUserAtDB])

    useEffect(()=>{
        setAlertUserDB({...alertUserDB, message:'', isOpen: false });
    }, []);

    const addUserDocWithId = async ({id, userName, email, token})=>{

        const data = {
            username : userName,
            email : email,
            token : token,
            locationResIDs : [],
            streamResIDs : []
        }

        try{

            console.log("id", id)
            console.log("data", data)

            // self create a document with defined id
            const docRef = doc(db, USER_DB_NAME, id)

            // use setDoc to add data to the document
            await setDoc(docRef, data)

            setAlertUserDB({...alertUserDB, message:`Success Added New User ${userName}`, color: 'success', isOpen: true, hideDuration: 1500 });
        }
        catch(error)
        {
            const msg = `Create User Doc - Add New User Error : ${error.message}`
            setAlertUserDB({...alertUserDB, message:msg, color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const editUserDocWithId = async({id, data})=>{

        const {docRef:userDocRef, docObj:userDoc, docData:userData} = await getCollectionDocByRefAndID(userCollectionRef, id);

        try{

            if (userDoc.exists())
            {
                await setDoc(userDocRef, data, {merge : true})

                setAlertUserDB({...alertUserDB, message:`Success Edit User ${userName}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const msg = `Edit User Doc ${id} - Not Exist`
                setAlertUserDB({...alertUserDB, message:msg, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            const msg = `Edit User Doc ${id} - Error : ${error.message}`
            setAlertUserDB({...alertUserDB, message:msg, color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const removeUserDocWithId = async({id})=>{

        const {docRef:userDocRef, docObj:userDoc, docData:userData} = await getCollectionDocByRefAndID(userCollectionRef, id)

        try{

            if (userDoc.exists())
            {
                const batch = writeBatch(db);

                // To Do
                // Remove all related LocationID Doc
                if (userDoc.locationResIDs?.length > 0)
                {
                    await removeAllDocFromRefByIDs(locationResCollectionRef, userDoc.locationResIDs);
                }
                // Remove all related StreamID Doc
                if (userDoc.streamResIDs?.length > 0)
                {
                    await removeAllDocFromRefByIDs(streamResCollectionRef, userDoc.streamResIDs);
                }

                // Do delete user doc
                batch.delete(userDocRef);
                await batch.commit();

                setAlertUserDB({...alertUserDB, message:`Success Remove User ${userName}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const msg = `Remove User Doc ${id} - Not Exist`
                setAlertUserDB({...alertUserDB, message:msg, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            const msg = `Remove User Doc ${id} - Error : ${error.message}`
            setAlertUserDB({...alertUserDB, message:msg, color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    return(
        <userDBContext.Provider value = {{
            setCurrentUserToDB, alertUserDB,
            isLoadingUserDB, SetIsLoadingUserDB,
            addUserDocWithId, editUserDocWithId,
            removeUserDocWithId
        }}>
            {children}
        </userDBContext.Provider>
    )
}

export{useUserDB, UserDBProvider}