var gutil = require('gulp-util');
var parser = require('swagger-parser');
var PluginError = gutil.PluginError;
var through = require('through2');

const PLUGIN_NAME = 'gulp-swagger-parser';

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

function gulpSwaggerParserWrapper(method, options) {
  if (!method) {
    throw new PluginError(PLUGIN_NAME, 'Please specify a swagger-parser method');
  }
  if (!parser[method]) {
    throw new PluginError(PLUGIN_NAME, 'Invalid swagger-parser method: ' + method);
  }
  method = new Buffer(method);

  options = options || {};

  return through.obj(function(file, enc, cb) {
    var that = this;

    if (file.isNull() || file.isDirectory()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError({
        plugin: PLUGIN_NAME,
        message: 'Streams are not supported.'
      }));
      return cb();
    }

    if (file.isBuffer()) {
      parser[method](file.history[0], options, function(err, api) {
        if (err) {
          this.emit('error', new PluginError({
            plugin: PLUGIN_NAME,
            message: err.details[0].message
          }));
          return cb();
        } else {
          file = new gutil.File({
                                cwd: "",
                                base: "",
                                path: 'api.json',
                                contents: new Buffer(JSON.stringify(api))
                              });
          that.push(file);
          return cb();
        }
      });
    }

  });
}

module.exports = gulpSwaggerParserWrapper;