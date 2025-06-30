import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HandleGetHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk";

export const SimpleDepartmentTest = () => {
    const dispatch = useDispatch();
    const departmentState = useSelector((state) => state.HRDepartmentPageReducer);
    
    useEffect(() => {
        console.log('🔥 SIMPLE TEST - Dispatching department fetch...');
        dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
    }, [dispatch]);

    useEffect(() => {
        console.log('🔥 SIMPLE TEST - State changed:', departmentState);
    }, [departmentState]);

    return (
        <div className="p-8 bg-white text-black">
            <h1>Simple Department Test</h1>
            <div>
                <h2>State Debug:</h2>
                <pre>{JSON.stringify(departmentState, null, 2)}</pre>
            </div>
            <div>
                <h2>Loading Status:</h2>
                <p>Is Loading: {departmentState.isLoading ? 'YES' : 'NO'}</p>
                <p>Has Data: {departmentState.data ? 'YES' : 'NO'}</p>
                <p>Has Error: {departmentState.error?.status ? 'YES' : 'NO'}</p>
                {departmentState.error?.status && (
                    <p>Error: {departmentState.error.message}</p>
                )}
            </div>
            {departmentState.data && (
                <div>
                    <h2>Department Data:</h2>
                    <pre>{JSON.stringify(departmentState.data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};
