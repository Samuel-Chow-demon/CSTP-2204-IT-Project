import { doc, getDoc, getDocs, limit, orderBy, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';

const getCollectionDocByRefAndID = async(collectionRef, ID)=>{
    const docRef = doc(collectionRef, ID);
    const docObj = await getDoc(docRef);
    const docData = docObj.exists() ? docObj.data() : null;
    return {docRef, docObj, docData};
}

const getCollectionDocsByMultipleRefAndID = async (collectionRef, IDArray) => {
    if (!Array.isArray(IDArray))
    {
        throw new Error("IDs must be an array");
    }
    
    const docPromises = IDArray.map(async (ID) => {
        const docRef = doc(collectionRef, ID);
        const docObj = await getDoc(docRef);
        const docData = docObj.exists() ? docObj.data() : null;
        return { docRef, docObj, docData };
    });

    const idsDocs = await Promise.all(docPromises);
    return idsDocs;
};

const getCollectionDocByRefAndMatchField = async(collectionRef, field, value)=>{

    // can have multiple docs that match
    const queryDoc = query(collectionRef, where(field, "==", value));
    const querySnapShot = await getDocs(queryDoc);

    let docRefList = []
    let docObjList = []

    if (!querySnapShot.empty)
    {
        const promises = querySnapShot.docs.map(async (doc) => {
            const docObj = await getDoc(doc.ref);

            if (docObj.exists()) {
                docObjList.push({id:docObj.id, ...docObj.data()}); 
                docRefList.push(doc.ref);
            }
        });

        // Wait for all the promises to resolve
        await Promise.all(promises);
    }
    return {docRefList, docObjList};
}

const removeAllDocFromRefByIDs = async(collectionRef, IDs)=>{

    const batch = writeBatch(db);

    const promises = IDs.map(async(id)=>{

         // Get all the doc
         const {docRef:docRef, 
                docObj:doc,
                docData:docData} = await getCollectionDocByRefAndID(collectionRef, id);

        if (doc.exists())
        {
            batch.delete(docRef);
        }
    })

    // Wait all the async function process the batch.delete first
    await Promise.all(promises);

    // Commit all the batch recorded tasks
    await batch.commit();
}

export{ getCollectionDocByRefAndID, 
        getCollectionDocsByMultipleRefAndID,
        getCollectionDocByRefAndMatchField,
        removeAllDocFromRefByIDs
};