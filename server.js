'use strict'

const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');
const Boom = require('boom');
const Mongodb = require('hapi-mongodb');
const Joi = require('joi');

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


/*
  mongodb 설정값들
*/
var dbOpts  = {
  "url": "mongodb://localhost:27017/hapiboard",
  "settings": {
    "db": {
      "native_parser": false
    }
  }
};

/*
  mongodb 를 등록한다.
*/
server.register({
  register: Mongodb,
  options: dbOpts
})

server.register(require('vision'), (err) => {
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'public/views',
    layoutPath: 'public/views/layout',
    layout: 'layout',
    partialsPath: 'public/views/partials',
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


/*
  기본 페이지
*/
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    var data = {
      title: "Hello, Hapi Board!"
    }
    reply.view('index',data);
  }
});


/*
  리스트 페이지
*/
server.route({
  method: 'GET',
  path: '/list/{title?}',
  handler: function(request, reply) {
    var param = {};
    if(typeof(request.params.title) != 'undefined') {
      param = {
        "title": request.params.title
      };
    }
    console.log(param);

    var db = request.server.plugins['hapi-mongodb'].db;
    db.collection('hapiboard').find().toArray(function(err, document) {
      var hapiboards = [];
      for (var i in document) {
        var hapiboard = {
          id: document[i]._id,
          name: document[i].name,
          gender: document[i].gender,
          occupation: document[i].occupation,
          title: document[i].title,
          content: document[i].content
        };
        hapiboards.push(hapiboard);
      }
      //reply({hapiboards:hapiboards});
      var data = {
        header: '리스트',
        hapiboards: hapiboards
      }

      reply.view('board/list', data);
      //reply(data);
    });
  }
});


/*
 등록/수정 페이지
*/
server.route({
  method: 'GET',
  path: '/edit',
  handler: function(request, reply) {
    var data = {
      header: '등록/수정'
    }
    reply.view('board/edit', data)
  }
});

/*
  등록처리
*/
server.route({
  method: 'POST',
  path: '/add',
  handler: function(request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var hapiboardForm = {
      name : request.payload.name,
      gender : request.payload.gender,
      occupation: request.payload.occupation,
      title: request.payload.title,
      content: request.payload.content
    };

    /*
    console.log("name = " + hapiboardForm.name);
    console.log("gender = " + hapiboardForm.gender);
    console.log("occupation = " + hapiboardForm.occupation);
    console.log("title = " + hapiboardForm.title);
    console.log("content = " + hapiboardForm.content);
    */

    db.collection('hapiboard').insert(hapiboardForm, {w:1}, function(err) {
      if (err) {
        return reply(Boom.internal('Internal Database Error',err));
      } else {
        console.log("success!");
        var result = {
          statusCode:200,
          messages:"success"
        }
        reply(result);
      }
    });
  },
  config: {
    validate: {
      payload: {
        name: Joi.string().min(3).max(10),
        gender: Joi.string().required(),
        occupation: Joi.string().required(),
        title: Joi.string().min(2),
        content: Joi.string().min(2)
      }
    }
  }
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log("Hapi-board Server running...", server.info.uri);
});
