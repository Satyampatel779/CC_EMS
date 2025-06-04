import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import { ResetEmailConfirmaction as PresentationalResetVerifyEmailPage } from "../../components/common/reset-email-confirm.jsx";
import { HandlePostHumanResources } from "../../redux/Thunks/HRThunk.js";

const CommonStateHandler = (state, setState, event) => {
    const { name, value } = event.target;
    setState(prevState => ({
        ...prevState,
        [name]: value
    }));
};

export const ResetHRVerifyEmailPage = () => {
    const [emailvalue, setemailvalue] = useState({ email: "" });
    const loadingbar = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const HRState = useSelector(state => state.HRReducer);

    const handleverifyemail = (event) => {
        CommonStateHandler(emailvalue, setemailvalue, event);
    };

    const handleverifybutton = () => {
        if (loadingbar.current) {
            loadingbar.current.continuousStart();
        }
        dispatch(HandlePostHumanResources({ apiroute: "RESEND_VERIFY_EMAIL", data: emailvalue }));
    };

    useEffect(() => {
        if (HRState && HRState.error && HRState.error.status) {
            if (loadingbar.current) {
                loadingbar.current.complete();
            }
        }
    }, [HRState && HRState.error]);

    useEffect(() => {
        if (HRState && HRState.isVerified) {
            if (loadingbar.current) {
                loadingbar.current.complete();
            }
            navigate("/HR/dashboard/dashboard-data");
        }

        if (HRState && HRState.isVerifiedEmailAvailable) {
            if (loadingbar.current) {
                loadingbar.current.complete();
            }
            navigate("/auth/HR/verify-email");
        }
    }, [HRState && HRState.isVerified, HRState && HRState.isVerifiedEmailAvailable, navigate]);

    console.log(HRState);

    return (
        <>
            <LoadingBar ref={loadingbar} />
            {PresentationalResetVerifyEmailPage && HRState && emailvalue &&
                <PresentationalResetVerifyEmailPage 
                    handleverifybutton={handleverifybutton} 
                    handleverifyemail={handleverifyemail} 
                    emailvalue={emailvalue.email} 
                    targetstate={HRState}
                />
            }
        </>
    );
};