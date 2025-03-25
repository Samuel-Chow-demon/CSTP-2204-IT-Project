import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Switch from '@mui/material/Switch';
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ConnectedTvIcon from '@mui/icons-material/ConnectedTv';
import { grey, purple } from "@mui/material/colors";
import StopCircleIcon from '@mui/icons-material/StopCircle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const DisplayStream = ({ accID, streamResID, expTime }) => {
	
	// should be stored in key file
	const BACK_END_IP = "localhost" ; //"127.0.0.1";
	const BACK_END_PORT = 8204;
	
    const [token, setToken] = useState(null);

    // Use useRef for websocket
    const wsRef = useRef(null);

    const [isLoading, SetIsLoading] = useState(true)
    const [isStopped, SetIsStopped] = useState(true)
    const [isOnDetection, SetOnDetection] = useState(true)
    const [occupied, SetOccupied] = useState(0)
    const [empty, SetEmpty] = useState(0)
    const [message, SetMessage] = useState("Press Connect To Stream.")

    const videoRef = useRef(null);

    useEffect(() => {
        return () => {
            // Cleanup WebSocket on component unmount
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);
	
	const requestInfo = {
		accID : accID,
		expTime : expTime
	};

    const setError = (message)=>{
        SetMessage(message)
        SetIsLoading(true)
        SetIsStopped(true)
    }

    const receiveMessageHandle = async (event)=>{

        //console.log("Raw WebSocket message received:", event.data); 

        // If data is binary
        if (event.data instanceof Blob)
        {
            const blob = event.data;

             // Convert Blob to ArrayBuffer
            const arrayBuffer = await blob.arrayBuffer();
            const dataView = new DataView(arrayBuffer);

            const dataNumberOfData = dataView.getUint32(0, false);

            let imageDataSlicePos = 4 // default after the NumberOfData

            // if had data for display
            if (dataNumberOfData != 0)
            {
                // Extract the following Number of Data bytes (occupied and empty)
                const dataOccupied = dataView.getUint32(imageDataSlicePos + 0, false); // 2nd 4 bytes
                const dataEmpty = dataView.getUint32(imageDataSlicePos + 4, false);    // 3rd 4 bytes
                //console.log(`Occupied : ${dataOccupied}, Empty : ${dataEmpty}`);

                SetOccupied(dataOccupied)
                SetEmpty(dataEmpty)

                imageDataSlicePos += (dataNumberOfData * 4)
            }

            // Get the image data (everything except the last 8 bytes)
            const imageData = arrayBuffer.slice(imageDataSlicePos);

            //const blobImage = new Blob([event.data], { type: "image/jpeg" });
            const blobImage = new Blob([imageData], { type: "image/jpeg" });
            const imgUrl = URL.createObjectURL(blobImage);

            if (videoRef.current) {
                videoRef.current.src = imgUrl;
            }
        }
        // if data is string
        else if (typeof event.data === "string")
        {
            const jsonData = JSON.parse(event.data)
            console.log(`data : ${jsonData.message}`);

            if ("type" in jsonData)
            {
                switch (jsonData["type"])
                {
                    case "error":
                        console.log(`Error : ${jsonData.message}`);
                        break;
                    default:
                        console.log(`Unknown : ${jsonData}`);
                        break;
                }
            }
            else
            {
                console.log(`Receive Unknown Data : ${event.data}`)
            }
        }
    }

    const requestTokenAndStream = async() => {
        try
        {
            SetIsLoading(true)
            SetIsStopped(false)

            // Step 1: Request Token by accID
            const response = await axios.post(`http://${BACK_END_IP}:${BACK_END_PORT}/request-token`, requestInfo);
            const {token} = response.data;
            
            setToken(token);
            console.log(`token - ${token}`)
            
            // Step 2: Send Acknowledgment (Implicitly Done in Step 3)
            console.log("Received Token and Subpath, connecting WebSocket...");

            // Step 3: Connect WebSocket
            //const websocket = new WebSocket(`ws://${BACK_END_IP}:${BACK_END_PORT}/ws/${accID}/?token=${encodeURIComponent(token)}`);
            const websocket = new WebSocket(`ws://${BACK_END_IP}:${BACK_END_PORT}/ws/${accID}/${streamResID}/?token=${token}`);
            
            wsRef.current = websocket;


            websocket.onopen = () => {
                SetIsLoading(false)
                console.log("WebSocket connected.");

                // Every Reconnection Disable the Detection
                wsRef.current.send("DETECT_OFF")
                SetOnDetection((prev) => {
                    console.log("Previous detection state:", prev); // Debug log
                    return false;
                });
            };

            websocket.onmessage = (event) => {
                receiveMessageHandle(event)
            };

            websocket.onclose = (event) => {
                setError("WebSocket closed. Press Connect To Stream Again")
                console.log("WebSocket closed:");
                console.log("Code:", event.code);

                wsRef.current = null;

                SetIsLoading(true)
                SetIsStopped(true)
            };
            
            websocket.onerror = (event) => {
                setError(`WebSocket error. ${event.error}`)
                console.error("WebSocket error:", event);
            };
        }
        catch(error)
        {
            setError(`Get Token Error. ${error}`)
            console.error("Error fetching token:", error);
        }
    };

    const Connect = ()=>{

        if (wsRef.current)
        {
            wsRef.current.close();
            wsRef.current = null;
        }
            
        requestTokenAndStream();
    }

    const Stop = ()=>{

        const ws = wsRef.current;

        if (ws &&
            ws.readyState == WebSocket.OPEN)
        {
            console.log("front end request stop");

            ws.send("CLOSE"); // send to backend for close request
            setTimeout(()=>ws.close(), 100); // after 100 ms call the frontend to close web socket
        }
    }

    const ToggleDetection = ()=>{

        const ws = wsRef.current;

        if (ws &&
            ws.readyState == WebSocket.OPEN)
        {
            console.log(`front end request ${isOnDetection ? "OFF" : "ON"} Detection`);

            ws.send(isOnDetection ? "DETECT_OFF" : "DETECT_ON"); // send to backend for ON / OFF Detection
            setTimeout(()=>SetOnDetection(!isOnDetection), 50); // after 50 ms to toggle the UI
        }
    }

    // useEffect(() => {
		
    //     if (ws)
    //     {
    //         ws.close();
    //         setWs(null)
    //     }
		
	// 	requestTokenAndStream();
       
    //     return () => {
    //         if (ws) {
    //             ws.close();
	// 			setWs(null);
    //         }
    //     };
    // }, [accID]);

    return (
        <div style={{width: '100%', height: "100%"}}>
            <h2 style={{
                color: 'purple'
            }}>Live Stream</h2>
            {
                isLoading ?
                (
                    (
                        isStopped ?
                        <Box sx={{
                            width: '100%',
                            height: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            border: "2px solid",
                            borderColor: purple[500],
                            borderRadius: '10px'
                        }}>
                            <h2>{message}</h2>
                            {/* <button onClick={Connect}>Connect</button> */}

                            <Button sx={{
                                width: '200px',
                                padding: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '10px',
                                color: grey[200],
                                backgroundColor: "#739163",
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover' : {
                                    color: 'white',
                                    backgroundColor: "#3e6927",
                                    transform: 'scale(1.2)'
                                }
                                }}
                                onClick={Connect}
                            >

                                Connect <ConnectedTvIcon sx={{ color: 'inherit'}}/>
                            </Button>
                        </Box>
                        :
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
                    )
                )
                :
                <>
                    <Box sx={{
                        width: '90%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '5px',
                        paddingBottom: '10px'
                    }}>
                        <Box sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            paddingLeft: '10px',
                            gap: '20px'
                        }}>
                            <Box sx={{
                                width: "30%",
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'flex-start'
                            }}>

                                <Box sx={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    gap: '60px',
                                    paddingBottom: '10px'
                                }}>
                                    <Typography sx={{
                                        transform: 'scale(1.2)',
                                        color: grey[800]
                                    }}>
                                        Detection {isOnDetection ? "On" : "Off"}
                                    </Typography>
                                    <Switch checked={isOnDetection} onChange={ToggleDetection} name="Detection OnOff" sx={{transform: 'scale(1.2)'}} />
                                </Box>

                                <Button sx={{
                                    transform: 'scale(1.1)',
                                    width: '200px'
                                }}
                                variant="contained" endIcon={<StopCircleIcon />} onClick={Stop}>
                                    Stop
                                </Button>
                            </Box>

                            <TableContainer sx={{width: "40%"}} component={Paper}>
                                <Table sx={{ width: "100%" }} aria-label="data table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Metrics</TableCell>
                                            <TableCell align="right">Occupied</TableCell>
                                            <TableCell align="right">Empty</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>

                                        <TableRow
                                            key="Counts"
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                Counts
                                            </TableCell>
                                            <TableCell align="right">{isOnDetection ? occupied : "N/A"}</TableCell>
                                            <TableCell align="right">{isOnDetection ? empty : "N/A"}</TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Box>

                    </Box>

                    <Box sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            border: "2px solid",
                            borderColor: purple[500],
                            borderRadius: '10px'
                        }}>

                        <img ref={videoRef} alt="Live Stream" style={{ width: "100%" }} />

                    </Box>
                </>
            }
        </div>
    );
};

export default DisplayStream;