import React, { useState, useRef } from 'react';
import { useHRSignup } from '../../hooks/useHRAuth';
import { SignUP } from "../../components/common/sign-up";
import LoadingBar from 'react-top-loading-bar';
import { useNavigate } from 'react-router-dom';

export const HRSignupPage = () => {
    const [signupform, set_signuform] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contactnumber: "",
        password: "",
        textpassword: "",
        name: "",
        description: "",
        OrganizationURL: "",
        OrganizationMail: ""
    });

    const navigate = useNavigate();
    const loadingbar = useRef(null);

    const handlesignupform = (event) => {
        set_signuform((prevForm) => ({
            ...prevForm,
            [event.target.name]: event.target.value
        }));
    };

    const { loading, error, success, handleSignup } = useHRSignup();

    const handlesubmitform = (event) => {
        if (signupform.textpassword === signupform.password) {
            event.preventDefault();
            loadingbar.current.continuousStart();
            handleSignup(signupform);
        } else {
            event.preventDefault();
        }
    };

    const errorMessage = error?.message || "An error occurred during signup";

    return (
        <div className="HRsignup-page-container h-screen flex justify-center min-[900px]:justify-center min-[900px]:items-center">
            <LoadingBar ref={loadingbar} />
            <SignUP stateformdata={signupform} handlesignupform={handlesignupform} handlesubmitform={handlesubmitform} />
            {error && (
                <div className="error-container">
                    <p className="error-message">{errorMessage}</p>
                </div>
            )}
        </div>
    );
};