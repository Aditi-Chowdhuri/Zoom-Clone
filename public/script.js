const socket = io('/') // Create a reference to the socket
const videoGrid = document.getElementById('video-grid') // Get reference to the video grid
//Peer.js is used to establish connection between users by using WebRTC and provides dynamic usedID
const myPeer = new Peer(undefined, { // undefined as the server will generate a random ID
    host: '/', // Root host
    port: '3001'
})
const myVideo = document.createElement('video') // Create a video element to get reference to the video
myVideo.muted = true // Mute the video as we don't want to listen to our own video
const peers = {} // To keep track of users to be removed
navigator.mediaDevices.getUserMedia({ // Get access to the user's camera and microphone to send to other users
    video: true,
    audio: true
}).then(stream => { // It's a promise so it will pass a stream
    addVideoStream(myVideo, stream) // Add the stream to the myVideo object

    myPeer.on('call', call => { // Listen to the call event
        call.answer(stream) // Answer the call with the current stream
        const video = document.createElement('video') // Create a video object
        call.on('stream', userVideoStream => { // Respond to the event stream that come in
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => { // When a user connects
        connectToNewUser(userId, stream) // Connect to the user and send the current stream
    })
})

socket.on('user-disconnected', userId => { // When a user disconnects
    if (peers[userId]) peers[userId].close() // If peer of the userId exists then close the connection
})

myPeer.on('open', id => { // As soon as we connect with the peer server and get back an ID
    socket.emit('join-room', ROOM_ID, id) // Send event to the server to join the room
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream) // Call the user with a certain ID and send the video and audio stream
    const video = document.createElement('video') // Create a video object
    call.on('stream', userVideoStream => { // Listen to the event stream that takes the users video stream
        addVideoStream(video, userVideoStream) // Add the video stream to the list of videos
    })
    call.on('close', () => { // When someone leaves the call
        video.remove() // Remove the video
    })
  
    peers[userId] = call // Every userId is linked to the call that we make
}

function addVideoStream(video, stream) {
    video.srcObject = stream // Set the source object to the stream
    video.addEventListener('loadedmetadata', () => { // Once the video is loaded
        video.play() // Play the video
    })
    videoGrid.append(video) // Append the video to the video grid
}