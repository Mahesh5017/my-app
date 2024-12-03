import React, { useState } from "react";
import { Devices, Dashboard, AccountCircle } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

import { Menu, MenuItem } from "@mui/material";

function NavBar() {
    const navigate = useNavigate();
    

    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleDashboard = () => navigate("/dashboard");
    const handleDevices = () => navigate("/devices");
    const handleSettings = () => navigate("/settings");
    const handleLogout = () => navigate("/");

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary text-white px-4 py-2 shadow-sm">
            <h3 style={{ color: "black" }}>KMIT</h3>
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ms-auto" style={{ cursor: "pointer" }}>
                    <li className="nav-item me-3">
                        <span className="nav-link fs-6" onClick={handleDashboard}>
                            <Dashboard fontSize="small" /> Dashboard
                        </span>
                    </li>
                    <li className="nav-item me-3" onClick={handleDevices}>
                        <span className="nav-link fs-6">
                            <Devices fontSize="small" /> Devices
                        </span>
                    </li>
                    <li className="nav-item">
                        <span
                            className="nav-link fs-6 d-flex align-items-center"
                            onClick={handleMenuClick}
                        >
                            <AccountCircle fontSize="medium" />
                        </span>
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem onClick={() => { handleSettings(); handleMenuClose(); }}>Settings</MenuItem>
                            <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>Logout</MenuItem>
                        </Menu>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;
