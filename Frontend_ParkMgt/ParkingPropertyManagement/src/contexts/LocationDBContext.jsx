import { createContext, useState } from "react";
import { locationResCollectionRef } from "../database/database.js";
import {getCollectionDocByRefAndID} from "../database/database.js"
import { deleteDoc, addDoc, doc, getDoc, getDocs, setDoc, limit, updateDoc, onSnapshot, query, where, writeBatch, arrayUnion } from "firebase/firestore";
import {db} from '../firebase.js'
import {ALERT_SUCCESS_COLOR, ALERT_ERROR_COLOR} from '../components/constant.js'


const locationContext = createContext();

const useLocationDB = useContext(locationContext);

const LocationContextProvider = ({children, currentUser})=>{

    const [alertLocationDB, setAlertLocationDB] = useState({});
    const [isLocationDBUpdate, setLocationDBUpdate] = useState(false)

    const [locationDBInfo, setLocationDBInfo] = useState({
        name : "",
        address : "",
        parkingSiteJSONInfo : "",
        notifications : [],
        streamResID : [],
        ownerUID : "",
    })

    const [currentUserOwnedLocation, setCurrentUserOwnedLocation] = useState([]);

    const [isDBLoading, setDBIsLoading] = useState(true)

    const triggerRefreshLocationDB = ()=>{
        setStreamDBUpdate(!isStreamDBUpdate)
    }

    useEffect(()=>{
        setAlertLocationDB({...alertLocationDB, message:'', isOpen: false });
    }, []);

    useEffect(()=>{

        let unsubscribeLocationDB = null;

        const getLocationDB = async()=>{

            try{

                const {docRef:userRef, docObj:userDoc, docData:userData} = await getCollectionDocByRefAndID(userCollectionRef, currentUser.uid);

                if (userDoc.exists())
                {
                    // Unsubcribe before new subscribe
                    if (unsubscribeLocationDB)
                    {
                        unsubscribeLocationDB();
                    }

                    unsubscribeStreamDB = onSnapshot(
                        query(locationResCollectionRef, where('ownerUID', "==", currentUser.uid)),
                        (snapshot)=>{

                            const allLocations = []
                            snapshot.forEach((doc) => {
                                allLocations.push({
                                    id : doc.id,
                                    ...doc.data()
                                })
                            });

                            setCurrentUserOwnedLocation(allLocations);
                            setDBIsLoading(false)
                        },
                        (error) => {
                            console.error("Real-time Listening Location DB Fail", error);
                            setAlertLocationDB({
                                ...alertLocationDB,
                                message: 'Real-time Listening Location DB Fail',
                                color: ALERT_ERROR_COLOR,
                                isOpen: true,
                                hideDuration: 2000,
                                toggle: !alertStream.toggle,
                                handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                            });
                            setDBIsLoading(false);
                        }
                    );

                }
                else
                {
                    setDBIsLoading(false);
                    console.log("User Not Exist", error);
                    setAlertLocationDB({...alertLocationDB, message:'User Not Exist', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                        handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                    });
                }
            }
            catch(error)
            {
                setDBIsLoading(false);
                console.log("Get Stream DB Fail", error);
                setAlertLocationDB({...alertLocationDB, message:'Access Location DB Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                    handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                });
            }
        }

        if (currentUser)
        {
            getLocationDB();
        }
        else
        {
            setDBIsLoading(false);
        }

        return ()=>{
            if (unsubscribeLocationDB)
            {
                unsubscribeLocationDB();
            }
        }

    }, [isLocationDBUpdate, currentUser])

    const createLocationRes = async({formData})=>{

        try
        {
            const {docRef:userRef, docObj:userDoc, docData:userData} = await getCollectionDocByRefAndID(userCollectionRef, currentUser.uid);

            if (userDoc.exists())
            {
                const batch = writeBatch(db);

                const newLocationResRef = doc(locationResCollectionRef);
                batch.set(newLocationResRef, {
                    ...formData,
                    ownerUID : currentUser.uid,
                    streamResID : []
                });

                batch.update(userRef, {
                        locationResIDs : arrayUnion(newLocationResRef.id)
                    });

                await batch.commit();

                triggerRefreshLocationDB();
                setAlertLocationDB({...alertLocationDB, message:`Success Added New Location Rescource ${formData.name}`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500,
                                        toggle: !alertStream.toggle, handleCLose: ()=>{setAlertStream({isOpen: false, message:""})} });
            }
        }
        catch(error)
        {
            console.log("Add Location Doc Fail", error);
            setAlertLocationDB({...alertLocationDB, message:'Add New Location Res Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
            });
        }
    }

    const editLocationRes = async({formData, id})=>{

        try{

            const { docRef: locationRef, docObj: locationDoc, docData: locationData } = await getCollectionDocByRefAndID(locationResCollectionRef, id);

            if (locationDoc.exists())
            {
                await setDoc(locationRef, formData, {merge: true});

                triggerRefreshLocationDB();
                setAlertLocationDB({...alertLocationDB, message: `Success Modify Location Resource ${locationData.name}`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500,
                    toggle: !alertStream.toggle, handleCLose: ()=>{setAlertStream({isOpen: false, message:""})} });
            }
            else
            {
                console.log("Location Resource Not Exist", error);
                setAlertLocationDB({...alertLocationDB, message: 'Location Resource Not Exist', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                    handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                });
            }
        }
        catch(error){
            console.log("Modify Stream Doc Fail", error);
            setAlertLocationDB({...alertLocationDB, message: 'Modify Location Resource Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
            });
        }
    }

    const deleteLocationRes = async({id})=>{

        try{

            const { docRef: locationRef, docObj: locationDoc, docData: locationData } = await getCollectionDocByRefAndID(locationResCollectionRef, id);

            if (locationDoc.exists())
            {
                const locationResName = locationData.name;

                // 2 Steps - Delete Location DB Doc, and Remove the LocationRes ID in the User DB
                // Not necessary to remove the related StreamRes Doc since the StreamRes Doc should can exist on its own
                const {docRef:userDocRef} = await getCollectionDocByRefAndID(userCollectionRef, locationData.ownerUID);

                const batchStep2 = writeBatch(db);

                // delete location DB Doc
                batchStep2.delete(locationRef);
                // remove the id from the user list
                batchStep2.update(userDocRef, {
                    locationResIDs : arrayRemove(id)
                })

                // proceed
                await batchStep2.commit();

                triggerRefreshLocationDB();
                setAlertLocationDB({...alertLocationDB, message: `Success Remove Location Resource ${locationResName}`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500,
                    toggle: !alertStream.toggle, handleCLose: ()=>{setAlertStream({isOpen: false, message:""})} });
            }
            else
            {
                console.log("Location Resource Not Exist", error);
                setAlertLocationDB({...alertLocationDB, message: 'Location Resource Not Exist', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                    handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                });
            }
        }
        catch(error){
            console.log("Delete Location Resource Fail", error);
            setAlertLocationDB({...alertLocationDB, message: 'Delete Location Resource Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
            });
        }
    }

    return (

        <locationContext.Provider value={{
            alertLocationDB, setAlertLocationDB,
            isDBLoading, setDBIsLoading,
            currentUserOwnedLocation,
            createLocationRes, editLocationRes, deleteLocationRes
        }}>
            {children}
        </locationContext.Provider>
    )
}

export {useLocationDB, LocationContextProvider};