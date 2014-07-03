var username = "";

while(!username){
  username = prompt("Please enter your name");
}

$('ul').removeClass('hidden');

var server = io.connect('107.170.207.4:3000'); //PRODUCTION
//var server = io.connect('http://localhost:3000') //TESTING local

server.emit('submit-name', username);

var app = angular.module('chat',[]);

var chatController = app.controller('ChatController', function($scope){
  $scope.members = [];
  $scope.chats = [];

  $scope.member = username;

  $scope.addMember = function(member){
    console.log('calling addMember method with: ' + member);
    $scope.members.push(member);
    $scope.$digest();
  };
  
  $scope.removeMember = function(member){
    console.log('calling removeMember method');
    var i = $scope.members.lastIndexOf(member);
    $scope.members.splice(i,1);
    $scope.$digest();
  };

  $scope.receiveChat = function(chat){
    console.log('calling receiveChat method');
    $scope.chats.push(chat);
    $scope.$digest();
//    $('#messages-box').animate({scrollTop: $('#messages-box')[0].scrollHeight}, "fast");
  };

  $scope.sendChat = function(chat){
    console.log('calling sendChat method');
    chat.handle = username;
    
    server.emit('message', chat);
    
    $scope.draft = {};
  };
  
  server.on('add-member', function(member){
    console.log("message from server to add: " + member);
    $scope.addMember(member);
  });
  
  server.on('welcome', function(welcome){
    welcome.members.forEach(function(member){
      $scope.addMember(member.name);
    });
    $scope.chats.push(welcome.chats);
    $scope.$digest();
/*
    welcome.chats.forEach(function(chat){
      $scope.receiveChat(chat);
    });
*/
  });
  
  server.on('remove-member', function(member){
    console.log("message from server to remove: " + member);
    $scope.removeMember(member.name);
  });    

  server.on('message', function(chat){
    console.log('received message from server: ' + chat.msg);
    $scope.receiveChat(chat);
  });

  $scope.draft = {};
  
});

server.on('alert', function (data) {
  alert(data.message);
});


