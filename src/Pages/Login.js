import React, { useState } from 'react';
import { Button, TextField, Checkbox, FormControlLabel, Typography, Divider } from '@mui/material';
// import { Google } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
function Login() {

  const [data, setdata] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSignUp = () => navigate('/signup');

  // Handle Google login
  const responseGoogle = async (response) => {
    try {
      console.log("Google Sign-In response:", response); // Verify the full response object
  
      const token = response.credential; // Extract the token from the 'credential' field
      console.log("Token:", token); // Log the token to verify
  
      // Prompt the user to set a password if it's their first time logging in
      const password = prompt("Set a password for your account (at least 6 characters):");
      if (!password || password.length < 6) {
        toast.info("Password must be at least 6 characters.");
        return;
      }
  
      // Send the Google token and the password to the backend
      const res = await fetch("http://localhost:8080/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
  
      // Check if the response is OK
      if (res.ok) {
        const data = await res.json();
        const { user } = data;
  
        if (data.success) {
          localStorage.setItem("user", JSON.stringify(user)); // Store user in local storage
          setUser(user); // Update state with user info
          console.log("Backend response:", data);
          navigate("/dashboard"); // Redirect to dashboard
        } else {
          toast.error("Google login failed.");
        }
      } else {
        toast.error("Failed to login with Google.");
      }
    } catch (error) {
      toast.error("An error occurred during Google login.");
      console.error(error);
    }
  };
  


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const {user} = await response.json();
        console.log(user)
        setUser(user);
        navigate("/dashboard");
      } else {
        toast.error("Login Falied,Invalid Credentials")
      }

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <section className="vh-100">
      <ToastContainer />
      <div className="container py-5 h-100">
        <div className="row d-flex align-items-center justify-content-center h-100">
          <div className="col-md-8 col-lg-7 col-xl-6">
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
              className="img-fluid"
              alt="Phone"
            />
          </div>

          <div className="col-md-6 col-lg-4 col-xl-4">
            <Typography variant="h4" align="center" gutterBottom>
              Login to Your Account
            </Typography>
            <form onSubmit={handleLogin}>

              <TextField
                label="Email Address"
                variant="outlined"
                type="email"
                fullWidth
                margin="normal"
                placeholder="Enter your email"
                onChange={(e) => setdata((prevdata) => ({ ...prevdata, email: e.target.value }))}
              />

              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                margin="normal"
                placeholder="Enter your password"
                onChange={(e) => setdata((prevdata) => ({ ...prevdata, password: e.target.value }))}
              />


              <div className="d-flex justify-content-between align-items-center mb-4">
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Remember me"
                />
                <a href="/forgotpassword" className="text-muted">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                className="mb-3"
              >
                Sign in
              </Button>

              <Divider className="my-2" />

              <GoogleLogin
                clientId="372643846988-q1leagbuou69dc97tabemjv6babm6acf.apps.googleusercontent.com"
                buttonText="Login with Google"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy={"single_host_origin"}
              />
            </form>
            <Typography variant="body2" align="center" color="black" className="mt-3">
              Don't have an account?{' '}
              <span style={{ color: "blue", cursor: "pointer" }} onClick={handleSignUp}>
                Sign Up
              </span>
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;