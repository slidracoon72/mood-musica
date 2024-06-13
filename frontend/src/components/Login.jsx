import React from 'react';

const Login = ({ onLogin }) => {
    const handleLogin = () => {
        console.log("Login Pressed!");
        window.location.href = 'http://localhost:5000/login';
    };

    return (
        // Call onLogin after handleLogin
        <button onClick={() => { handleLogin(); onLogin(); }}>Login</button>
    );
};

export default Login;
