var
  Address = require('address-rfc2821').Address,
  util = require('util');

exports.register = function () {
  this.register_hook('rcpt', 'alias_forward');
};

exports.alias_forward = function(next, connection, params) {
  var
    plugin = this,
    aliases = this.config.get('rcpt_to.alias_forward', 'json') || {},
    rcpt = params[0],
    list;
  if(aliases[rcpt.host] && (aliases[rcpt.host][rcpt.user] || aliases[rcpt.host]["*"])) {
    list = aliases[rcpt.host][rcpt.user] || aliases[rcpt.host]["*"];
    if(!util.isArray(list))
      list = [ list ];
    connection.transaction.rcpt_to.pop();
    connection.relaying = true;
    list.forEach(function(address) {
      plugin.loginfo('Relaying to: ' + address);
      connection.transaction.rcpt_to.push(new Address('<' + address + '>'));
    });
    return next(OK);
  }
  next(DENY);
};
