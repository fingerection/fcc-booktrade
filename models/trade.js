var TradeClass = function() {
  this.id = 0;
  this.trades = [];
};

TradeClass.prototype.create = function(sendbook, receivebook, creator) {
  this.id += 1
  this.trades.push({
    id: this.id,
    sendbook: sendbook,
    receivebook: receivebook,
    creator: creator,
    finished: 0
  });
};

TradeClass.prototype.getTradeToMe = function(author) {
  var result = [];
  for(var i=0; i<this.trades.length; i++) {
    var trade = this.trades[i];
    if(trade.receivebook.author === author) {
      
      result.push(trade);
    }
  }
  return result;
}

TradeClass.prototype.getTradeFromMe = function(author) {
  var result = [];
  for(var i=0; i<this.trades.length; i++) {
    var trade = this.trades[i];
    if(trade.sendbook.author === author) {
      result.push(trade);
    }
  }
  return result;
}

TradeClass.prototype.accept = function(tradeid, author) {
  for(var i=0; i<this.trades.length; i++) {
    var trade = this.trades[i];
    if (trade.id.toString() === tradeid) {
      console.log(trade.receivebook.author, author);
      if (trade.receivebook.author == author){
        
        trade.finished = 1;
        console.log(this.trades);
      }
    }
  }
};

TradeClass.prototype.delete = function(tradeid, author) {
  var index = -1;
  for(var i=0; i<this.trades.length; i++) {
    var trade = this.trades[i];
    if (trade.id.toString() == tradeid) {
      if (trade.sendbook.author == author){
        index = i;
      }
      break;
    }
  }
  if (index > -1) {
    this.trades.splice(index,1);
  }
};

TradeClass.prototype.getById = function(tradeid) {
  for(var i=0; i<this.trades.length; i++){
    if(this.trades[i].id.toString() == tradeid) {
      return this.trades[i];
    }
  }
  return null;
};


module.exports = TradeClass;