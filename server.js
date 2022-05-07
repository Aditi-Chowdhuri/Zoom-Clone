const express = require('express') // Create an express server
const app = express() // Running the express function
const server = require('http').Server(app) // Create a server that is needed for socket.io
const io = require('socket.io')(server) // Create a server based on express server and pass it to socket.io to know the server used and how to interact with it.
const { v4: uuidV4 } = require('uuid') // Create a uuid generator to get dynamic url

app.set('view engine', 'ejs') // Set up how to render out views using ejs
app.use(express.static('public')) // JavaScript files and CSS in static folder called public

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`) // Create a brand new room and redirect user to that room
})

app.get('/:room', (req, res) => { // :room is a dynamic parameter that is passed in the url
    res.render('room', { roomId: req.params.room }) // req.params.room is populated from url
})

io.on('connection', socket => { // Runs when a user connects to the serve and the socket is through which the user is connecting through
    socket.on('join-room', (roomId, userId) => { // Event listener for when a user joins a room we pass in thr roomId and userId
        socket.join(roomId) // Join the room
        socket.broadcast.to(roomId).emit('user-connected', userId) // Broadcast to all users in the room that a user connected but don't send it back to me

        socket.on('disconnect', () => { // When a user disconnects by leaving the room or go to different url
            socket.broadcast.to(roomId).emit('user-disconnected', userId) // Broadcast to all users in the room that a user disconnected
        })
    })
})

server.listen(3000) // Start the server on port 3000