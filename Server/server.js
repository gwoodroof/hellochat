var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;

var port = 8080;

MongoClient.connect('mongodb://localhost/test', function(err, db){
  if(err) throw err;
  console.log("connected to mongodb!");

  var memberCollection = db.collection('members');
  memberCollection.insert({name:"GW"},function(err, docs){
    if(err) throw err;
    console.log("inserted GW");
  });
  var chatCollection = db.collection('chats');
  chatCollection.insert({handle:"GW", msg:"Hello Mongo!"}, function(err, docs){
    if(err) throw err;
    console.log("insterted GW: Hello Mongo!");
  });
});

server.listen(port);
console.log('listening on port: ' + port);

app.get('/', function(request, response){
  console.log('fetching index.html...');
  response.sendfile("/home/ec2-user/app/chat-gwoodroof/Client/index.html");
});

app.get('/style.css', function(request, response){
  console.log('fetching style.css...');
  response.sendfile("/home/ec2-user/app/chat-gwoodroof/Client/style.css");
});

app.get('/app.js', function(request, response){
  console.log('fetching app.js...');
  response.sendfile("/home/ec2-user/app/chat-gwoodroof/Client/app.js");
});

io.on('connection', function(client){
  console.log('client connected!');
  client.emit('alert', { message: 'You are connected.' });
  
  var handle = "";
  
  client.on('submit-name', function(username){
    handle = username;
    var chat = {handle:"server",msg:handle + " just joined."};
    console.log(chat);
    io.emit('message', chat);
    io.emit('add-member', handle);
  });
  
  client.on('message', function(chat){
    console.log(chat);
    io.emit('message', chat);
  });
  
  client.on('disconnect', function(){
    var chat = {handle:handle,msg:"just left."};
    console.log(chat);
    client.broadcast.emit('message', chat);
    client.broadcast.emit('remove-member', handle);
  });
});
