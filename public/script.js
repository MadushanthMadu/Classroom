const socket = io('/')
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
});

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connecToNewUser(userId, stream);
    })
    let text = $('input')

    $('html').keydown((e) =>{
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('')
        }
    });

    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>User</b><br>${message}</li>`);
        scrollToBottom()
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const connecToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom = () => {
    let d = $('.chat-display');
    d.scrollTop(d.prop("scrollHeight"));
}

// Mute our audio
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }   else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
    `
    document.querySelector('.mute-button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
    `
    document.querySelector('.mute-button').innerHTML = html;
}

// Stop our video
const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayButton();
    }   else {
        setStopButton();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopButton = () => {
    const html = `
        <i class="fas fa-video"></i>
    `
    document.querySelector('.stop-button').innerHTML = html;
}

const setPlayButton = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
    `
    document.querySelector('.stop-button').innerHTML = html;
}

var link = prompt('THIS IS YOUR ROOM LINK, COPY THIS.', 'https://smart-learn-classroom.herokuapp.com/'+ROOM_ID)

const videoElement = document.getElementById('video');
const start = document.getElementById("start")
const stop = document.getElementById("stop")

var displayMediaOptions = {
    video:true,
    audio:false
}

start.addEventListener("click", function(e){
    startCapture()
},false)

stop.addEventListener("click", function(e){
    stopCapture()
},false)

async function startCapture(){
    try{
        videoElement.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    }catch(err){
        console.error("Error" + err)
    }
}

function stopCapture(e){
    let tracks = videoElement.srcObject.getTracks()

    tracks.forEach(track => track.stop())

    videoElement.srcObject = null
}