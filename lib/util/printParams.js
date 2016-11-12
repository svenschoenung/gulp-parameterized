function printParams(params) {
  return Object.keys(params)
    .filter(function(param) {
      return param != '$0' && param != '_';
    })
    .map(function(param) {
      return '--' + param + '=' + params[param];
    })
    .join(' ');
}

module.exports = function(params) {
  return (' ' + printParams(params)).trim();
};
