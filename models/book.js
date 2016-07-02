var BookClass = function() {
  this.id = 0;
  this.store = {};
};

BookClass.prototype.getAll = function(author) {
  var result = [];
  for(var k in this.store) {
    if (this.store[k].finished == 1) {
      continue;
    }
    if (author !== undefined) {
      if(this.store[k].author !== author) {
        continue;
      }
    }
    result.push(this.store[k]);
  }
  return result;
};

BookClass.prototype.getById = function(bookid) {
  return this.store['index:'+bookid];
}

BookClass.prototype.create = function(title, url, author) {
  this.id += 1;
  var image = {
    id: this.id,
    title: title,
    url: url,
    author: author,
    finished: 0
  };
  this.store['index:'+this.id] = image;
};

BookClass.prototype.delete = function(id, author) {
  if (this.store['index:'+id] === undefined) {
    return;
  }
  if(this.store['index:'+id].author !== author) {
    return;
  }
  delete this.store['index:'+id];
};

module.exports = BookClass;