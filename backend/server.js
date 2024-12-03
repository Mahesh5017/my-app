const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require("google-auth-library");


const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
const server = http.createServer(app);

const device = [];

const wss = new WebSocket.Server({server});

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the HTTP Server with Express!</h1>');
});

mongoose.connect('mongodb://localhost:27017/Database2')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB connection error:", err));

const DeviceSchema = new mongoose.Schema({
    deviceid: {type:String, required: true},
    devicename: { type: String, required: true },
    location: { type: String, required: true },
    devicetype: { type: String, required: true },
    timeStamp:{type:String , required : true}
});

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rooms: [RoomSchema],
    devices: [DeviceSchema],
    otp: { type: String },
    googleId: { type: String },
});

const UserDetails = mongoose.model("UserDetails", UserSchema);

// Signup Route
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new UserDetails({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "Signup successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing up" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserDetails.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login successful", user });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in" });
    }
});



app.post("/newdevice", async (req, res) => {
    const { email, devicedata } = req.body;
    if (!email || !devicedata) {
        return res.status(400).json({ message: "Email and device data are required" });
    }
    try {
        const user = await UserDetails.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.devices.push(devicedata);
        await user.save();
        res.status(200).json({ message: "Device added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding device" });
    }
});

app.post("/newroom", async (req, res) => {
    const { email, room } = req.body;
    if (!email || !room) {
        return res.status(400).json({ message: "Email and room name are required" });
    }
    try {
        const user = await UserDetails.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.rooms.push(room);
        await user.save();
        res.status(200).json({ message: "Room added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error setting up room" });
    }
});

app.post('/deletedevice', async (req, res) => {
    const { email, device } = req.body;
    try {
        const user = await UserDetails.findOne({ email });
        if (user) {
            user.devices.pull({ deviceid: device });
            await user.save();
            res.status(200).json({ message: "Device removed successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting device" });
    }
});

app.post('/modeldata',async (req,res)=>{
    console.log("Recived Request");
    console.log(req.body);
    
    res.status(200);
})

app.post('/updatedevice', async (req, res) => {
    const { email, deviceData} = req.body;
    try {
        const user = await UserDetails.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updateuser = await UserDetails.updateOne(
            { email: email, 'devices.deviceid': deviceData.deviceid },
            { $set: { 'devices.$': deviceData } }
        );

        if (updateuser.modifiedCount === 0) {
            return res.status(404).json({ message: 'Device not found or no update needed' });
        }
        res.status(200).json({ message: 'Device data updated successfully' });
    } catch (error) {
        console.error('Error updating device data:', error);
        res.status(500).json({ message: 'An error occurred while updating the device data' });
    }
});



wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send('Welcome to the WebSocket server!');

    const cleanDeviceList = device.map(dev => ({
        deviceid: dev.deviceid,
        status: dev.status
    }));

    const deviceListMessage = JSON.stringify({ type: 'DEVICE_LIST', devices: cleanDeviceList });
    ws.send(deviceListMessage);

    ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);

        let messageStr = (typeof message === 'string') ? message : message.toString();
        let parsedMessage;

        try {
            parsedMessage = JSON.parse(messageStr);
        } catch (error) {
            console.log('Invalid JSON message received:', messageStr);
            return;
        }

        if (parsedMessage.type === 'DEVICE_LIST') {
            const deviceId = parsedMessage.deviceid.trim();
            const deviceIndex = device.findIndex(dev => dev.deviceid === deviceId);

            if (deviceIndex === -1) {
                device.push({ deviceid: deviceId, status: 'OFF', ws: ws });
                console.log(`Device ${deviceId} added to the list.`);
            } else {
                console.log(`Device ${deviceId} is already in the list.`);
            }

            const updatedDeviceListMessage = JSON.stringify({ type: 'DEVICE_LIST', devices: device.map(dev => ({
                deviceid: dev.deviceid,
                status: dev.status
            })) });

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(updatedDeviceListMessage);
                }
            });
        } 

        else if (parsedMessage.type === 'LIGHT_CONTROL') {
            console.log('Broadcasting TURN_ON message to all clients');
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({type:'LIGHT_CONTROL',deviceid:parsedMessage.deviceid}));
                }
            });
        } 

        else if (parsedMessage.type === 'FAN_CONTROL') {
            console.log('Brodcasting Fan Control to all clients');
            wss.clients.forEach(client =>{
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({type: 'FAN_CONTROL',deviceid:parsedMessage.deviceid}));
                }
            })
        }

        else if (parsedMessage.type === 'AC_CONTROL') {
            console.log('Brodcasting AC Control to all Clients');
            wss.clients.forEach(client => {
                if(client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({type: 'AC_CONTROL',deviceid:parsedMessage.deviceid}));
                }
            })
        }
        else if (parsedMessage.type === 'DEVICE_STATUS'){
            console.log('Brodcasting Status to all Clients');
            wss.clients.forEach(client => {
                if(client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({type:"DEVICE_STATUS",deviceid:parsedMessage.deviceid,status:true}));
                }
            })
        }


    });


    ws.on('close', () => {
        console.log('WebSocket connection closed');
        const index = device.findIndex(dev => dev.ws === ws);
        if (index !== -1) {
            device.splice(index, 1);
        }
        const updatedDeviceListMessage = JSON.stringify({ type: 'DEVICE_LIST', devices: device.map(dev => ({
            deviceid: dev.deviceid,
            status: dev.status
        })) });

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(updatedDeviceListMessage);
            }
        });
    });
}); 
  const bcrypt = require('bcrypt'); // For securely hashing passwords
  app.use(express.json()); // Parse JSON request bodies
  
  // Change password
  app.post('/api/change-password',async(req,res)=>{
    const { email, newPassword} = req.body;
    try {
        const user = await UserDetails.findOne({email});
        const result = await UserDetails.updateOne({email},{$set: {password:newPassword}})
        if(result.matchedCount === 0){
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
    }
  })
  
//node mailer

// Nodemailer transport configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can choose other services like SendGrid or SMTP
    auth: {
        user: 'maheshn0802@gmail.com',
        pass: 'ttjh qmse aiit qrkt',
    },
});

