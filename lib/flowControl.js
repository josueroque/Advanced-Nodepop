'use strict';

const serialArray = function (arr, func, callbackFin) {
    if (arr.length > 0) {

      func(arr.shift(), function (err) {
        if (err) {
          return callbackFin(err);
        }
  
        serialArray(arr, func, callbackFin);
      });
    } else {

      callbackFin();
    }
  }
  
  module.exports = {
    serialArray: serialArray
  };
  