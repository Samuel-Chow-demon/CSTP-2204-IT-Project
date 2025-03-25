import { memo, useState, useEffect, useCallback, useRef } from "react";
import { useUserContext } from "../contexts/userContext.jsx";
import { useLocationDB } from "../contexts/LocationDBContext.jsx";
import { Box, Button, FormControl, Grid2, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import Fab from '@mui/material/Fab';
import { grey, purple } from "@mui/material/colors";
import useInputForm from "../hooks/useInputForm.js";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AlertDisplay from "../utilities/AlertDisplay.jsx";


const LocationForm = ({setOpenDialog, currentAllStreamResObj, currentLocationForm = {}})=>{

    const currentUser = useUserContext()

    const {
        createLocationRes, editLocationRes, setDBIsLoading
    } = useLocationDB();

    const isEditMode = Object.keys(currentLocationForm).length > 0;

    const createLocationForm = {
        name : "",
        address : "",
        parkingSiteInfoJSON : "", //'{ "size" : "100", "working hour" : "08 to 21"}',       // JSON String for key : value
        notifications: [],              // List of String
        streamResID : [],
        ownerUID : currentUser.uid,
    }

    const {
        formData, setFormData, resetFormData,
        enterInput, isDisableInput, setDisableInput,
        formInputErrors,
        setRegisterFieldErrChk,
        validateInput } = useInputForm(isEditMode ? currentLocationForm : createLocationForm);
    
    const [selectStreamResID, SetSelectStreamResID] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    
    useEffect(()=>{

        setRegisterFieldErrChk([
            {'field' : 'name', 'condition' : (inputFormData)=>inputFormData.name.length > 0, 'errMsg' : 'Location Name Cannot Be Empty'},
            {'field' : 'address', 'condition' : (inputFormData)=>inputFormData.address.length > 0, 'errMsg' : 'Address Cannot Be Empty'}
        ])

    }, []);

    // Get the current info JSON
    const infoJSON = formData.parkingSiteInfoJSON != "" ? JSON.parse(formData.parkingSiteInfoJSON) : {};
    
    const listOfJSONInfoObj = Object.entries(infoJSON).map(([key, value])=>{
        return {
            key : key,
            value : value,
            isError : false,
            errMsg : ""
        }
    });
    const [siteInfoList, setSiteInfoList] = useState(listOfJSONInfoObj);
    const [indexItemKeyRepeatList, setIndexItemKeyRepeatList] = useState([])

    const focusedFieldRef = useRef({ index: null, type: null }); // Store index & type ("key" or "value")

    const currentUsedKeyWithCountRef = useRef({})
    const prevRepeatListRef = useRef([]);

    const updateSiteInfoListEntry = (index, newKey, newValue) => {

        // Clear Repeat Key Check
        setErrorMessage("");

        // setSiteInfoList(prevList =>{

        //     const updateList = [...prevList];
        //     updateList[index] = {key : newKey, value : newValue};
        //     return updateList;
        // });

        setSiteInfoList(prevList => 
            prevList.map((item, i) => 
                i === index ? { ...item, key: newKey, value: newValue } : item
            )
        );
    };

    useEffect(()=>{

        const keyCount = {}
        let repeatItemIndexList = []

        siteInfoList.forEach((obj)=>{
            if (obj.key in keyCount)
            {
                keyCount[obj.key] += 1
            }
            else
            {
                keyCount[obj.key] = 1
            }
        })

        siteInfoList.forEach((obj, index)=>{

            if (keyCount[obj.key] > 1)
            {
                repeatItemIndexList.push(index)
            }
        })

        currentUsedKeyWithCountRef.current = keyCount;
        setIndexItemKeyRepeatList(repeatItemIndexList)
        handleUpdateParkingSiteInfoJSONStr()

    }, [siteInfoList])

    useEffect(()=>{

        if (JSON.stringify(prevRepeatListRef.current) !== JSON.stringify(indexItemKeyRepeatList)) 
        {
            console.log("RepeatList Trigger", siteInfoList)

            setSiteInfoList(prevList =>{

                const updateList = [...prevList];

                updateList.forEach((obj, index)=>{
                    if (indexItemKeyRepeatList.includes(index))
                    {
                        updateList[index] = {
                            ...obj,
                            isError : true,
                            errMsg : "Key Already Used"
                        }
                    }
                    else if (obj.isError)
                    {
                        updateList[index] = {
                            ...obj,
                            isError : false,
                            errMsg : ""
                        }
                    }
                })
                console.log("Updated List", updateList)
                return updateList;
            });

            // Update the previous list reference to prevent redundant updates
            prevRepeatListRef.current = indexItemKeyRepeatList;
        }

    }, [indexItemKeyRepeatList])


    const handleInputChange = useCallback((field)=>(e) => enterInput(field)(e), [enterInput]);

    const handleUpdateParkingSiteInfoJSONStr = ()=>{

        const jsonInfo = {}
        siteInfoList.forEach((obj)=>{
            jsonInfo[obj.key] = obj.value
        })

        setFormData((prevData)=>({
            ...prevData,
            parkingSiteInfoJSON : JSON.stringify(jsonInfo)
        }));
    }

    const proceedAction = async()=>{

        if (indexItemKeyRepeatList.length > 0)
        {
            setErrorMessage("Repeated Site Info Key Detected");
            return;
        }

        if (validateInput())
        {
            console.log(formData) 

            setDisableInput(true)
            setDBIsLoading(true)
            setOpenDialog(false)
    
            isEditMode ? 
            await editLocationRes({formData:formData,
                                   id:currentLocationForm.id,
                                   prevStreamIDList: currentLocationForm.streamResID}) : await createLocationRes({formData:formData});
    
            setDisableInput(false)

            // the DBIsloading would be return to false after reloading the DB in the StreamDBContext
        }
    }

    const ActionComponent = memo(()=>(

        <Box sx={{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
            border:'none',
            padding:'2px', gap:2}}
        >
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:purple[500]
                    }
                }} 
                onClick={proceedAction}>{isEditMode ? 'Edit' : 'Create'}</Button>
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:grey[600]
                    }
                }}
                onClick={()=>setOpenDialog(false)}>
                Cancel
            </Button>
        </Box>
    ));

    const handleSelectStreamResChange = (e) => {
        //console.log(e.target.value)
        SetSelectStreamResID(e.target.value);
      };

    const handleAddStreamRes = (e)=>{
        if (selectStreamResID != "")
        {
            const currentList = [...formData.streamResID]; // make a copy

            currentList.push(selectStreamResID)

            enterInput('streamResID', currentList)()
        }
    }

    const getStreamName = (id)=>{
        const streamObj = currentAllStreamResObj.find((obj)=>obj.id == id)
        return streamObj ? streamObj.name : "";
    }

    const removeStreamResID = (removeID)=>{

        let currentList = [...formData.streamResID]; // make a copy
        currentList = currentList.filter(id=> id != removeID)
        enterInput('streamResID', currentList)()
    }

    const handleCreateNewParkSiteInfo = ()=>{

        let newKeyIdx = 1
        const currentInfoSize = Object.keys(currentUsedKeyWithCountRef.current).length
        let newKey = `Key ${newKeyIdx}`

        while (currentInfoSize > 0 &&
                newKey in currentUsedKeyWithCountRef.current)
        {
            newKeyIdx += 1
            newKey = `Key ${newKeyIdx}`
        }

        setSiteInfoList(prevList => [
            ...prevList,
            {
                key: newKey,
                value : `Value ${newKeyIdx}`,
                isError : false,
                errMsg : ""
            }
        ]);
    }

     const KeyValueComponent = memo(({KVInfoObj, index})=>{

        // Ensure refs are stable
        const keyRef = useRef(null);
        const valueRef = useRef(null);

        // Handle focus after update
        useEffect(() => {
            const { index: focusedIndex, type } = focusedFieldRef.current;

            if (focusedIndex === index) {
                if (type === 'key' && keyRef.current) {
                    console.log("Focus - key", index);
                    keyRef.current.focus();
                } else if (type === 'value' && valueRef.current) {
                    console.log("Focus - value", index);
                    valueRef.current.focus();
                }
            }
        }, [siteInfoList, index]);

        return (
            <Box sx={{
                width: '100%',
                display: "flex",
                flexDirection: "row",
                justifyContent: 'space-around',
                alignItems: 'center',
                marginX: '10px',
                gap: 2
            }}>

                <TextField
                    fullWidth
                    //autoFocus={false}
                    required
                    inputRef={keyRef} // Use the stable ref for the key input
                    onFocus={
                        () => {
                            focusedFieldRef.current = { index, type: "key" }
                            //console.log("current Focus", focusedFieldRef.current)
                        }
                    }
                    onBlur={() => {
                        focusedFieldRef.current = { index: null, type: null }
                        //console.log("lost focus - key", index)
                    }}
                    disabled={isDisableInput}
                    sx={{
                        opacity: isDisableInput ? 0.5 : 1,
                    }}
                    error={KVInfoObj.isError}
                    label={"Item Key"}
                    placeholder={"Enter Item Key"}
                    size='Normal'
                    helperText={KVInfoObj.errMsg}
                    value={KVInfoObj.key}
                    onChange={(e) => updateSiteInfoListEntry(index, e.target.value, KVInfoObj.value)}
                />


                <TextField
                    fullWidth
                    //autoFocus={false}
                    required

                    inputRef={valueRef} // Use the stable ref for the value input

                    onFocus={
                        () => {
                            focusedFieldRef.current = { index, type: "value" }
                            //console.log("current Focus", focusedFieldRef.current)
                        }
                    }
                    onBlur={() => (focusedFieldRef.current = { index: null, type: null })}
                    disabled={isDisableInput}
                    sx={{
                        opacity: isDisableInput ? 0.5 : 1,
                    }}
                    error={false}
                    label={"Item value"}
                    placeholder={"Enter Item value"}
                    size='Normal'
                    helperText={""}
                    value={KVInfoObj.value}
                    onChange={(e) => updateSiteInfoListEntry(index, KVInfoObj.key, e.target.value)}
                />
            </Box>
        )
    });
    

    return (

        <div style={{width:'100%', display:'flex', flexDirection: 'column', gap:'20px'}}>

            {
                errorMessage &&
                AlertDisplay(errorMessage, "danger", 0, 4)
            }

            <TextField
                fullWidth
                autoFocus
                required
                disabled={isDisableInput}
                sx={{
                    opacity: isDisableInput ? 0.5 : 1,
                }}
                error={formInputErrors['name'].isError}
                label={"Location Name"}
                placeholder={"Enter Location Name"}
                size='Normal'
                helperText={formInputErrors['name'].message}
                value={formData['name']}
                onChange={handleInputChange('name')}
            />

            <TextField
                fullWidth
                autoFocus
                required={false}
                disabled={isDisableInput}
                sx={{
                    opacity: isDisableInput ? 0.5 : 1,
                }}
                error={formInputErrors['address'].isError}
                label={"Parking Site Location"}
                placeholder={"Enter Address Location"}
                size='Normal'
                helperText={formInputErrors['address'].message}
                value={formData['address']}
                onChange={handleInputChange('address')}
            />

           {/* Stream Res List */}
           <Box sx={{
                width:'100%',
                display:'flex',
                justifyContent: 'space-around',
                alignItems:'center',
                gap:'10px'
           }}>
                <FormControl fullWidth>
                        <InputLabel id="select-stream-res">Stream Resources</InputLabel>
                        <Select
                            labelId="select-stream-res"
                            id="select-stream"
                            value={selectStreamResID}
                            label="Stream Resources"
                            onChange={handleSelectStreamResChange}
                        >
                            {
                                currentAllStreamResObj
                                    .filter(streamResObj=>
                                        (formData.streamResID.length <= 0 ||
                                        !formData.streamResID.includes(streamResObj.id)) &&
                                        streamResObj.parkLocationID === ""
                                    )
                                    .map((streamResObj, index)=>(
                                        <MenuItem key={index} value={streamResObj.id}>{streamResObj.name}</MenuItem>
                                    ))
                            }
                        </Select>
                        
                </FormControl>
                <Fab size="small" color="secondary" aria-label="add"
                        onClick={handleAddStreamRes}>
                    <AddIcon />
                </Fab>
           </Box>

            <Grid2 sx={{width: '100%'}}>
                <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                    Added Stream Resources
                </Typography>

                <Paper>
                    <List>
                        {
                           formData.streamResID.map((streamResID, index)=>{

                                const streamName = getStreamName(streamResID)

                                if (streamName != "")
                                {
                                    return (
                                        <ListItem key={index}
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="delete"
                                                    onClick={()=>{removeStreamResID(streamResID)}}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                            >
                                            <ListItemText primary={streamName}/>
                                        </ListItem>
                                    )
                                }
                                else
                                {
                                    return <></>
                                }
                           })
                        }
                    </List>
                </Paper>
            </Grid2>

            <Grid2>

                <Box sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: "20px"
                }}>
                    <Typography sx={{ my: 2,}} 
                        variant="h6" component="div">
                        Parking Site Information
                    </Typography>

                    <Button sx={{
                        width: '100px',
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        color: grey[200],
                        backgroundColor: purple[700],
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover' : {
                            color: 'white',
                            backgroundColor: purple[400],
                            transform: 'scale(1.1)'
                        }
                        }}
                        onClick={handleCreateNewParkSiteInfo}
                    >
                        Add <AddCircleIcon sx={{ color: 'inherit'}}/>
                    </Button>
                </Box>

                    <Paper>
                        <List>
                            {
                                siteInfoList.map((keyValueObj, index)=>(

                                    <ListItem key={index}>
                                        <Box sx={{
                                            width : "100%",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: '20px'
                                        }}>
                                            <KeyValueComponent KVInfoObj={keyValueObj} index={index} />
                                            <Fab size="small" color="secondary" aria-label="add"
                                                    onClick={()=>{
                                                        setSiteInfoList(prevList => 
                                                            prevList.filter((_, idx) => idx !== index)
                                                        );
                                                    }}>
                                                <RemoveCircleIcon />
                                            </Fab>
                                        </Box>
                                    </ListItem>

                                ))
                            }
                        </List>
                    </Paper>

            </Grid2>



            <ActionComponent />

        </div>


    )
};

export default memo(LocationForm)