const express = require('express');
const http = require('http');
const hbs = require('hbs');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {
    addUser, 
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = __dirname + '/templates/views';
const partialsPath = __dirname + '/templates/partials';

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirectoryPath));
app.use(express.json());

io.on('connection', (socket) => {
    // socket.emit: To a specific client
    // io.emit: To all clients
    // socket.broadcast.emit To all clients but the current one
    // io.to(room).emit: Emits an event to everybody in a room
    // socket.broadcast.to(room).emit: Emits an event to everyone except for the current client by limited to a room

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username: name, room });
        if (error) 
            return callback(error);

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome ' + user.username + '!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', user.username + ' has joined.'));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message))
            return callback('Profanity is not allowed');
        
        const user = getUser(socket.id);
        const room = user ? user.room : undefined;
        if (!room) 
            return callback('User not found');

        io.to(room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('sendLocation', ({ longitude, latitude }, callback) => {
        const user = getUser(socket.id);
        const room = user ? user.room : undefined;
        if (!room) 
            return callback('User not found');

        io.to(room).emit('locationMessage', generateLocationMessage(user.username, 'https://google.com/maps?q=' + latitude + ',' + longitude));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', 'User ' + user.username + ' has left.'));

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

app.get('/rooms', (req, res) => {
    res.send(getRooms());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
