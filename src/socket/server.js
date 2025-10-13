 let io = null;
 const {Server} = require("socket.io");
 const { customErorr } = require("../helpers/customErorr");
const { Socket } = require("socket.io-client");

 // socket server

 module.exports = {
    initSocket: (hostServer) => {
        io = new Server(hostServer, {
            cors: {
                origin: "http://localhost:5173",
            }
        })
        // connect socket
        io.on("connection", (socket)=>{
            console.log("Client server connect", socket.id);
        });

        io.on("disconnect", ()=>{
            console.log("Client server disconnect")
        })
    },
    getIo: ()=> {
        if(!io) throw new customErorr("Socket.io not initialized!");
        return io;
    },
 }