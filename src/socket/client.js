const {io} = require("socket.io-client");
const socket = io("http://localhost:3000");

// connection successfull
socket.on("connect", ()=>{
    console.log("Connected to server with id:")
});

socket.on("disconnect", ()=>{
    console.log("Disconnect from server")
})

// error
socket.on("connect_error", (err)=>{
    console.log("Connection error", err.message)
})