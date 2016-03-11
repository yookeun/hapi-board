'use strict'

const Hapi = require('hapi');
const Inert = require('inert');
const Path = require('path');

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public/views')
      }
    }
  }
});

server.connection({ port:8080 });
server.register(Inert, () => {});

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply.file('index.html');
  }
});


server.start((err) => {
  if (err) {
    throw err;
  }
  console.log("Hapi-board Server running...", server.info.uri);
});
