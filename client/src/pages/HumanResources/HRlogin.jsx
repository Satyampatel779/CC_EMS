import { SignIn } from "../../components/common/sign-in.jsx"
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import LoadingBar from 'react-top-loading-bar'
import { CommonStateHandler } from "../../utils/commonhandler.js"
import { HandleGetHumanResources, HandlePostHumanResources } from "../../redux/Thunks/HRThunk.js"
import employeeWelcomeImage from '../../assets/Employee-Welcome.jpg'; // Import the image

export const HRLogin = () => {
    const HRState = useSelector((state) => state.HRReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loadingbar = useRef(null) // Initialize loadingbar
    const [signinform, setsigninform] = useState({
        email: "",
        password: ""
    })

    // Debug logging
    useEffect(() => {
        console.log('🔍 HR Login - Current HRState:', HRState);
    }, [HRState]);

    const handlesigninform = (event) => {
        CommonStateHandler(signinform, setsigninform, event)
    }

    const handlesigninsubmit = (e) => {
        e.preventDefault();
        console.log('🚀 HR Login - Submitting form with:', signinform);
        loadingbar.current.continuousStart();
        dispatch(HandlePostHumanResources({ apiroute: "LOGIN", data: signinform }))
    }

    if (HRState.error.status) {
        console.log('❌ HR Login - Error detected:', HRState.error);
        loadingbar.current.complete()
    }

    useEffect(() => {
        console.log('🔄 HR Login - Auth state changed. isAuthenticated:', HRState.isAuthenticated);
        
        if (!HRState.isAuthenticated) {
            console.log('🔍 HR Login - Checking existing login...');
            dispatch(HandleGetHumanResources({ apiroute: "CHECKLOGIN" }))
        }

        if (HRState.isAuthenticated) {
            console.log('✅ HR Login - Authentication successful! Redirecting to dashboard data...');
            loadingbar.current.complete()
            navigate("/HR/dashboard/dashboard-data")
        }
    }, [HRState.isAuthenticated])


    return (
        <div>
            <div className="employee-login-content flex justify-center items-center h-[100vh]">
                <LoadingBar ref={loadingbar} />
                <SignIn image={employeeWelcomeImage} handlesigninform={handlesigninform} handlesigninsubmit={handlesigninsubmit} targetedstate={HRState} statevalue={signinform} redirectpath={"/auth/HR/forgot-password"} />
            </div>
        </div>
    )
}