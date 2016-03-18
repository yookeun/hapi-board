'use strict'

const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');


const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  }
});
server.connection({ port:8080 });

server.register(require('inert'), (err) => {
  if (err) {
    throw err;
  }
});

server.register(require('vision'), (err) => {
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'public/views',
    layoutPath: 'public/views/layout',
    layout: 'layout'
  })
});

server.route({
  method: 'GET',
  path: '/{path*}',
  handler: {
    directory: {
      path: ".",
      redirectToSlash: true,
      index: true
    }
  }
});

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    var data = {
      title: "Hello, Hapi!!"
    }
    reply.view('index',data);
  }
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log("Hapi-board Server running...", server.info.uri);
});
