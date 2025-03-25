import { Box, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { purple } from '@mui/material/colors'
import { useState } from 'react'

import { useLocationDB } from '../contexts/LocationDBContext'
import { useStreamDB } from '../contexts/StreamDBContext'
import { useUserContext } from '../contexts/userContext'
import DisplayStream from '../components/DashboardStream'
import Alert from '../components/Alert'

const Workspace = () => {

  const {
    alertStream,
    isDBLoading : isStreamDBLoading,
    currentUserOwnedStream
  } = useStreamDB()

const {
    alertLocationDB,
    isDBLoading : isLocationDBLoading, 
    setDBIsLoading,
    currentUserOwnedLocation,
} = useLocationDB()

// {
//   uid : user.uid,
//   userName : user.UserName,
//   accessToken : user.accessToken
// }
const currentUser = useUserContext(); // 

const [selectLocationID, SetSelectLocationID] = useState("");
const [selectStreamResID, SetSelectStreamResID] = useState("");

const handleSelectLocationChange = (e) => {
  //console.log(e.target.value)
  SetSelectLocationID(e.target.value);
};

const handleSelectStreamChange = (e) => {
  //console.log(e.target.value)
  SetSelectStreamResID(e.target.value);
};

  return (
    <>
      {
        isStreamDBLoading || isLocationDBLoading ?
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: purple[50],
            width: '100%',
            height: '100%',
        }}>
            <CircularProgress sx={{ size: 50 }} />
        </Box>
        :
        <>
          <Alert alertConfig={alertStream}/>
          <Alert alertConfig={alertLocationDB}/>
          <Box sx={{
              backgroundColor: purple[50],
              width: '100%',
              height: '100%',
              padding: '20px',
              display: "flex",
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}>
              
              <Box sx={{
                width: "50%",
                display: "flex",
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '20px',
                paddingBottom: '40px'
              }}>
                <FormControl fullWidth>
                    <InputLabel id="select-location-res">Locations</InputLabel>
                    <Select
                        labelId="select-location-res"
                        id="select-location"
                        value={selectLocationID}
                        label="Location"
                        onChange={handleSelectLocationChange}
                        sx={{
                          backgroundColor: "White"
                        }}
                    >
                        {
                            currentUserOwnedLocation
                                // .filter(locationObj=>
                                // )
                                .map((locationObj, index)=>(
                                    <MenuItem key={index} value={locationObj.id}>{locationObj.name}</MenuItem>
                                ))
                        }
                    </Select>                       
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="select-stream-res">Streams</InputLabel>
                    <Select
                        labelId="select-stream-res"
                        id="select-stream"
                        value={selectStreamResID}
                        label="Stream"
                        onChange={handleSelectStreamChange}
                        sx={{
                          backgroundColor: "White"
                        }}
                    >
                        {
                            currentUserOwnedStream
                                .filter(streamObj=>
                                  streamObj.parkLocationID === selectLocationID
                                )
                                .map((streamObj, index)=>(
                                    <MenuItem key={index} value={streamObj.id}>{streamObj.name}</MenuItem>
                                ))
                        }
                    </Select>                       
                  </FormControl>

              </Box>

              <DisplayStream accID={currentUser.uid}
                              streamResID={selectStreamResID}
                              expTime={60} />
          </Box>

        </>
      }
    </>
  )
}

export default Workspace