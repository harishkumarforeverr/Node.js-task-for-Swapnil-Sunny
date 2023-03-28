let app = {};
let io;

app.init = function(server) {
    io = require('socket.io')(server, {
        cors: {
            origin: '*',
        }
    });
    io.on('connection', (socket) => {
        io.emit('socket:init', 'Socket has been initialised');
    });
}

app.emit = function(key, msg) {
    try {
        io.emit(key, msg);
        return {
            status: true,
        }
    } catch (err) {
        return {
            status: false,
            error: err,
        }
    }
}

module.exports = app;