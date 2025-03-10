import { memo, useState, useEffect, useCallback } from "react";
import { useUserContext } from "../contexts/userContext";
import { useStreamDB } from "../contexts/StreamDBContext";
import userInputForm from "../hooks/useInputForm.js"
import { Box, Button, TextField } from "@mui/material";
import { grey, purple } from "@mui/material/colors";
import useInputForm from "../hooks/useInputForm.js";


const StreamForm = ({setOpenDialog, currentStreamForm = {}})=>{

    const currentUser = useUserContext()

    const {
        createStreamRes, editStreamRes, setDBIsLoading
    } = useStreamDB();

    const isEditMode = Object.keys(currentStreamForm).length > 0;

    const createStreamForm = {
        name : "",
        devLocation : "",
        streamAPI : "",
        ownerUID : currentUser.uid,
        parkLocationID : ""
    }

    const {
        formData, setFormData, resetFormData,
        enterInput, isDisableInput, setDisableInput,
        formInputErrors,
        setRegisterFieldErrChk,
        validateInput } = useInputForm(isEditMode ? currentStreamForm : createStreamForm);


    useEffect(()=>{

        setRegisterFieldErrChk([
            {'field' : 'name', 'condition' : (inputFormData)=>inputFormData.name.length > 0, 'errMsg' : 'Stream Name Cannot Empty'},
            {'field' : 'streamAPI', 'condition' : (inputFormData)=>inputFormData.streamAPI.length > 0, 'errMsg' : 'Stream API Cannot Empty'}
        ])
    
    }, []);

    const handleInputChange = useCallback((field)=>(e) => enterInput(field)(e), [enterInput]);

    const proceedAction = async()=>{

        if (validateInput())
        {
            setDisableInput(true)
            setDBIsLoading(true)
            setOpenDialog(false)
    
            isEditMode ? 
            await editStreamRes({formData:formData, id:currentStreamForm.id}) : await createStreamRes({formData:formData});
    
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

    return (

        <div style={{width:'100%', display:'flex', flexDirection: 'column', gap:'16px'}}>

            <TextField
                fullWidth
                autoFocus
                required
                disabled={isDisableInput}
                sx={{
                    opacity: isDisableInput ? 0.5 : 1,
                }}
                error={formInputErrors['name'].isError}
                label={"Stream Name"}
                placeholder={"Enter Stream Name"}
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
                error={formInputErrors['devLocation'].isError}
                label={"Device Location"}
                placeholder={"Enter Device Location"}
                size='Normal'
                helperText={formInputErrors['devLocation'].message}
                value={formData['devLocation']}
                onChange={handleInputChange('devLocation')}
            />

            <TextField
                fullWidth
                autoFocus
                required
                disabled={isDisableInput}
                sx={{
                    opacity: isDisableInput ? 0.5 : 1,
                }}
                error={formInputErrors['streamAPI'].isError}
                label={"Stream API or Path"}
                placeholder={"Enter Stream API or Path"}
                size='Normal'
                helperText={formInputErrors['streamAPI'].message}
                value={formData['streamAPI']}
                onChange={handleInputChange('streamAPI')}
            />

            <ActionComponent />

        </div>


    )
};

export default memo(StreamForm)