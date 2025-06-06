import { createBrowserRouter } from "react-router-dom";
import { EmployeeRoutes } from "./employeeroutes.jsx"
import { HRRoutes } from "./HRroutes.jsx";
import { NotFoundPage } from "../pages/NotFound.jsx";

export const router = createBrowserRouter([
    ...EmployeeRoutes,
    ...HRRoutes,
    {
        // Add a catch-all 404 route
        path: "*",
        element: <NotFoundPage />
    }
],
    {
        future: {
            v7_relativeSplatPath: true,
            v7_fetcherPersist: true,
            v7_normalizeFormMethod: true,
            v7_partialHydration: true,
            v7_skipActionStatusRevalidation: true,
            v7_startTransition: true,
            v7_skipActionErrorRevalidation: true,
        }
    }
)