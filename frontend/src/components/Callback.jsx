import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from '../assets/Loader';

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async (code) => {
      try {
        const response = await fetch('http://localhost:5000/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (data.success) {
          // Store user info in local session storage
          sessionStorage.setItem('user_info', JSON.stringify(data.user_info));

          // Dispatch the 'login' event
          const loginEvent = new Event('login');
          window.dispatchEvent(loginEvent);

          navigate('/'); // Redirect to home page after successful login
        } else {
          console.error('Error during callback processing:', data.error);
        }
      } catch (error) {
        console.error('Error during callback processing:', error);
      }
    };

    const query = new URLSearchParams(location.search);
    const code = query.get('code');

    if (code) {
      fetchData(code);
    }
  }, [location, navigate]);

  return <Loader />;
};

export default Callback;
