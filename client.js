var io = require('socket.io-client');
var readline = require('readline');
var os = require('os');

function Cli_WriteLine(line)
{
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(line + os.EOL);
    cli.prompt(true);
}



var socket = io('http://localhost:3001');

var user = "";
var token = "";


socket.on('hello', (msg) =>
{
    Cli_WriteLine(`[client.on.hello] Server says: "${msg}".`);
});

socket.on('message', (msg) =>
{
    Cli_WriteLine(`[client.on.message] Server says: "${msg}"`);
});

socket.on('err', (err) =>
{
    Cli_WriteLine("ERROR: "+err);
});

socket.on('token', (credentials) =>
{
    Cli_WriteLine("TOKEN: "+credentials.token);
    user = credentials.user;
    token = credentials.token;
});


var cli = readline.createInterface({ input: process.stdin, output: process.stdout });
cli.setPrompt('> ');
cli.prompt();
cli.on('line', (line) =>
{
    //Cli_WriteLine(line);
    
    socket.emit('message', { message: line, user: user, token: token });
});
