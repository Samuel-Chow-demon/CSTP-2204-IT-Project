import { createContext, useContext, useEffect, useState } from "react";
import { userCollectionRef, streamResCollectionRef, locationResCollectionRef } from "../database/database.js";
import {getCollectionDocByRefAndID, getCollectionDocsByMultipleRefAndID} from "../utilities/DBUtility.js"
import { deleteDoc, addDoc, doc, getDoc, getDocs, setDoc, limit, updateDoc, onSnapshot, query, where, writeBatch, arrayUnion, arrayRemove } from "firebase/firestore";
import {db} from '../firebase.js'
import {ALERT_SUCCESS_COLOR, ALERT_ERROR_COLOR} from '../components/constant.js'


const streamContext = createContext();

const useStreamDB = () => useContext(streamContext);

const StreamContextProvider = ({children, currentUser})=>{

    const [alertStream, setAlertStream] = useState({});
    const [isStreamDBUpdate, setStreamDBUpdate] = useState(false)

    const [streamDBInfo, setStreamDBInfo] = useState({
        name : "",
        devLocation : "",
        streamAPI : "",
        ownerUID : "",
        parkLocationID : ""
    })

    const [currentUserOwnedStream, setCurrentUserOwnedStream] = useState([]);

    const [isDBLoading, setDBIsLoading] = useState(true)

    const triggerRefreshStreamDB = ()=>{
        setStreamDBUpdate(!isStreamDBUpdate)
    }

    useEffect(()=>{
        setAlertStream({...alertStream, message:'', isOpen: false });
    }, []);

    useEffect(()=>{

        let unsubscribeStreamDB = null;

        const getStreamDB = async()=>{

            try{

                const {docRef:userRef, docObj:userDoc, docData:userData} = await getCollectionDocByRefAndID(userCollectionRef, currentUser.uid);

                if (userDoc.exists())
                {
                    // Unsubcribe before new subscribe
                    if (unsubscribeStreamDB)
                    {
                        unsubscribeStreamDB();
                    }

                    unsubscribeStreamDB = onSnapshot(
                        query(streamResCollectionRef, where('ownerUID', "==", currentUser.uid)),
                        (snapshot)=>{

                            const allStreams = []
                            snapshot.forEach((doc) => {
                                allStreams.push({
                                    id : doc.id,
                                    ...doc.data()
                                })
                            });

                            setCurrentUserOwnedStream(allStreams);
                            setDBIsLoading(false)
                        },
                        (error) => {
                            console.error("Real-time Listening Stream DB Fail", error);
                            setAlertStream({
                                ...alertStream,
                                toggle: !alertStream.toggle,
                                message: 'Real-time Listening Stream DB Fail',
                                color: ALERT_ERROR_COLOR,
                                isOpen: true,
                                hideDuration: 2000,
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
                    setAlertStream({...alertStream, message:'User Not Exist', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                                        handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                                    });
                }
            }
            catch(error)
            {
                setDBIsLoading(false);
                console.log("Get Stream DB Fail", error);
                setAlertStream({...alertStream, message:'Access Stream DB Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                    handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                });
            }
        }

        if (currentUser)
        {
            getStreamDB();
        }
        else
        {
            setDBIsLoading(false);
        }

        return ()=>{
            if (unsubscribeStreamDB)
            {
                unsubscribeStreamDB();
            }
        }

    }, [isStreamDBUpdate, currentUser])

    const createStreamRes = async({formData})=>{

        try
        {
            const {docRef:userRef, docObj:userDoc, docData:userData} = await getCollectionDocByRefAndID(userCollectionRef, currentUser.uid);

            if (userDoc.exists())
            {
                const batch = writeBatch(db);

                const newStreamResRef = doc(streamResCollectionRef);
                batch.set(newStreamResRef, {
                    ...formData,
                    ownerUID : currentUser.uid
                });

                batch.update(userRef, {
                        streamResIDs : arrayUnion(newStreamResRef.id)
                    });

                await batch.commit();

                triggerRefreshStreamDB();
                setAlertStream({...alertStream, message:`Success Added New Stream Rescource ${formData.name}`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500, toggle: !alertStream.toggle,
                    handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                });
            }
        }
        catch(error)
        {
            console.log("Add Stream Doc Fail", error);
            setAlertStream({...alertStream, message:'Add New Stream Res Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
            });
            setDBIsLoading(false);
        }
    }

    const editStreamRes = async({formData, id})=>{

        try{

            const { docRef: streamRef, docObj: streamDoc, docData: streamData } = await getCollectionDocByRefAndID(streamResCollectionRef, id);

            if (streamDoc.exists())
            {
                await setDoc(streamRef, formData, {merge: true});

                triggerRefreshStreamDB();
                setAlertStream({...alertStream, message:`Success Modify Stream Resource ${streamData.name}`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500, toggle: !alertStream.toggle,
                    handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                });
            }
            else
            {
                console.log("Stream Resource Not Exist", error);
                setAlertStream({...alertStream, message: `Stream Resource Not Exist`, color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                    handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                });
                setDBIsLoading(false);
            }
        }
        catch(error){
            console.log("Modify Stream Doc Fail", error);
            setAlertStream({...alertStream, message: 'Modify Stream Resource Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
            });
            setDBIsLoading(false);
        }
    }

    const deleteStreamRes = async({idList})=>{

        try{

            //[ { docRef: streamRef, docObj: streamDoc, docData: streamData }  ]
            const docRefObjList = await getCollectionDocsByMultipleRefAndID(streamResCollectionRef, idList);

            if (docRefObjList.length > 0)
            {
                const allStreamResName = docRefObjList.map((Obj)=>Obj.docData.name).join(', ') || '';

                // 2 Steps - Delete Stream DB Doc, and Remove the StreamRes ID in the User DB
                const {docRef:userDocRef} = await getCollectionDocByRefAndID(userCollectionRef, currentUser.uid);

                const batchStep2 = writeBatch(db);

                const allPromises = docRefObjList.map(async(Obj)=>{

                    // Check if doc exist
                    if (Obj.docObj.exists())
                    {
                        const {docObj: locationDocObj, docRef:locationDocRef} = await getCollectionDocByRefAndID(locationResCollectionRef, Obj.docData.parkLocationID);

                        // delete each selected stream DB Doc
                        batchStep2.delete(Obj.docRef);
                        // remove the selected id from the list
                        batchStep2.update(userDocRef, {
                            streamResIDs : arrayRemove(Obj.docObj.id)
                        })

                        // remove the stream id in the location doc
                        if (locationDocObj.exists())
                        {
                            batchStep2.update(locationDocRef, {
                                streamResID : arrayRemove(Obj.docObj.id)
                            })
                        }
                    }
                });

                // wait all promises to finish
                await Promise.all(allPromises)

                // proceed
                await batchStep2.commit();

                triggerRefreshStreamDB();
                setAlertStream({...alertStream, message:`Success Remove Stream Resource ${allStreamResName}`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500, toggle: !alertStream.toggle,
                    handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                });
            }
            else
            {
                console.log("Stream Resource Not Exist", error);
                setAlertStream({...alertStream, message: `Stream Resource Not Exist`, color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                    handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
                });
                setDBIsLoading(false);
            }
        }
        catch(error){
            console.log("Delete Stream Resource Fail", error);
            setAlertStream({...alertStream, message: 'Delete Stream Resource Fail', color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 2000, toggle: !alertStream.toggle,
                handleCLose: ()=>{setAlertStream({isOpen: false, message:""})}
            });
            setDBIsLoading(false);
        }
    }

    return (

        <streamContext.Provider value={{
            alertStream, setAlertStream,
            isDBLoading, setDBIsLoading,
            currentUserOwnedStream,
            createStreamRes, editStreamRes, deleteStreamRes
        }}>
            {children}
        </streamContext.Provider>
    )
}

export {useStreamDB, StreamContextProvider};