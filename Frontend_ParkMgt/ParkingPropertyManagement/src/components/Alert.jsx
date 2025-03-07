import { Snackbar } from '@mui/material'
import React, { memo, useEffect, useState } from 'react'

const Alert = (props) => {

    const [open, setOpen] = useState(false);

    const { isOpen = false, hideDuration = 6000, handleCLose, message = 'Message', location = { vertical: 'bottom', horizontal: 'left' }
        , color = 'success' } = props.alertConfig;

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
    }, [isOpen, hideDuration]);

    return (
        <Snackbar
            open={open}
            autoHideDuration={hideDuration}
            onClose={handleCLose}
            message={message}
            anchorOrigin={location}
            color={color}
        />
    )
}

export default memo(Alert);