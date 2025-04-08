import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { HandleLogout } from '@/redux/Thunks/EmployeeThunk'; // Adjust import path as needed
import { LogOut } from 'lucide-react'; // If you have lucide-react icons

const LogoutButton = ({ variant = "ghost", size = "icon", className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Dispatch logout action
    dispatch(HandleLogout());
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      onClick={handleLogout}
      title="Logout"
    >
      <LogOut className="h-5 w-5" />
      {size !== "icon" && <span className="ml-2">Logout</span>}
    </Button>
  );
};

export default LogoutButton;