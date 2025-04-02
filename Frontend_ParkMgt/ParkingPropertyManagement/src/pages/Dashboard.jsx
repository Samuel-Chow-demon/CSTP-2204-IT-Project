import { Box, CircularProgress } from '@mui/material'
import React, {useEffect, useState } from 'react'
import Sidebar from '../components/HomeSideBar'
import { Outlet } from 'react-router-dom'
import AppNavBar from '../components/AppNavBar'
import { useAuth } from '../contexts/AuthContext'
import { UserContextProvider } from '../contexts/userContext'
import { purple } from '@mui/material/colors'
import { StreamContextProvider } from '../contexts/StreamDBContext'
import { LocationContextProvider } from '../contexts/LocationDBContext'

const Dashboard = () => {

  const {currentUser,
        signOutHandle} = useAuth();

  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(()=>{

    if (currentUser)
    {
      console.log("Dashboard", currentUser);
      setIsLoadingUser(false);
    }

  }, [currentUser])

  return (
    <>
    {
      isLoadingUser ?
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: purple[50],
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress sx={{ size: 50 }} />
      </Box>
      :
      <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            width: '100vw',
            height: '100vh'
          }}>
            <Sidebar signOutHandle = {signOutHandle} />
            <Box sx={{
                display:'flex',
                flexDirection:'column',
                justifyContent: 'center',
                width: 'calc(100vw - 256px)',
                height: '100%'
              }}>
              <UserContextProvider currentUser={currentUser}>
                <StreamContextProvider currentUser={currentUser}>
                  <LocationContextProvider currentUser={currentUser}>

                    <AppNavBar/>
                    {/* use Outlet can repalce the child component */}
                    <Outlet />

                  </LocationContextProvider>
                </StreamContextProvider>
              </UserContextProvider>
            </Box>
        </Box>
      }
    </>
)
}

export default Dashboard