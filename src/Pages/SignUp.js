import React, { useState } from 'react';
import { Button, TextField, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ToastContainer,toast } from 'react-toastify';


function Signup() {

    const [data,setdata] = useState({username:'',email:'',password:''});
    const navigate = useNavigate();

    const handleLogin = () => navigate("/");

    const handleSignUp = async (e) =>{
      e.preventDefault();
      try {
        const response = await fetch('http://localhost:8080/signup',{
          method:'POST',
          headers: { 'Content-Type':'application/json'},
          body:JSON.stringify(data)
        })
        if(response.ok){
          navigate('/');
          toast.success('SignUp Successfull');
        }else{
          toast.error('SignUp Failed')
        }
      } catch (error) {
        console.log(error);
      }
    }

  return (
    <section className="vh-100">
      <ToastContainer/>
      <div className="container py-5 h-100">
        <div className="row d-flex align-items-center justify-content-center h-100">
          <div className="col-md-8 col-lg-7 col-xl-6">
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
              className="img-fluid"
              alt="Registration"
            />
          </div>

          <div className="col-md-6 col-lg-4 col-xl-4">
            <Typography variant="h4" align="center" gutterBottom>
              Create an Account
            </Typography>
            <form onSubmit={handleSignUp}>
              
              <TextField
                label="Your Name"
                variant="outlined"
                type="text"
                fullWidth
                margin="normal"
                placeholder="Enter your name"
                onChange={(e) => setdata((prevdata)=>({...prevdata,username:e.target.value}))}
              />

              
              <TextField
                label="Your Email"
                variant="outlined"
                type="email"
                fullWidth
                margin="normal"
                placeholder="Enter your email"
                onChange={(e) => setdata((prevdata)=>({...prevdata,email:e.target.value}))}
              />

              
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                margin="normal"
                placeholder="Enter your password"
                onChange={(e) => setdata((prevdata)=>({...prevdata,password:e.target.value}))}
              />

              <div className="d-flex justify-content-center mb-4">
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label={
                    <span>
                      I agree to the{' '}
                      <a href="#!" style={{ color: 'blue' }}>
                        Terms of Service
                      </a>
                    </span>
                  }
                />
              </div>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                className="mb-3"
              >
                Register
              </Button>
              
            </form>

            <Typography variant="body2" align="center" color="black" className="mt-2">
              Already have an account?{' '}
              <span style={{ color: 'blue' }} onClick={handleLogin}>
                Login
              </span>
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signup;
