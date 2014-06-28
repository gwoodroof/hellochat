var username = prompt("Please enter your name");
//var server = io.connect('107.170.207.4:3000'); //PRODUCTION
var server = io.connect('http://localhost:3000') //TESTING local

if (username){
  console.log("username: " + username);
  server.emit('submit-name', username);
} else {
  alert("You need to enter a username!");
}

var memberTestArray = ["Garrett Woodroof","Brock"];
var chatTestArray = [
  {handle:"Garrett Woodroof",msg: "This is a test."},
  {handle: "Brock",msg: "This is only a test"}
];

//(function(){
  var app = angular.module('chat',[]);
  
  var chatController = app.controller('ChatController', function($scope){
    $scope.members = memberTestArray;
    $scope.chats = chatTestArray;

    $scope.member = username;

    $scope.addMember = function(member){
      console.log('calling addMember method with: ' + member);
      $scope.members.push(member);
      $scope.$digest();
    };
    
    server.on('add-member', function(member){
      console.log("message from server to add: " + member);
      $scope.addMember(member);
    });

    $scope.removeMember = function(member){
      console.log('calling removeMember method');
      var i = $scope.members.lastIndexOf(member);
      $scope.members.splice(i,1);
      $scope.$digest();
    };

    server.on('remove-member', function(member){
      console.log("message from server to remove: " + member);
      $scope.removeMember(member);
    });    

    $scope.receiveChat = function(chat){
      console.log('calling receiveChat method');
      $scope.chats.push(chat);
      $scope.$digest();
    };

    server.on('message', function(chat){
      console.log('received message from server: ' + chat.msg);
      $scope.receiveChat(chat);
    });

    $scope.draft = {};
    
    $scope.sendChat = function(chat){
      console.log('calling sendChat method');
      chat.handle = username;
      
      server.emit('message', chat);
      
      $scope.draft = {};
    };
  });
//})();

server.on('alert', function (data) {
  alert(data.message);
});


