import { AuthErrorCodes } from "firebase/auth"

const getErrorCode = (code) => {
    switch(code) {
        case AuthErrorCodes.INVALID_PASSWORD:
            return "Password Not Matched";
        case AuthErrorCodes.EMAIL_EXISTS:
            return "User Already Existed";
        case AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE:
            return "Credential Email Already In Use";
        case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
            return "Invalid Credentials Or Password";
        case AuthErrorCodes.INVALID_EMAIL:
            return "Please Provide A Correct Email";
        case AuthErrorCodes.WEAK_PASSWORD:
            return "New Password Is Too Weak.";
        case AuthErrorCodes.INVALID_PASSWORD:
            return "Password Entry Incorrect.";
        case AuthErrorCodes.CREDENTIAL_TOO_OLD_LOGIN_AGAIN:
            return "User's session expired. Reauthentication Is Required."
        default:
            return `Error Occurred, Code : ${code}`;
    }
}

export default getErrorCode