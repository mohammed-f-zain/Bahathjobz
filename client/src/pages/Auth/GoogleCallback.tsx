import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GoogleCallback = () => {
  const { checkAuthStatus, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      checkAuthStatus();
    }
  }, [location, checkAuthStatus]);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "super_admin":
          navigate('/admin');
          break;
        case "employer":
          navigate('/employer');
          break;
        default:
          navigate('/dashboard');
          break;
      }
    }
  }, [user, navigate]);

  return <div>Loading...</div>;
};

export default GoogleCallback;