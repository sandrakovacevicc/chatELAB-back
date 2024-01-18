const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }});

const router = require('./router')
app.use(router)

const {addUser, removeUser, getUser, getUsersInRoom} = require('./users');

const PORT = process.env.PORT || 5000 

server.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`))

io.on('connection', (socket)=>
{
    console.log("User connected")
 
    socket.on('join', ({name, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, name, room})
        if (error) return callback(error)
        
    socket.join(user.room)
    
    socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the room ${user.room}`})
    socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} has joined!`})
    
    io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})

    callback();
})

socket.on('sendMessage', (message, callback)=>{
    const user = getUser(socket.id)
    io.to(user.room).emit('message', {user: user.name, text: message})

    callback()
})

socket.on('disconnect', ()=>{
    console.log('User disconnected')
    const user = removeUser(socket.id)
    if (user){
        io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left the chat`})
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
})
})