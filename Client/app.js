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
  $scope.draft = {};

  $scope.addMember = function(member){
    console.log('calling addMember method with: ' + member);
    $scope.members.push(member);
    $scope.$digest();
  };
  
  $scope.removeMember = function(member){
    var i = $scope.members.lastIndexOf(member);
    $scope.members.splice(i,1);
    $scope.$digest();
  };

  $scope.receiveChat = function(chat){
    console.log('calling receiveChat method');
    $scope.chats.push(chat);
    $scope.$digest();
//    $('#messages-box').animate({scrollTop: $('#messages-box')[0].scrollHeight}, "fast");
    var scrollBox = document.getElementById("messages-box");
    console.log('scrollBox.scrollTop: ' + scrollBox.scrollTop);
    console.log('scrollBox.scrollHeight: ' + scrollBox.scrollHeight);
    scrollBox.scrollTop = scrollBox.scrollHeight;
  };

  $scope.sendChat = function(chat){
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
//    $scope.chats.push(welcome.chats);
//    $scope.$digest();
    welcome.chats.forEach(function(chat){
      $scope.receiveChat(chat);
    });
  });
  
  server.on('remove-member', function(member){
    console.log("message from server to remove: " + member);
    $scope.removeMember(member.name);
  });    

  server.on('message', function(chat){
    console.log('received message from server: ' + chat.msg);
    $scope.receiveChat(chat);
  });
});

server.on('alert', function (data) {
  alert(data.message);
});
