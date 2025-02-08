import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const DisplayStream = ({ accID, expTime }) => {
	
	// should be stored in key file
	const BACK_END_IP = "localhost" ; //"127.0.0.1";
	const BACK_END_PORT = 8204;
	
    const [token, setToken] = useState(null);

    // Use useRef for websocket
    const wsRef = useRef(null);

    const [isLoading, SetIsLoading] = useState(true)
    const [isStopped, SetIsStopped] = useState(true)
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

    const receiveMessageHandle = (event)=>{

        // If data is binary
        if (event.data instanceof Blob)
        {
            const blob = new Blob([event.data], { type: "image/jpeg" });
            const imgUrl = URL.createObjectURL(blob);

            if (videoRef.current) {
                videoRef.current.src = imgUrl;
            }
        }
        // if data is string
        else if (typeof event.data === "string")
        {
            const jsonData = JSON.parse(event.data)

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
            const websocket = new WebSocket(`ws://${BACK_END_IP}:${BACK_END_PORT}/ws/${accID}/?token=${token}`);
            
            wsRef.current = websocket;

            websocket.onopen = () => {
                SetIsLoading(false)
                console.log("WebSocket connected.");
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
        <div>
            <h2>Live Stream</h2>
            {
                isLoading ?
                (
                    (
                        isStopped ?
                        <>
                            <h2>{message}</h2>
                            <button onClick={Connect}>Connect</button>
                        </>
                        :
                        <h2>Loading . . .</h2>
                    )
                )
                :
                <>
                    <button onClick={Stop}>Stop</button>
                    <img ref={videoRef} alt="Live Stream" style={{ width: "100%" }} />
                </>
            }
        </div>
    );
};

export default DisplayStream;