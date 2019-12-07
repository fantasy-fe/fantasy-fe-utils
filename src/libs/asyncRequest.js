define('jsBasePath/store/asyncRequest', function (require, exports, module) {
  var AsyncRequest = function () {
    this.reqs = [];
    this.status = 0;//0-waithing,1-running
    this.results = {};
  };

  AsyncRequest.prototype.addRequest = function (func) {
    if (this.status !== 0) return;
    this.reqs.push(func);
  };

  AsyncRequest.prototype.go = function () {
    if (this.status !== 0) return;

    this.status = 1;
    var self = this;
    var reqs = this.reqs;
    var len = this.reqs.length;

    for (var i = 0; i < reqs.length; i++) {
      var req = reqs[i];
      if (this.status === 0) return;
      (function (i) {
        req(function (data) {
          self.results[i] = data;
          //async_continue
          len--;
          if (len === 0) {
            self.finish(self.results);
          }
        });
      })(i);
    }
  };

  AsyncRequest.prototype.finish = function (asyncResult) {
    this.status = 0;
    if (this.onfinished) {
      this.onfinished(asyncResult);
    }
  };

  AsyncRequest.prototype.clear = function () {
    if (this.status !== 0) return;
    this.reqs = [];
  };

  module.exports = AsyncRequest;
});