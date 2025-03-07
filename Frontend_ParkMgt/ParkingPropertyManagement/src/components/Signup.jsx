import { useEffect, useRef, useState } from 'react'
import { Form, Button, Card, Alert, Container, InputGroup, Spinner } from 'react-bootstrap'
import {useAuth} from '../contexts/AuthContext'
import checkPasswordRule from '../utilities/passwordRule'
import getErrorCode from '../database/error.js'
import AlertDisplay from '../utilities/AlertDisplay.jsx'
import { useUserDB } from '../contexts/userDBContext.jsx'

const Signup = ({changeToLogInTab}) => {

    const userNameRef = useRef("");
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const passwordConfirmRef = useRef("");

    const {signUp, unregisterCurrentUser,
           currentUser, isLoadingUser} = useAuth();

    const {setCurrentUserToDB,
            isLoadingUserDB, SetIsLoadingUserDB,
            alertUserDB} = useUserDB();

    const [isStartSignUp, setStartSignUp] = useState(false);

    const [messageObj, setMessageObj] = useState({
        msg : "",
        color : "dark",
        needSpinner : false
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isDisplayConfirmIcon, setDisplayConfirmIcon] = useState(false);
    const [isPSConfirmOK, setIsPSConfirmOK] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const DEFAULT_FORM_GROUP_SPACE = "mb-4";

    useEffect(()=>{
        if (isStartSignUp &&
            currentUser &&
            !isLoadingUser) // means finished
        {
            SetIsLoadingUserDB(true)
            setCurrentUserToDB(currentUser)
            console.log("SignUp - ", currentUser)
        }
    }, [currentUser, isLoadingUser]);

    useEffect(()=>{

        // If trigger SignUp and finished loading User DB
        if (isStartSignUp &&
            currentUser && 
            !isLoadingUserDB)
        {
            if (alertUserDB.color === 'success')
            {
                clearAllFieldSet();
                setMessageObj({msg : "Create User Success", color : "success", needSpinner : false});

                setTimeout(()=>{
                    changeToLogInTab()
                }, 500);
            }
            else
            {
                setMessageObj({msg : `Account DB Creation Fail - ${alertUserDB.message}`, color : "danger", needSpinner : false});
            }

            setStartSignUp(false);
        }

    }, [isLoadingUserDB])

    const clearAllMessage = ()=>{
        setMessageObj({...messageObj, msg:""});
        setErrorMessage("");
    }

    const clearAllFieldSet = ()=>{
         userNameRef.current.value = "";
         emailRef.current.value = "";
         passwordRef.current.value = "";
         passwordConfirmRef.current.value = "";
         setDisplayConfirmIcon(false);
    }

    const applyErrorMessage = (message)=>{
        // Any error shall clear the password entry
        passwordConfirmRef.current.value = "";
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

        const checkPSMsg = checkPasswordRule(passwordRef.current.value);
        if (checkPSMsg)
        {
            return applyErrorMessage(checkPSMsg);
        }

        if (passwordConfirmRef.current.value !== passwordRef.current.value)
        {
            return applyErrorMessage("Confirm Password Do Not Match");
        }

        try{
            clearAllMessage();
            setMessageObj({msg : "Creating User. . .", color : "secondary", needSpinner : true});
            unregisterCurrentUser();
            setStartSignUp(true);

            // Would auto update the currentUser under the subscription in the AuthContext
            await signUp(userNameRef.current.value, emailRef.current.value, passwordRef.current.value);
        }
        catch(error)
        {
            setStartSignUp(false);
            console.log(`SignUp Error : ${error.message}`)
            applyErrorMessage(`Account Creation Fail :\n ${getErrorCode(error.code)}`);
        }
    }

    const checkConfirmPasswordOnChange = (e)=>{

        setDisplayConfirmIcon(passwordConfirmRef.current.value !== "");
        if (passwordConfirmRef.current.value !== "" &&
            passwordRef.current.value != "")
        {
            setIsPSConfirmOK(passwordConfirmRef.current.value === passwordRef.current.value);
        }
    }

  return (
    <>
        <Card style={{border: "none"}}>
            <Card.Body>
                <h2 className="text-center mb-10 fs-1" style={{
                    color : "#71207d"
                }}>Sign Up</h2>
                {
                    checkAndDisplayMessage()
                }
                <Form onSubmit={handleSubmit}>

                    <fieldset disabled={isLoadingUser || isLoadingUserDB} onChange={clearAllMessage}>
                           
                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="userName">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="name" ref={userNameRef} required />
                        </Form.Group>
                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>
                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="password">
                            <Form.Label>Password</Form.Label>
                            <InputGroup>
                                <Form.Control type={showPassword ? "text" : "password"} ref={passwordRef} 
                                                placeholder='Enter Password' autoComplete="off" onChange={checkConfirmPasswordOnChange} required/>
                                <Button variant="outline-secondary" onClick={()=>{setShowPassword((prev)=> !prev)}}
                                    style={{
                                        borderColor: "#c7cad1"
                                    }}>
                                <i className = {`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                                </Button>
                            
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="password-confirm">
                            <Form.Label>Password Confirmation</Form.Label>
                            <Container className="d-flex justify-content-between align-items-center p-0">
                                <InputGroup style={{width: isDisplayConfirmIcon ? "90%" : "100%"}}>
                                    <Form.Control type={showConfirmPassword ? "text" : "password"} ref={passwordConfirmRef} autoComplete="off" required 
                                        placeholder="Enter Password Again" onChange={checkConfirmPasswordOnChange}/>
                                    <Button variant="outline-secondary" onClick={()=>{setShowConfirmPassword((prev)=> !prev)}}
                                        style={{
                                            borderColor: "#c7cad1"
                                        }}>
                                        <i className = {`bi bi-eye${showConfirmPassword ? "-slash" : ""}`}></i>
                                    </Button>
                                
                                </InputGroup>
                                    {
                                        isDisplayConfirmIcon &&
                                        <i className={`bi bi-${isPSConfirmOK ? "check" : "x"}-lg`} style={{
                                            fontSize: "2rem",
                                            color: isPSConfirmOK ? "#4bbf5e" : "#de5082"
                                        }}></i>
                                    }
                            </Container>

                        </Form.Group>
                        <Button className="w-100 text-center mt-2" type="submit" style={{
                            backgroundColor : "#a031b0",
                            border : "none"
                        }}>
                            Sign Up
                        </Button>
                    </fieldset>
                </Form>
            </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
            Already have an account ? <a href="#" className="link-underline-primary" onClick={changeToLogInTab}>Log In</a>
        </div>
    </>
  )
}

export default Signup;