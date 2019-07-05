//https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}



String.prototype.toCamelCase = function() {
  return this.replace(/-([a-z])/g, function(match, capture) {
    return capture.toUpperCase()
  })
}