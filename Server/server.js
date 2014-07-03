var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;

var port = 3000;

MongoClient.connect('mongodb://127.0.0.1/db', function(err, db){
  if(err) throw err;
  console.log("connected to mongodb!");

  var memberCollection = db.collection('members');
/*
  memberCollection.drop(function(err,res){
    if(err) {
      console.log("error dropping the members");
      throw err;
    }
  });
*/
  //create the collection and limit it to the lesser of ~20KB or 3 documents
  var chatCollection = db.collection('chats',{ 'capped' : true, 'size' : 200, 'max' : 3 });
/*
  chatCollection.drop(function(err,res){
    if(err) {
      console.log("error dropping the chats");
      throw err;
    }
  });
*/  
  io.on('connection', function(client){
    console.log('client connected!');
    client.emit('alert', { message: 'You are connected.' });
    
    var handle = "";
    
    client.on('submit-name', function(username){
      handle = username;
      memberCollection.insert({name:handle},function(err, docs){
        if(err) throw err;
        console.log("inserted: " + handle);
        memberCollection.find().toArray(function(err, memberList){
          if(err) throw err;
          chatCollection.find().toArray(function(err, chatList){
            if(err) throw err;
            client.emit('welcome', {members: memberList, chats: chatList});
            doMessage({handle:"server",msg:handle + " just joined."});
            client.broadcast.emit('add-member', handle);
          });
        });
      });
    });
    
    var doMessage = function(chat){
      chatCollection.insert({handle:chat.handle, msg:chat.msg}, function(err, docs){
        if(err) throw err;
        io.emit('message', chat);
      });
    }
    
    client.on('message', function(chat){
      doMessage(chat);
    });
    
    client.on('disconnect', function(){
      var chat = {handle:"server",msg: handle + " just left."};
      doMessage(chat);
      memberCollection.remove({name:handle}, function(err, numRemoved){
        console.log("documents removed: " + numRemoved);
        client.broadcast.emit('remove-member', handle);
      });
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


