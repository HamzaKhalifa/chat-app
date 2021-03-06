const users = [];

// const user = {
//     id: 1,
//     username: 'Hamza',
//     room: 'Room 1'
// }

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validating the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        };
    }

    // Check for existing user: 
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });
    
    // Validate username
    if (existingUser) {
        return { error: 'Username is already in use' }
    }

    const user = {
        id, username, room
    };
    users.push(user);

    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room);
}

const getRooms = () => {
    const rooms = [];
    users.forEach(user => {
        if (rooms.indexOf(user.room) === -1)
            rooms.push(user.room);
    })

    return rooms;
}

module.exports = {
    addUser, 
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
}