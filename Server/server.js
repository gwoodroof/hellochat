var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;

var port = 3000;

MongoClient.connect('mongodb://127.0.0.1/db', function(err, db){
  if(err) throw err;
  console.log("connected to mongodb!");

  var memberCollection = db.collection('members');
  var chatCollection = db.collection('chats');
  
  io.on('connection', function(client){
    console.log('client connected!');
//    client.emit('alert', { message: 'You are connected.' });
    
    var handle = "";
    
    client.on('submit-name', function(username){
      handle = username;
      memberCollection.insert({name:handle},function(err, docs){
        if(err) throw err;
        console.log("inserted: " + handle);
        client.emit('member-list', memberCollection.toArray());
        client.emit('chat-list', chatCollection.toArray());
      });

      var chat = {handle:"server",msg:handle + " just joined."};
      console.log(chat);
      io.emit('message', chat);
      io.emit('add-member', handle);
    });
    
    client.on('message', function(chat){
      console.log(chat);
      chatCollection.insert({handle:chat.handle, msg:chat.msg}, function(err, docs){
        if(err) throw err;
        io.emit('message', chat);
      });

    });
    
    client.on('disconnect', function(){
      var chat = {handle:handle,msg:"just left."};
      console.log(chat);
      client.broadcast.emit('message', chat);
      client.broadcast.emit('remove-member', handle);
    });
  });
});

server.listen(port);
console.log('listening on port: ' + port);

app.get('/', function(request, response){
  console.log('fetching index.html...');
  response.sendfile("/opt/hellochat/Client/index.html");
});

app.get('/style.css', function(request, response){
  console.log('fetching style.css...');
  response.sendfile("/opt/hellochat/Client/style.css");
});

app.get('/app.js', function(request, response){
  console.log('fetching app.js...');
  response.sendfile("/opt/hellochat/Client/app.js");
});


