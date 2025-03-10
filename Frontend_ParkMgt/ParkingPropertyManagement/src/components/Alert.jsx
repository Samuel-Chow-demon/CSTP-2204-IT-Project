import { Snackbar } from '@mui/material'
import { grey } from '@mui/material/colors';
import React, { memo, useEffect, useState } from 'react'

const Alert = (props) => {

    const [open, setOpen] = useState(false);

    const { isOpen = false, hideDuration = 6000, handleCLose, message = 'Message', location = { vertical: 'top', horizontal: 'left' }
        , color = 'success', toggle = true } = props.alertConfig;

    useEffect(() => {

        if (isOpen)
        {
            setOpen(true);
            if (hideDuration) 
            {
                const timer = setTimeout(() => {
                    setOpen(false);
                }, hideDuration);
                return () => clearTimeout(timer);
            }
        }
        else
        {
            setOpen(false);
        }
    }, [isOpen, hideDuration, toggle]);

    return (
        <Snackbar
            open={open}
            autoHideDuration={hideDuration}
            onClose={handleCLose}
            message={message}
            anchorOrigin={location}
            //color={color}
            sx={{
                "& .MuiSnackbarContent-root": {
                    backgroundColor: color, // Apply background color
                    color: grey[800]
                }
            }}
        />
    )
}

export default memo(Alert);