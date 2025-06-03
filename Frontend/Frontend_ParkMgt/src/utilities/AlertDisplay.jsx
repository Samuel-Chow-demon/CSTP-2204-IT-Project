
import { Alert, Spinner } from 'react-bootstrap'

const AlertDisplay = (message, color, marginX, marginY,
                     spinnerAttrib = {
                        display : false,
                        size : "sm",             // default
                        margin : "1rem"          // default space between spinner to message is 1rem
                    }) => 
{
    return (
    <Alert className={`my-${marginY} mx-${marginX} d-flex align-items-center justify-content-center`} variant={color}>
        {
            spinnerAttrib.display ? (
                <>
                    <Spinner animation="border" variant={color} size={spinnerAttrib.size}/>
                    <span style={{
                        margin: "1rem"
                    }}>{message}</span>
                </>
            ) : (
                message
            )
        }
    </Alert>
    )
}

export default AlertDisplay