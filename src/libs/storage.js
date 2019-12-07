define('jsBasePath/store/storage', function (require, exports, module) {
  var storageManager = require('jsBasePath/common/utils-storage-manage');

  var STORAGE_KEY = 'ucar-storage';
  var SESSION_STORAGE_KEY = 'ucar-sstorage';

  var storage = {
    get: function () {
      var data = {};
      var localData = storageManager.getStorage(STORAGE_KEY);
      var sessionData = storageManager.getSession(SESSION_STORAGE_KEY);
      if (localData !== null) {
        data = localData;
      }
      if (sessionData !== null) {
        data.session = sessionData;
      }
      return data;
    },
    setLocal: function (data) {
      var sessionData = data.session;
      if (sessionData) {
        delete data.session;
        storageManager.setStorage(STORAGE_KEY, data);
        data.session = sessionData;
      } else {
        storageManager.setStorage(STORAGE_KEY, data);
      }
    },
    setSession: function (data) {
      var sessionData = data.session || data;
      storageManager.setSession(SESSION_STORAGE_KEY, sessionData);
    },
  };

  module.exports = storage;
});
