import { useState } from "react";
import { Tabs, Tab, Box } from '@mui/material';

import PopUp from "../Components/AddPopUp";
import { useUser } from "../Context/UserContext";
import Device from "../Components/Device";
import CustomTabPanel from "../Components/CustomTab";
import { Add } from "@mui/icons-material";

export default function DeviceManager() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  function handleAddDevice() {
    setOpen(!open)
  }
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <main className="container mt-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Device Management</h2>

        <div className="card mb-4 shadow border-0">
          <div className="card-body">
            <h5>Manage Devices</h5>
            <p className="text-muted">View and manage all connected devices in your home.</p>
          </div>
          <div className="card-body ">
            <div className="d-flex justify-content-between">
              <Box sx={{ maxWidth: { xs: 320, sm: 287 }, bgcolor: 'background.paper', p: 0 }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant="scrollable"
                  scrollButtons={false}
                  aria-label="scrollable auto tabs example"
                  sx={{ minHeight: "28px", p: 0 }}
                  style={{ backgroundColor: "#EEEDEB" }}
                >
                  <Tab label="All devices" sx={{ minHeight: "28px", textTransform: 'none', fontSize: "15px", p: 1 }} />
                  {user.rooms.map((room) => {
                    return <Tab label={room.name} sx={{ minHeight: "28px", textTransform: 'none', fontSize: "15px", p: 1 }} />
                  })}

                </Tabs>
              </Box></div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <input
                type="text"
                className="form-control w-50"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: "50px" }}
              />
              <button className="d-flex gap-1 justify-content-between btn " style={{borderRadius:"40px",backgroundColor:"#B6FFA1"}} onClick={handleAddDevice}>
                <div><Add fontSize="small"/></div>
                <div>
                Add</div>
              </button>
            </div>
            
            <CustomTabPanel value={value} index={0}>
            <div className="row mt-4">
              {user.devices
                .filter(device => device.devicename.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((device) => (
                    <Device
                      name={device.devicename}
                      location={device.location}
                      type={device.devicetype}
                      id={device.deviceid}
                    />
                  
                ))}
            </div>
            </CustomTabPanel>
            {user.rooms.map((room, index) => (
                  <CustomTabPanel value={value} index={index + 1} key={room.name}>
                    <div className="row mt-4">
                      {user.devices.filter(device => device.location === room.name).map((device) => {
                        return(
                          <Device name={device.devicename} location={device.location} type={device.devicetype} id={device.deviceid}/>
                        );
                      })}
                    </div>
                  </CustomTabPanel>
              ))}
          </div>
        </div>
        <PopUp value={open} onCancel={() => setOpen(false)} />
      </div>
    </main>
  );
}
