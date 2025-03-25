import { useContext, useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, AccountCircle, Logout } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { indigo } from '@mui/material/colors';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import { CONST_PATH } from './constant';

function Sidebar({signOutHandle}) {

    const navigate = useNavigate();

    const ListItemComponent = ({IconComponent, itemText, buttonClick = ()=>{}})=>{

        return (
            <ListItem disablePadding>
                <ListItemButton component="a" href="#"
                    onClick={buttonClick}
                    sx={{ 
                        transition: 'transform 0.2s ease-in', 
                        '&:hover': { 
                            transform: 'translateX(8px)',
                            backgroundColor: '#e4c4f2'
                          } 
                        }}>
                    <ListItemIcon>
                        {IconComponent}
                    </ListItemIcon>
                    <ListItemText 
                        primary={itemText} 
                        primaryTypographyProps={{ 
                                                fontSize: '1.25rem', 
                                                color: 'text.secondary' 
                                                }} />
                </ListItemButton>
            </ListItem>
        );
    };

    const handleSignOut = async()=>{
      try
      {
          await signOutHandle()

          //navigate(CONST_PATH.landing)
          window.location.href = '/';
      }
      catch(error)
      {
          console.log(`Sign Out Error : ${error}`)
      }
  }


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '256px',
        minWidth: '256px',
        height: '100%',
        bgcolor: 'white',
        // borderRadius: '0 24px 24px 0',
        overflow: 'hidden'
      }}
    >
      {/* Logo Box */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: indigo[100],
          height: '79px',
          boxShadow: 1,
          overflow: 'hidden'
        }}
      >
         {/* Temp remark for the Logo */}

        {/* <img src={iconSimpleWork} alt="" style={{ marginRight: 8, height: '310%'}} onClick={handleLogoClick}/> */}

      </Box>

      {/* Menu List */}
      <List sx={{ py: 3 }}>


        <ListItemComponent 
            IconComponent={<Dashboard fontSize="large" sx={{ color: '#6d727e' }} />}
            itemText={"Dashboard"}
            buttonClick={()=>navigate(CONST_PATH.home)}
        />
        <ListItemComponent 
            IconComponent={<LiveTvIcon fontSize="large" sx={{ color: '#6c727f' }} />}
            itemText={"Stream Profile"}
            buttonClick={()=>navigate(CONST_PATH.home + CONST_PATH.streamProf)}
        />
        <ListItemComponent 
            IconComponent={<EditLocationIcon fontSize="large" sx={{ color: '#6e727d' }} />}
            itemText={"Location Profile"}
            buttonClick={()=>navigate(CONST_PATH.home + CONST_PATH.locationProf)}
        />
        {/* <ListItemComponent 
            IconComponent={<AccountCircle fontSize="large" sx={{ color: '#6e727d' }} />}
            itemText={"Account Profile"}
            buttonClick={()=>navigate(CONST_PATH.home + CONST_PATH.accountProf)}
        /> */}
        <ListItemComponent 
            IconComponent={<Logout fontSize="large" sx={{ color: '#6f727c' }} />}
            itemText={"Logout"}
            buttonClick={handleSignOut}
        />
       
      </List>
    </Box>
  ); 
}

export default Sidebar
