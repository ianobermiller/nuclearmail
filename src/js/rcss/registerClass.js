var md5 = require('md5');
var _ = require('lodash');

function hashStyle(styleObj) {
  return md5.digest_s(JSON.stringify(styleObj));
}

function generateValidCSSClassName(styleId) {
  // CSS classNames can't start with a number.
  return 'c' + styleId;
}

var global = Function("return this")();
global.__RCSS_0_registry = global.__RCSS_0_registry || {};

function registerClass(styleObj, nameHint) {
  var styleId = nameHint || generateValidCSSClassName(hashStyle(styleObj));

  if (global.__RCSS_0_registry[styleId] == null) {
    global.__RCSS_0_registry[styleId] = {
      className: styleId,
      style: styleObj
    };
  }

  return _.clone(global.__RCSS_0_registry[styleId]);
}

module.exports = registerClass;
