import { createContext, useState } from "react";
import { streamResCollectionRef } from "../database/database";
import {getCollectionDocByRefAndID} from "../database/database.js"
import { onSnapshot, writeBatch } from "firebase/firestore";
import {db} from '../firebase.js'


const streamContext = createContext();

const useStreamDB = useContext(streamContext);

const StreamContextProvider = ({children, currentUser})=>{

    const [alertStream, setAlertStream] = useState({});
    const [isStreamDBUpdate, setStreamDBUpdate] = useState(false)

    const [streamDBInfo, setStreamDBInfo] = useState({
        name : "",
        location : "",
        streamAPI : "",
        ownerUID : "",
        locationID : ""
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
                                allStream.push({
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
                                message: 'Real-time Listening Stream DB Fail',
                                color: 'error',
                                isOpen: true,
                                hideDuration: 2000,
                            });
                            setDBIsLoading(false);
                        }
                    );

                }
                else
                {
                    setDBIsLoading(false);
                    console.log("User Not Exist", error);
                    setAlertStream({...alertStream, message:'User Not Exist', color: 'error', isOpen: true, hideDuration: 2000 });
                }
            }
            catch(error)
            {
                setDBIsLoading(false);
                console.log("Get Stream DB Fail", error);
                setAlertStream({...alertStream, message:'Access Stream DB Fail', color: 'error', isOpen: true, hideDuration: 2000 });
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
                setAlertStream({...alertStream, message:`Success Added New Stream Rescource ${formData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
        }
        catch(error)
        {
            console.log("Add Stream Doc Fail", error);
            setAlertStream({...alertStream, message:'Add New Stream Res Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const editStreamRes = async({formData, id})=>{

        try{

            const { docRef: streamRef, docObj: streamDoc, docData: streamData } = await getCollectionDocByRefAndID(streamResCollectionRef, id);

            if (streamDoc.exists())
            {
                await setDoc(streamRef, formData, {merge: true});

                triggerRefreshStreamDB();
                setAlertStream({ ...alertStream, message: `Success Modify Stream Resource ${streamData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                console.log("Stream Resource Not Exist", error);
                setAlertStream({ ...alertStream, message: `Stream Resource Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error){
            console.log("Modify Stream Doc Fail", error);
            setAlertStream({ ...alertStream, message: 'Modify Stream Resource Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const deleteStreamRes = async({id})=>{

        try{

            const { docRef: streamRef, docObj: streamDoc, docData: streamData } = await getCollectionDocByRefAndID(streamResCollectionRef, id);

            if (streamDoc.exists())
            {
                const streamResName = streamData.name;

                // 2 Steps - Delete Stream DB Doc, and Remove the StreamRes ID in the User DB
                const {docRef:userDocRef} = await getCollectionDocByRefAndID(userCollectionRef, streamData.ownerUID);

                const batchStep2 = writeBatch(db);

                // delete stream DB Doc
                batchStep2.delete(streamRef);
                // remove the id from the list
                batchStep2.update(userDocRef, {
                    streamResIDs : arrayRemove(id)
                })

                // proceed
                await batchStep2.commit();

                triggerRefreshStreamDB();
                setAlertStream({...alertStream, message:`Success Remove Stream Resource ${streamResName}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                console.log("Stream Resource Not Exist", error);
                setAlertStream({ ...alertStream, message: `Stream Resource Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error){
            console.log("Delete Stream Resource Fail", error);
            setAlertStream({...alertStream, message:'Delete Stream Resource Fail', color: 'error', isOpen: true, hideDuration: 2000 });
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