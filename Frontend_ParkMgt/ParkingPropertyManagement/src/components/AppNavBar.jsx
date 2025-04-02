import { Box, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import React, { useEffect } from 'react'
import { useUserContext } from '../contexts/userContext'

const AppNavBar = () => {

    const currentUser = useUserContext()

    function capitalizeFirstLetter(str) 
    {
        if (!str) return ''; // Handle empty strings
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    useEffect(()=>{
        console.log("sidebar", currentUser)
    }, [])

  return (
    <Box style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        height: '90px',
        width: '100%'
    }} 
    sx={{
        paddingLeft: '20px',
        borderBottom: '2px solid',
        borderColor: grey[500],
        background: 'linear-gradient(to right,rgb(158, 108, 214),rgb(88, 26, 78))', 
    }}>
        <Typography sx={{
            fontSize: '36px',
            fontFamily: 'Pacifico',
            color: grey[200]
        }}>
            {`Welcome, ${capitalizeFirstLetter(currentUser?.userName)}`}
        </Typography>
    </Box>
  )
}

export default AppNavBar