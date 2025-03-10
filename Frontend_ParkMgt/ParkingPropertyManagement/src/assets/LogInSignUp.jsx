import { useTheme } from '@emotion/react';
import {useContext, useEffect, useState} from 'react'
import { AppBar, Box, Tab, Tabs, Typography } from '@mui/material';
import { green, blue, purple } from '@mui/material/colors'; // Import color palette
import LogIn from './LogIn';
import SignUp from './SignUp';
import userContext from '../context/userContext';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 2 }}>
            <Typography component={'span'} >{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

function a11yProps(index) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

const LogInSignUp = () => {

    const theme = useTheme();
    const [value, setValue] = useState(0);
    const {_currentUser, setCurrentUser} = useContext(userContext);

    useEffect(()=>{
      if (_currentUser)
      {
        setCurrentUser(null);
      }
    }, []);
  
    const handleChange = (event, newValue) => {
      setValue(newValue);
    };
  
    return (
    <div className="flex justify-center">
        <Box className="flex flex-col items-center mt-10" 
            sx={{ backgroundColor: 'transparent',
                  width: 600 }}>
            <AppBar position="static"
                    sx={{
                        backgroundColor: 'transparent',
                        boxShadow: 'none'
                      }}
            >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="full width tabs example"

                    TabIndicatorProps={{
                        style: {
                        backgroundColor: value === 0 ? purple[200] : purple[800],
                        },
                    }}

                    sx={{
                        backgroundColor: 'transparent',
                    }}
                >
                    <Tab label="Log In" 
                                {...a11yProps(0)} 
                                sx={{
                                    backgroundColor: value === 0 ? purple[800] : purple[200],
                                    borderTopLeftRadius: '12px',
                                }}/>
                    <Tab label="Sign Up"
                                {...a11yProps(1)} 
                                sx={{
                                    backgroundColor: value === 1 ? purple[400] : purple[200],
                                    borderTopRightRadius: '12px',
                                }}/>
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0} dir={theme.direction}>
                <LogIn clickHandleToSignUp={()=>handleChange(null, 1)} />
            </TabPanel>
            <TabPanel value={value} index={1} dir={theme.direction}>
                <SignUp clickHandleToLogin={()=>handleChange(null, 0)}/>
            </TabPanel>
        </Box>
    </div>
    );
}

export default LogInSignUp