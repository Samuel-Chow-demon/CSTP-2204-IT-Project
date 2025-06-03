import { Box, TextField } from '@mui/material'
import React, { useCallback, useEffect } from 'react'
import useInputForm from './useInputForm';

const useSiteInfoKeyValue = ({infoKeyAndValObj, setInfoKeyAndValObj, index, currentKeyValue = {}}) => {
    
    const isEditMode = Object.keys(currentKeyValue).length > 0;

    const createKeyValue = {
        key : "",
        value : ""
    }

    const {
        formData,
        isDisableInput, setDisableInput,
        formInputErrors, enterInput,
        setRegisterFieldErrChk} = useInputForm(isEditMode ? currentKeyValue : createKeyValue);


    useEffect(()=>{
    
            setRegisterFieldErrChk([
                {'field' : 'key', 'condition' : (inputFormData)=>Object.keys(infoKeyAndValObj).includes(inputFormData), 'errMsg' : 'Key Already Used'}
            ])
        
        }, [infoKeyAndValObj]);

    const handleInputChange = useCallback((field)=>(e) => enterInput(field)(e), [enterInput]);

    // Handle key or value changes
    const handleChange = (field, newValue) => {

        // for useInputForm hooks
        handleInputChange(field, newValue)()

        setInfoKeyAndValObj((prev) => {
            const updatedEntries = Object.entries(prev);
            const entityIdx = field === 'key' ? 0 : 1;
            updatedEntries[index][entityIdx] = newValue;
            return Object.fromEntries(updatedEntries); // Returns a new object but keeps structure
        });
    };

    const KeyValueComponent = ()=>(
        <Box sx={{
            width: '100%',
            display: "row",
            justifyContent: 'space-around',
            alignItems: 'center',
            marginX: '10px'
        }}>

            <TextField
                fullWidth
                autoFocus
                required
                disabled={isDisableInput}
                sx={{
                    opacity: isDisableInput ? 0.5 : 1,
                }}
                error={formInputErrors['key'].isError}
                label={"Item Key"}
                placeholder={"Enter Item Key"}
                size='Normal'
                helperText={formInputErrors['key'].message}
                value={formData['key']}
                onChange={(e) => handleChange('key', e.target.value)}
            />


            <TextField
                fullWidth
                autoFocus
                required
                disabled={isDisableInput}
                sx={{
                    opacity: isDisableInput ? 0.5 : 1,
                }}
                error={formInputErrors['value'].isError}
                label={"Item value"}
                placeholder={"Enter Item value"}
                size='Normal'
                helperText={formInputErrors['value'].message}
                value={formData['value']}
                onChange={(e) => handleChange('value', e.target.value)}
            />
        </Box>
    )

    return {
        KeyValueComponent, formData, formInputErrors
    };
}

export default useSiteInfoKeyValue;