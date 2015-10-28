var gutil = require('gulp-util');
var parser = require('swagger-parser');
var PluginError = gutil.PluginError;
var through = require('through2');
var _ = require('lodash');

const PLUGIN_NAME = 'gulp-swagger-parser';

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

var gulpSwaggerParser = {
    validate: function() {
        console.log('--- validate ---');
    },
    dereference: function() {
        console.log('--- dereference ---');
    },
    bundle: function() {
        console.log('--- bundle ---');
    },
    parse: function() {
        console.log('--- parse ---');
    },
    resolve: function() {
        console.log('--- resolve ---');
    }
};

function gulpSwaggerParserWrapper(method, options) {
  if (!method) {
    throw new PluginError(PLUGIN_NAME, 'Please specify a swagger-parser method');
  }
  if (!gulpSwaggerParser[method]) {
    throw new PluginError(PLUGIN_NAME, 'Invalid swagger-parser method: ' + method);
  }
  method = new Buffer(method);

  options = options || {};

  return through.obj(function(file, enc, cb) {

    if ( file.isStream() ) {
        cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }

    console.log('--- init parser ---');
    parser[method](file.history[0], options, function(err, api) {
        if (err) {
            cb(new PluginError(PLUGIN_NAME, err.details[0].message));
        } else {
            console.log('--- success: ' + method + ' ---');
            console.log(api);
        }

        cb(null, file);
    });
  });
}

module.exports = gulpSwaggerParserWrapper;