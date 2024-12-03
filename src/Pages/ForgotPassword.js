import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1); // Step 1: Forgot Password, Step 2: Reset Password

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/forgot-password", { email });
      setMessage(response.data.message);
      setStep(2); // Move to OTP input step
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sending OTP");
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/reset-password", { email, otp, newPassword });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div>
      {step === 1 ? (
        <form onSubmit={handleForgotPassword}>
          <Typography variant="h5">Forgot Password</Typography>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            
            required
          />
          <Button type="submit" variant="contained" color="primary">Send OTP</Button>
          {message && <p>{message}</p>}
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <Typography variant="h5">Reset Password</Typography>
          <TextField
            label="OTP"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" color="primary">Reset Password</Button>
          {message && <p>{message}</p>}
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
