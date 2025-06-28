import { HRDepartmentTabs } from "../../../components/common/Dashboard/departmenttabs"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { CreateDepartmentDialogBox } from "../../../components/common/Dashboard/dialogboxes"
export const HRDepartmentPage = () => {
    return (
        <div className="department-container mt-5 min-[250px]:mx-1 sm:mx-2 w-auto flex flex-col gap-3 h-[97%] bg-white dark:bg-neutral-900">
            <div className="deaprtment-heading flex justify-between items-center min-[250px]:flex-col min-[250px]:gap-2 min-[400px]:flex-row">
                <h1 className="min-[250px]:text-2xl md:text-4xl font-bold text-gray-900 dark:text-neutral-100">
                    Departments
                </h1>
                <CreateDepartmentDialogBox />
            </div>
            <HRDepartmentTabs />
        </div>
    )
}