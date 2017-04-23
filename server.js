var http = require('http');
var io = require('socket.io');
var guid = require('uuid');


class Chat 
{  
    constructor() 
    {
        this.socket = null;

        this._CreateServer().then((http) => 
        {
            console.log("[server.ready]");

            this.socket = io(http);

            this.socket.on('connection', (socket) => this._OnConnection(socket));
        })
        .catch((err) => console.log("err" + err));
    }

    _OnMessage(msg)
    { 
        console.log(`[server.on.message] ${JSON.stringify(msg)}`);

        if (msg.message.startsWith('/')) {
            console.log("*COMMAND*");

            this._CommandParse(msg);
        }
        else {
            console.log("Broadcasting user " + msg.user + " message: " + msg.message);
            this.socket.broadcast.emit('message', msg.user + ' says: ' + msg.message);
        }
    }

    _OnConnection(socket) 
    {      
        console.log(`[server.on.connection] new user connected: ${socket.id}`);

        socket.emit('hello', 'Connected.');

        socket.on('message', (msg) => this._OnMessage(msg));       
    } 
   

    _CommandParse(msg) {
        let params = msg.message.split(' ');

        if (params.length > 0) {
            if ((params[0] == '/register') && (params.length == 3)) {
                let user = params[1];
                let pass = params[2];

                this._Register(user, pass).then((token) => {
                    console.log("Registered. Token: " + token);
                    this.socket.emit('token', { user: user, token: token });
                })
                    .catch((e) => {
                        console.log(e.message);
                        this.socket.emit('err', e.message);
                    });

            }
            if ((params[0] == '/login') && (params.length == 3)) {
                let user = params[1];
                let pass = params[2];

                this._Login(user, pass);
            }
        }
        else
            console.log("COMMAND ERROR: Empty");
    }

    _CreateServer() {
        return new Promise((resolve, reject) => {
            var server = http.createServer();

            server.on('listening', () => resolve(server));

            server.on('error', reject);

            server.listen(3001);
        });
    }

    _Register(user, pass) {
        return new Promise((resolve, reject) => {
            console.log(`[Register(${user}, ${pass})]`);

            let token = guid.v4();

            Chat.users.push({ user: user, pass: pass, token: token });

            console.log("All Chat.users:");
            Chat.users.forEach((u, i) => {
                console.log(`#${i}: ${u.user} ${u.pass} ${u.token}`);
            });

            resolve(token);
        });
    }

    _Login(user, pass) {
        return new Promise((resolve, reject) => {
            console.log(`[Login(${user}, ${pass})]`);

            let u = Chat.users.find((u) => u.user === user);

            if (u !== undefined) {
                console.log(u.user + " loged in");

                return u.token;
            }
            else console.log("User not found");

            reject("USER_NOT_FOUND");
        });
    }
}

Chat.users = [];


const char = new Chat();