// Generate a random OTP (6 digits)
const generateOTP = () => {
    let otp = '';
    for (let i = 0; i < 6; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
};

// Forgot Password Route: Send OTP to Email
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserDetails.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOTP();
        user.otp = otp;
        const sentotp = otp;
        await user.save();

        console.log(`OTP for ${email}: ${otp} ${sentotp}`); // Debugging log

        const mailOptions = {
            from: 'nmahesh0802@gmail.com',
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for resetting your password is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending mail:', error);
                return res.status(500).json({ message: 'Failed to send OTP' });
            }
            res.status(200).json({ message: 'OTP sent to email' });
        });
    } catch (error) {
        console.error('Error in forgot-password:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await UserDetails.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Stored OTP: ${user.otp}, Provided OTP: ${otp}`); // Debugging log

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Incorrect OTP' });
        }
        console.log(user.otp);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        // user.otp = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in reset-password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});


  
// Google login verification route

const CLIENT_ID = "372643846988-q1leagbuou69dc97tabemjv6babm6acf.apps.googleusercontent.com"; // Replace with your Google Client ID
const client = new OAuth2Client(CLIENT_ID);
app.post("/google-login", async (req, res) => {
    const { token, password } = req.body;
  
    if (!token) {
      return res.status(400).json({ success: false, error: "Token not provided" });
    }
  
    try {
      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "372643846988-q1leagbuou69dc97tabemjv6babm6acf.apps.googleusercontent.com",
      });
      const payload = ticket.getPayload();
  
      // Extract user details from Google payload
      const { email, name } = payload;
  
      // Check if the user already exists
      let user = await UserDetails.findOne({ email });
  
      if (user) {
        // Existing user: Log in directly without requiring a password
        return res.json({ success: true, user });
      }
  
      // New user: Require a password
      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ success: false, error: "Password must be at least 6 characters" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      user = new UserDetails({
        username: name,
        email,
        password: hashedPassword,
        rooms: [],
        devices: [],
      });
      await user.save();
  
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error verifying token:", error.message);
      res.status(401).json({ success: false, error: "Invalid token" });
    }
  });
  


  
server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});