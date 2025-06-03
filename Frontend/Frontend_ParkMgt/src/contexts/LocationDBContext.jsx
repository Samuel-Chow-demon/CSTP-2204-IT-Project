import { createContext, useContext, useEffect, useState } from "react";
import { userCollectionRef, streamResCollectionRef, locationResCollectionRef } from "../database/database.js";
import {getCollectionDocByRefAndID, getCollectionDocsByMultipleRefAndID} from "../utilities/DBUtility.js"
import { deleteDoc, addDoc, doc, getDoc, getDocs, setDoc, limit, updateDoc, onSnapshot, query, where, writeBatch, arrayUnion, arrayRemove } from "firebase/firestore";
import {db} from '../firebase.js'
import {ALERT_SUCCESS_COLOR, ALERT_ERROR_COLOR} from '../components/constant.js'


const locationContext = createContext();

const useLocationDB = () => useContext(locationContext);

const LocationContextProvider = ({children, currentUser})=>{

    const [alertLocationDB, setAlertLocationDB] = useState({});
    const [isLocationDBUpdate, setLocationDBUpdate] = useState(false)

    const [locationDBInfo, setLocationDBInfo] = useState({
        name : "",
        address : "",
        parkingSiteInfoJSON : "",
        notifications : [],
        streamResID : [],
        ownerUID : "",
    })

    const [currentUserOwnedLocation, setCurrentUserOwnedLocation] = useState([]);

    const [isDBLoading, setDBIsLoading] = useState(true)

    const triggerRefreshLocationDB = ()=>{
        setLocationDBUpdate(!isLocationDBUpdate)
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

                    unsubscribeLocationDB = onSnapshot(
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
                                toggle: !alertLocationDB.toggle,
                                handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})}
                            });
                            setDBIsLoading(false);
                        }
                    );

                }
                else
                {
                    setDBIsLoading(false);
                    console.log("User Not Exist", error);
                    setAlertLocationDB({...alertLocationDB, message:'User Not Exist', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertLocationDB.toggle,
                        handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})}
                    });
                }
            }
            catch(error)
            {
                setDBIsLoading(false);
                console.log("Get Stream DB Fail", error);
                setAlertLocationDB({...alertLocationDB, message:'Access Location DB Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertLocationDB.toggle,
                    handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})}
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
            const allStreamResDocObj = await getCollectionDocsByMultipleRefAndID(streamResCollectionRef, formData.streamResID);

            if (userDoc.exists())
            {
                const batch = writeBatch(db);

                const newLocationResRef = doc(locationResCollectionRef);

                // Update Location Table
                batch.set(newLocationResRef, {
                    ...formData,
                    ownerUID : currentUser.uid,
                });

                // Update User Table
                batch.update(userRef, {
                        locationResIDs : arrayUnion(newLocationResRef.id)
                    });

                // Update Stream Res Table
                if (allStreamResDocObj.length > 0)
                {
                    allStreamResDocObj.forEach(Obj =>{
                        const { docRef, docObj, docData } = Obj

                        if (docObj.exists())
                        {
                            batch.update(docRef, {
                                parkLocationID : newLocationResRef.id
                            });
                        }
                    })
                }

                await batch.commit();

                triggerRefreshLocationDB();
                setAlertLocationDB({...alertLocationDB, message:`Success Added New Location Rescource ${formData.name}`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500,
                                        toggle: !alertLocationDB.toggle, handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})} });
            }
        }
        catch(error)
        {
            console.log("Add Location Doc Fail", error);
            setAlertLocationDB({...alertLocationDB, message:'Add New Location Res Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertLocationDB.toggle,
                handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})}
            });
        }
    }

    const editLocationRes = async({formData, id, prevStreamIDList})=>{

        try{

            const { docRef: locationRef, docObj: locationDoc, docData: locationData } = await getCollectionDocByRefAndID(locationResCollectionRef, id);
            const allStreamResDocObj = await getCollectionDocsByMultipleRefAndID(streamResCollectionRef, formData.streamResID);

            if (locationDoc.exists())
            {
                const batch = writeBatch(db);

                // Update Location Table
                batch.set(locationRef, formData, {merge: true});

                //await setDoc(locationRef, formData, {merge: true});

                // Check if remove some stream resources from location such that need to remove
                // the location id in that stream doc as well
                if (prevStreamIDList.length > 0)
                {
                    const allPrevStreamResDocObj = await getCollectionDocsByMultipleRefAndID(streamResCollectionRef, prevStreamIDList);
                    allPrevStreamResDocObj.forEach(Obj=>{
                        const { docRef, docObj, docData } = Obj

                        if (!formData.streamResID.includes(docRef.id))
                        {
                            if (docObj.exists())
                            {
                                batch.update(docRef, {
                                    parkLocationID : ""
                                });
                            }
                        }
                    })
                }

                // Update Stream Res Table
                if (allStreamResDocObj.length > 0)
                {
                    allStreamResDocObj.forEach(Obj =>{
                        const { docRef, docObj, docData } = Obj

                        if (docObj.exists())
                        {
                            batch.update(docRef, {
                                parkLocationID : locationRef.id
                            });
                        }
                    })
                }

                await batch.commit();

                triggerRefreshLocationDB();
                setAlertLocationDB({...alertLocationDB, message: `Success Modify Location Resource ${locationData.name}`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500,
                    toggle: !alertLocationDB.toggle, handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})} });
            }
            else
            {
                console.log("Location Resource Not Exist", error);
                setAlertLocationDB({...alertLocationDB, message: 'Location Resource Not Exist', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertLocationDB.toggle,
                    handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})}
                });
            }
        }
        catch(error){
            console.log("Modify Stream Doc Fail", error);
            setAlertLocationDB({...alertLocationDB, message: 'Modify Location Resource Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertLocationDB.toggle,
                handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})}
            });
        }
    }

    const deleteLocationRes = async({idList})=>{

        try{

            // const { docRef: locationRef, docObj: locationDoc, docData: locationData }
            const docRefObjList = await getCollectionDocsByMultipleRefAndID(locationResCollectionRef, idList);

            if (docRefObjList.length > 0)
            {
                const allLocationResName = docRefObjList.map((Obj)=>Obj.docData.name).join(', ') || '';

                // 2 Steps - Delete Location DB Doc, and Remove the LocationRes ID in the User DB
                // Not necessary to remove the related StreamRes Doc since the StreamRes Doc should can exist on its own
                const {docRef:userDocRef} = await getCollectionDocByRefAndID(userCollectionRef, currentUser.uid);

                const batchStep2 = writeBatch(db);

                const allPromises = docRefObjList.map(async(Obj)=>{

                    // Check if doc exist
                    if (Obj.docObj.exists())
                    {
                        // for each selected location, should have own stream Res list
                        const allStreamResDocObj = await getCollectionDocsByMultipleRefAndID(streamResCollectionRef, Obj.docData.streamResID);

                        // delete each selected location DB Doc
                        batchStep2.delete(Obj.docRef);

                        // remove the selected location id from the user table
                        batchStep2.update(userDocRef, {
                            locationResIDs : arrayRemove(Obj.docObj.id)
                        })

                        // Update Stream Res Table
                        if (allStreamResDocObj.length > 0)
                        {
                            allStreamResDocObj.forEach((eachObj) =>{
                                const { docRef, docObj, docData } = eachObj
        
                                if (docObj.exists())
                                {
                                    batchStep2.update(docRef, {
                                        parkLocationID : ""
                                    });
                                }
                            })
                        }
                    }
                });

                // wait all promises to finish
                await Promise.all(allPromises)

                // proceed
                await batchStep2.commit();

                triggerRefreshLocationDB();
                setAlertLocationDB({...alertLocationDB, message: `Success Remove Location Resource ${allLocationResName}`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500,
                    toggle: !alertLocationDB.toggle, handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})} });
            }
            else
            {
                console.log("Location Resource Not Exist", error);
                setAlertLocationDB({...alertLocationDB, message: 'Location Resource Not Exist', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertLocationDB.toggle,
                    handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})}
                });
            }
        }
        catch(error){
            console.log("Delete Location Resource Fail", error);
            setAlertLocationDB({...alertLocationDB, message: 'Delete Location Resource Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertLocationDB.toggle,
                handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})}
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