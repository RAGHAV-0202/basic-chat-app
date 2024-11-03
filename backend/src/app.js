import express from "express"
import ApiResponse from "../utils/apiResponse.js";
import cors from "cors"
import { Server } from "socket.io"; 
import http from "http"


const corsOptions = {
    origin :  ["http://localhost:3000", "http://172.20.10.2:3000", "http://192.168.29.76:3000" , "https://basic-chat-app-teal.vercel.app"],
    methods : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  
    sameSite: 'None',
    credentials : true , 
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}

const app = express();

const server = http.createServer(app)
const io = new Server(server , {
    cors : corsOptions,
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000 // 25 seconds
})

app.use(express.json())
app.use(cors(corsOptions))

const rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);


    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });


    socket.on("joinRoom", ({ roomId, name }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push({ socketId: socket.id, name });
        console.log(`${name} has joined ${roomId}`);
        io.to(roomId).emit('message', { userId: socket.id, message: `${name} has joined the room!`, name });
    });

    socket.on("sendMessage", ({ roomId, message, name }) => {
        if (rooms[roomId]) {
            io.to(roomId).emit('message', { userId: socket.id, message, name });
            console.log(`New Message Received from ${name} from Room ID ${roomId} : ${message}`);
        } else {
            console.log(`Room ID ${roomId} does not exist.`);
        }
    });



});


app.get("/" , (req,res)=>{
    res.status(200).send(new ApiResponse(200 , "HomePage" , "Fetched HomePage"))
})

app.get("*" , (req,res)=>{
    res.status(404).send(new ApiResponse(404 , "Not Found" , "Could't find the resoure you were looking for"))
})


export default server