define([
  "./Manager.js"
],function(
  Manager
) {
  'use strict';

  function GeometryManager() {

    Manager.apply(this, arguments);

    var currentObj = null;

    this.init();
  }

  GeometryManager.prototype = Object.create(Manager.prototype);

  GeometryManager.prototype.init = function(){

    this.addReq({
      'start-geotest' : 'cycle',
      'geotest' : 'cycle',
      'end-geotest' : 'cycle',
      'singletest' : 'single'
      // 'start-addNewCell' : 'cycle'
    });

    this.addCallbackFun('start-geotest', this.startGeotest );
    this.addCallbackFun('geotest', this.geotest );
    this.addCallbackFun('end-geotest', this.endGeotest );
    this.addCallbackFun('singletest', this.singletest );
    // this.addCallbackFun('start-addNewCell', this.startAddNewCell );

  }


  GeometryManager.prototype.startGeotest = function(reqObj, storage){

    console.log("startGeotest success", storage);

  }

  GeometryManager.prototype.geotest = function(reqObj, storage){

    console.log("geotest success", storage);

  }

  GeometryManager.prototype.endGeotest = function(reqObj, storage){

    console.log("endGeotest success", storage);

  }

  GeometryManager.prototype.singletest = function(reqObj, storage){

    console.log("singletest success", storage);

  }





  return GeometryManager;
});