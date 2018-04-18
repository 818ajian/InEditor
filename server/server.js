const express = require('express');
const app = express();
const BSON = require('bson');
const earcut = require('earcut');
const xmlBeautify = require('xml-beautifier');
const fs = require('fs');

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log(`Listening on port ${port}`));
var io = require('socket.io').listen(server);

app.get('/api/hello', (req, res) => {
  res.send({
    express: 'Hello From Express'
  });
});

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket이 들어온다
io.on('connection', function(socket) {

  ////////////////////////////////////////////////////////////////////////////////////////
  // save-project                                                                       //
  //   Save the project data as bson form                                               //
  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on('save-project', function(data) {
    console.log('Client Request --> save-project');

    var bson = new BSON();

    fs.writeFile('./output/save-project.bson', data, function(err) {
      if (err) return socket.emit('save-project', err);

      socket.emit('save-project', 'success');
    });
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  // convert-bson-to-json                                                               //
  //   Convert bson data to json using BSON                                             //
  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on('convert-bson-to-json', function(data) {
    console.log('Client Request --> convert-bson-to-json');

    var buffer = new Buffer(data, "binary");
    var bson = new BSON();
    var json = bson.deserialize(buffer);
    socket.emit('convert-bson-to-json', json);

  });

  ////////////////////////////////////////////////////////////////////////////////////////
  // convert-bson-to-json                                                               //
  //   Convert bson data to json using BSON                                             //
  //   parm : data { filename, data }                                                   //
  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on('save-gml', function(data) {
    console.log('Client Request --> save-gml');

    fs.writeFile('./output/' + data.filename + '.gml', xmlBeautify(data.data), function(err) {
      if (err) return socket.emit('save-project', err);
      socket.emit('save-gml', '/output/' + data.filename + '.gml');
    });

  });

  ////////////////////////////////////////////////////////////////////////////////////////
  // triangulate                                                                        //
  //                                                                                    //
  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on('triangulate', function(data) {
    console.log('Client Request --> triangulate');

    var triangles = earcut(data);
    socket.emit('triangulate', '/output/' + data.filename + '.gml');

  });

  // 클라이언트로부터의 메시지가 수신되면
  socket.on('chat', function(data) {
    // console.log('Message from %s: %s', socket.name, data.msg);
    //
    // var msg = {
    //   from: {
    //     name: socket.name,
    //     userid: socket.userid
    //   },
    //   msg: data.msg
    // };

    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    // socket.broadcast.emit('chat', msg);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
    // socket.emit('s2c chat', msg);

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.emit('s2c chat', msg);

    // 특정 클라이언트에게만 메시지를 전송한다
    // io.to(id).emit('s2c chat', data);
  });

  // force client disconnect from server
  socket.on('forceDisconnect', function() {
    socket.disconnect();
  })

  socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.name);
  });

});
