import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { EmployeeRoutes } from './routes/Employeeroutes'
import { HRRoutes } from './routes/HRroutes'
import { PublicRoutes } from './routes/PublicRoutes'
import { initAuth } from './utils/initAuth';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize authentication on app start
    const init = async () => {
      const result = await initAuth();
      console.log('Auth initialized:', result);
      setAuthInitialized(true);
    };
    
    init();
  }, []);
  
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Routes>
          {PublicRoutes.map((route, index) => (
            <Route key={`public-${index}`} path={route.path} element={route.element} />
          ))}
          {HRRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
              {route.children && route.children.map((childRoute, childIndex) => (
                <Route key={childIndex} path={childRoute.path} element={childRoute.element} />
              ))}
            </Route>
          ))}
          {EmployeeRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
              {route.children && route.children.map((childRoute, childIndex) => (
                <Route key={childIndex} path={childRoute.path} element={childRoute.element} />
              ))}
            </Route>
          ))}
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="dark:bg-neutral-800"
        />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App
