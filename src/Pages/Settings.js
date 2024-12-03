import React, { useState, useEffect } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import { ToastContainer, toast } from 'react-toastify';
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import { useUser } from "../Context/UserContext";
import './theme.css';

function Settings() {
  const { user } = useUser();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settings, setSettings] = useState(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    return {
      notifications: "enabled",
      theme: savedTheme,
    };
  });

  useEffect(() => {
    if (settings.theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [settings.theme]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });

    if (name === "theme") {
      localStorage.setItem("theme", value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user.password === formData.currentPassword && formData.newPassword === formData.confirmPassword) {
        const response = await fetch("http://localhost:8080/api/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, newPassword: formData.newPassword }),
        });
        if (response.ok) {
          toast.success("Password updated successfully!");
        } else {
          toast.error("Invalid Password");
        }
      } else {
        toast.error("Password confirmation does not match or incorrect current password!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    toast.success("Settings saved successfully!");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <ToastContainer/>
      <div className="row">
        <div className="col-12 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-3">User Information</h5>
              <div className="mb-3">
                <AccountCircleIcon /> <strong>Username:</strong> {user?.username || "N/A"}
              </div>
              <div className="mb-3">
                <EmailIcon /> <strong>Email:</strong> {user?.email || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Change Password</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                    required
                    variant="outlined"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    required
                    variant="outlined"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    required
                    variant="outlined"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  className="btn-dark-mode"
                >
                  Update Password
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Account Settings</h5>
              <form onSubmit={handleSettingsSubmit}>
                <div className="mb-3">
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="notification-label">Notifications</InputLabel>
                    <Select
                      labelId="notification-label"
                      id="notifications"
                      name="notifications"
                      value={settings.notifications}
                      onChange={handleSettingsChange}
                      label="Notifications"
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="mb-3">
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="theme-label">Theme</InputLabel>
                    <Select
                      labelId="theme-label"
                      id="theme"
                      name="theme"
                      value={settings.theme}
                      onChange={handleSettingsChange}
                      label="Theme"
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  className="btn-dark-mode"
                >
                  Save Changes
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
