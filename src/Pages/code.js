import React, { useState } from "react";
import { Tabs, Tab, Box, IconButton, Badge, Menu, MenuItem } from "@mui/material";
import { Notifications } from "@mui/icons-material";
import Light from "../Components/Light";
import Fan from "../Components/Fan";
import AC from "../Components/AC";
import CustomTabPanel from "../Components/CustomTab";
import Temperature from "../Components/Temperature";
import Humidity from "../Components/Humidity";
import Voice from "../Components/Voice";
import { useUser } from "../Context/UserContext";
import { useNotificationCenter } from "react-toastify/addons/use-notification-center";

function Dashboard() {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useUser();

  // Notification data and handling
  const { notifications } = useNotificationCenter({
    data: [
      { id: "1", createdAt: Date.now(), data: { message: "Light turned on", exclude: false } },
      { id: "2", createdAt: Date.now() - 5000, data: { message: "Fan turned off", exclude: false } },
    ],
    sort: (a, b) => b.createdAt - a.createdAt,
    filter: (item) => !item.data.exclude,
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="container mt-4">
      {/* Greeting Section */}
      <section>
        <div className="d-flex justify-content-between mb-3">
          <div>
            <h2 className="fw-bold">Hello, {user.username}!</h2>
            <p>Welcome back to your home</p>
          </div>
          <IconButton
            size="medium"
            sx={{ borderRadius: "500px" }}
            onClick={handleNotificationClick}
          >
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Notification Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleNotificationClose}
          >
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <MenuItem key={notification.id} onClick={handleNotificationClose}>
                  {notification.data.message}
                </MenuItem>
              ))
            ) : (
              <MenuItem>No notifications</MenuItem>
            )}
          </Menu>
        </div>
      </section>

      {/* Sensor Data */}
      <section>
        <div className="row mt-4">
          <Temperature />
          <Humidity />
          <Voice />
        </div>
      </section>

      {/* Room and Devices */}
      <section>
        <div className="row">
          <div className="col-12 mb-3">
            <div className="card border-0 shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h5 className="card-title">Your Rooms</h5>
                </div>
                <div className="mt-3">
                  <Box sx={{ maxWidth: { xs: 320, sm: 287 }, bgcolor: "background.paper", p: 0 }}>
                    <Tabs
                      value={value}
                      onChange={handleChange}
                      variant="scrollable"
                      scrollButtons={false}
                      aria-label="scrollable auto tabs example"
                      sx={{ minHeight: "28px", p: 0 }}
                      style={{ backgroundColor: "#EEEDEB" }}
                    >
                      <Tab label="All devices" sx={{ minHeight: "28px", textTransform: "none", fontSize: "15px", p: 1 }} />
                      {user.rooms.map((room) => (
                        <Tab key={room.name} label={room.name} sx={{ minHeight: "28px", textTransform: "none", fontSize: "15px", p: 1 }} />
                      ))}
                    </Tabs>
                  </Box>
                  <CustomTabPanel value={value} index={0}>
                    <div className="row mt-4">
                      {user.devices.length === 0 ? (
                        <div className="d-flex justify-content-center align-items-center">
                          <h4>No devices found</h4>
                        </div>
                      ) : (
                        user.devices.map((device) => {
                          if (device.devicetype === "Light") return <Light key={device.deviceid} name={device.devicename} id={device.deviceid} />;
                          if (device.devicetype === "Fan") return <Fan key={device.deviceid} name={device.devicename} />;
                          if (device.devicetype === "Air Conditioner") return <AC key={device.deviceid} name={device.devicename} />;
                          return null;
                        })
                      )}
                    </div>
                  </CustomTabPanel>
                  {user.rooms.map((room, index) => (
                    <CustomTabPanel value={value} index={index + 1} key={room.name}>
                      <div className="row mt-4">
                        {user.devices
                          .filter((device) => device.location === room.name)
                          .map((device) => {
                            if (device.devicetype === "Light")
                              return <Light key={device.deviceid} name={device.devicename} id={device.deviceid} />;
                            if (device.devicetype === "Fan") return <Fan key={device.deviceid} name={device.devicename} />;
                            if (device.devicetype === "Air Conditioner")
                              return <AC key={device.deviceid} name={device.devicename} />;
                            return null;
                          })}
                      </div>
                    </CustomTabPanel>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="row">
          <div className="col-12 mb-3">
            <div className="card border-0 shadow">
              <div className="card-body">
                <h5>Quick Actions</h5>
                <div className="d-flex justify-content-between mt-3">
                  <button className="btn btn-dark w-25 d-flex align-items-center justify-content-center me-2" style={{ height: '80px' }}>
                    All Off
                  </button>
                  <button className="btn btn-dark w-25 d-flex align-items-center justify-content-center me-2" style={{ height: '80px' }}>
                    Lights Off
                  </button>
                  <button className="btn btn-dark w-25 d-flex align-items-center justify-content-center me-2" style={{ height: '80px' }}>
                    Lock All
                  </button>
                  <button className="btn btn-dark w-25 d-flex align-items-center justify-content-center" style={{ height: '80px' }}>
                    Unlock All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    
  );
}

export default Dashboard;
