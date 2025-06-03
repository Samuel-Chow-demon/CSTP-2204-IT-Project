export default function checkPasswordRule(password)
{
    const PASSWORD_MIN_SIZE = 6

    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    let message = ""

    if (password.length < PASSWORD_MIN_SIZE)
    {
        return `Password Must Be At Least ${PASSWORD_MIN_SIZE} Characters`
    }

    if (!hasUpperCase || !hasNumber || !hasSpecialChar)
    {
        message = `Password needs to have at least \
                    ${hasUpperCase ? "" : "ONE Uppercase letter"} \
                    ${hasNumber ? "" : "ONE Numerical"} \
                    ${hasSpecialChar ? "" : "ONE Special Character"} \
                    `
    }

    return message
}