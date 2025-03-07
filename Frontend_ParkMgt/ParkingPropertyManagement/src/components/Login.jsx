import { useEffect, useRef, useState } from 'react'
import { Button, Card, Form, FormControl, FormGroup, FormLabel, InputGroup } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import AlertDisplay from '../utilities/AlertDisplay'
import getErrorCode from '../database/error'
import { useUserDB } from '../contexts/userDBContext'
import { useNavigate } from 'react-router-dom'
import { CONST_PATH } from './constant'

const Login = ({changeToSigUpTab}) => {

    const navigate = useNavigate();

    const emailRef = useRef("");
    const passwordRef = useRef("");

    const {logIn, unregisterCurrentUser,
           currentUser, isLoadingUser} = useAuth();

    const {setCurrentUserToDB,
            isLoadingUserDB, SetIsLoadingUserDB,
            alertUserDB} = useUserDB();

    const [isStartLogIn, setStartLogIn] = useState(false);

    const [messageObj, setMessageObj] = useState({
        msg : "",
        color : "dark",
        needSpinner : false
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const DEFAULT_FORM_GROUP_SPACE = "mb-4";

    useEffect(()=>{
        if (isStartLogIn &&
            currentUser &&
            !isLoadingUser)
        {
            SetIsLoadingUserDB(true);
            setCurrentUserToDB(currentUser);
        }
    }, [currentUser]);

    useEffect(()=>{

        // If trigger Login and finished loading User DB
        if (isStartLogIn &&
            currentUser && 
            !isLoadingUserDB)
        {
            setStartLogIn(false);
            clearAllFieldSet();
            setMessageObj({msg : "Log In Success", color : "success", needSpinner : false});

            console.log("Last LogIn - ", currentUser);

            setTimeout(()=>{
                navigate(CONST_PATH.home)
            }, 1000);
        }

    }, [isLoadingUserDB])

    const clearAllMessage = ()=>{
        setMessageObj({...messageObj, msg:""});
        setErrorMessage("");
    }

    const clearAllFieldSet = ()=>{
        emailRef.current.value = "";
        passwordRef.current.value = "";
    }

    const applyErrorMessage = (message)=>{
        // Any error shall clear the password entry
        passwordRef.current.value = "";
        setErrorMessage(message);
    }

    const checkAndDisplayMessage = ()=>{

        const msg = (errorMessage || messageObj.msg);
        const color = errorMessage !== "" ? "danger" : messageObj.color;
        const spinnerAttrib = {
            display: errorMessage !== "" ? false : messageObj.needSpinner
        };

        return (
            msg &&
            AlertDisplay(msg, color, 0, 4, spinnerAttrib)
        )
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();

        try{
            clearAllMessage();
            setMessageObj({msg : "Logging In. . .", color : "secondary", needSpinner : true});
            unregisterCurrentUser();
            setStartLogIn(true);

            // Would auto update the currentUser under the subscription in the AuthContext
            await logIn(emailRef.current.value, passwordRef.current.value);
        }
        catch(error)
        {
            setStartLogIn(false);
            applyErrorMessage(`Log In Fail :\n ${getErrorCode(error.code)}`);
        }
    }

    return (
    <>
        <Card style={{border:"none"}}>
            <Card.Body>
                <h2 className="text-center mb-10 fs-1" style={{
                    color : "#8f2263"
                }}>Log In</h2>
                {
                    checkAndDisplayMessage()
                }
                <Form onSubmit={handleSubmit}>

                    <fieldset disabled={isLoadingUser || isLoadingUserDB} onChange={clearAllMessage}>

                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>
                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="password">
                            <Form.Label>Password</Form.Label>
                            <InputGroup>
                                <Form.Control type={showPassword ? "text" : "password"} ref={passwordRef} 
                                                placeholder='Enter Password' autoComplete="off" required/>
                                <Button variant="outline-secondary" onClick={()=>{setShowPassword((prev)=> !prev)}}
                                    style={{
                                        borderColor: "#c7cad1"
                                    }}>
                                <i className = {`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                                </Button>
                            
                            </InputGroup>
                        </Form.Group>
                        
                        <Button className="w-100 text-center mt-2" type="submit" style={{
                            backgroundColor : "#6340bd",
                            border : "none"
                        }}>
                            Log In
                        </Button>
                    </fieldset>

                </Form>
            </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
            Not Yet have an account ? <a href="#" className="link-underline-primary" onClick={changeToSigUpTab}>Sign Up</a>
        </div>
    </>
  )
}

export default Login;