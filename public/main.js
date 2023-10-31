$(function () {
  var socket = io();
  socket.on('web-message', function (msg) {
      $('#messages').append($('<li>').text(msg));
  });
});