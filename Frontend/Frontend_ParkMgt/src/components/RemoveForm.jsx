import { Box, Button, TextField, Typography } from '@mui/material';
import {useEffect, memo, useCallback} from 'react'
import useInputForm from '../hooks/useInputForm';
import { grey, red } from '@mui/material/colors';

const RemoveForm = ({removeFromDB, setDBIsLoading, categoryName, targetName, setOpenDialog, itemList = []})=>{

    const removeTargetForm = {
        'inputTargetName' : "",
      }

    const {
        formData,
        enterInput, isDisableInput, setDisableInput,
        formInputErrors,
        setRegisterFieldErrChk,
        validateInput } = useInputForm(removeTargetForm);

    useEffect(()=>{

        setRegisterFieldErrChk([
                {'field' : 'inputTargetName', 'condition' : (inputFormData)=>inputFormData.inputTargetName === targetName, 'errMsg' : `${categoryName} Not Matched`}
            ])
      
          }, [])

    const handleInputChange = useCallback((field)=>(e) => enterInput(field)(e), [enterInput]);

    const proceedRemove = async()=>{

        if (validateInput())
        {
            setDisableInput(true)
            setDBIsLoading(true)
            setOpenDialog(false)
  
            await removeFromDB();
  
            setDisableInput(false)

            // the DBIsloading would be return to false after reloading the DB in the StreamDBContext
        }
    }

    const MemoizedTextField = memo(({ value, onChange, error, helperText, disabled }) => {
        return (
            <TextField
                fullWidth
                autoFocus
                required
                disabled={disabled}
                sx={{
                    opacity: disabled ? 0.5 : 1,
                }}
                error={error}
                helperText={helperText}
                label={`Enter ${categoryName} To Remove`}
                value={value}
                placeholder={`${targetName}`}
                size='Normal'
                onChange={onChange}
            />
          );
      });

      const RemoveFormComponents = memo(()=>(
            <>
                <Typography sx={{
                    color: red[800],
                    fontSize: '24px',
                    textAlign: 'center',
                    whiteSpace: 'pre-line'
                }}>Sure To Remove ?{'\n'} It Will Be Removed Permanently.</Typography>

                {
                    (itemList.length > 0) ? (
                    <>
                        {itemList.map((item, index) =>(
                            <span key={index}>{item}</span>
                        ))}
                    </>)
                    :
                    null
                }

                <MemoizedTextField
                    fullWidth
                    required
                    disabled={isDisableInput}
                    error={formInputErrors['inputTargetName'].isError}
                    helperText={formInputErrors['inputTargetName'].message}
                    value={formData['inputTargetName']}
                    onChange={handleInputChange('inputTargetName')}
                />
            </>
        ));

      const RemoveActionComponent = memo(()=>(

            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', border:'none', gap:30}}>
                <Button sx={{
                        '&:hover':{
                            color:grey[100],
                            backgroundColor:red[300]
                        }
                    }} 
                    onClick={proceedRemove}>Remove</Button>
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

    return (<>
                <RemoveFormComponents />
                <RemoveActionComponent />
            </>);
}

export default memo(RemoveForm)