import { useState } from 'react';

const useInputForm = (initFormData)=>{

    const [formData, setFormData] = useState(initFormData);
    const resetFormData = () => setFormData(initFormData);

    const [isDisableInput, setDisableInput] = useState(false);

    // other register Err chk list of object
    // {
    //     'field' : 'fieldName',
    //     'condition' : ()=>{return true or false}  function
    //     'errMsg' : 'message'
    // }
    const [registerFieldErrChk, setRegisterFieldErrChk] = useState([]);

    const InitFormInputErrorObj = Object.keys(initFormData).reduce((acc, key) => {
        acc[key] = { isError: false, message: '' };
        return acc;
    }, {});

    const [formInputErrors, setFormInputErrors] = useState(
        InitFormInputErrorObj
    );

    const setError = (field, isError, message) => {
        setFormInputErrors((prevErrors) => ({
            ...prevErrors,
            [`${field}`]: {'isError' : isError, 'message' : message}
        }));
    };

    const enterInput = (field, specificVal = null) => (event = null) => {

        setError(field, false, "");

        setFormData((prevFormData) => ({
            ...prevFormData,
            [`${field}`]: specificVal ?? event?.target?.value ?? prevFormData[field]
        }));
    };

    function validateInput () 
    {
        let isError = false;
        
        setFormInputErrors(InitFormInputErrorObj);

        if (registerFieldErrChk.length > 0)
        {
            registerFieldErrChk.forEach((registerFieldObj)=>{

                if (!registerFieldObj['condition'](formData))
                {
                    setError(registerFieldObj['field'], true, registerFieldObj['errMsg']);
                    isError = true;
                }
            })
        }
        
        return !isError;
    }

    return {
        formData, setFormData, resetFormData,
        enterInput,
        isDisableInput, setDisableInput,
        formInputErrors,
        validateInput,
        setRegisterFieldErrChk
    };
}

export default useInputForm;