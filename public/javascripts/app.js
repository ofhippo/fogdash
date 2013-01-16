(function() {
  
  var socket = io.connect('http://localhost');
  socket.on('rnd', function (data) {
    console.log(data);
  });
  
})();