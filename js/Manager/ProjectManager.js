/**
 * @author suheeeee<lalune1120@hotmail.com>
 */

define([
  "../PubSub/Subscriber.js",
  "../Conditions.js",
  "../Storage/Canvas/Stage.js"
], function(
  Subscriber,
  Conditions,
  Stage
) {
  'use strict';

  /**
   * @class ProjectManager
   * @augments Subscriber
   */
  function ProjectManager() {

    Subscriber.apply(this, arguments);

    this.init();
  }

  ProjectManager.prototype = Object.create(Subscriber.prototype);

  ProjectManager.prototype.init = function() {

    this.name = 'ProjectManager';

    this.addCallbackFun('saveproject', this.saveProject);
    this.addCallbackFun('loadproject', this.loadProject);

  }

  /**
  * @memberof ProjectManager
  */
  ProjectManager.prototype.saveProject = function() {


    // Serialize document
    var id = window.storage.propertyContainer.projectProperty.id;
    var doc = {};
    doc[id] = {
      'geometryContainer': window.storage.geometryContainer,
      'propertyContainer': window.storage.propertyContainer,
      'dotFoolContainer' : window.storage.dotFoolContainer,
      'canvasContainer' : {}
    };

    for(var key in window.storage.canvasContainer.stages){

      doc[id].canvasContainer[key] = {
        width : window.storage.canvasContainer.stages[key].stage.getAttr('width'),
        height : window.storage.canvasContainer.stages[key].stage.getAttr('height')
      };

    }

    doc['conditions'] = window.conditions;


    // send json data to viewer
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status == 200) {
        log.info(">>>> succeed to save project");
      }
    }

    xhr.open("POST", "http://127.0.0.1:8080/save-project", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(doc));

  }

  /**
  * @memberof ProjectManager
  */
  ProjectManager.prototype.loadProject = function(){

    // send json data to viewer
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status == 200) {
        var obj = JSON.parse(xhr.responseText);
        log.info(obj);

        window.conditions.load(obj.conditions);
        delete obj.conditions;

        var keys = Object.keys(obj);
        window.storage.propertyContainer.load(obj[keys[0]].propertyContainer);
        window.storage.dotFoolContainer.load(obj[keys[0]].dotFoolContainer);
        window.storage.geometryContainer.load(obj[keys[0]].geometryContainer, window.storage.dotFoolContainer);

        window.storage.canvasContainer.clearCanvas();

        // clear workspace
        if (obj[keys[0]].canvasContainer != null){
          window.uiContainer.workspace.clear('maketmp');
        } else {
          window.uiContainer.workspace.clear();
        }

        // add workspace and stage
        for(var key in obj[keys[0]].canvasContainer){

          var newFloorProperty = window.storage.propertyContainer.getElementById('floor', key);

          window.uiContainer.workspace.addNewWorkspace(key, newFloorProperty.name);

          window.storage.canvasContainer.stages[key] = new Stage(
            newFloorProperty.id,
            newFloorProperty.name,
            newFloorProperty.id,
            obj[keys[0]].canvasContainer[key].width,
            obj[keys[0]].canvasContainer[key].height
          );

          // bind stage click event
          window.eventHandler.stageEventBind('stage', newFloorProperty.id);

        }

        // delete tmp workspace
        if (obj[keys[0]].canvasContainer != null){
          window.uiContainer.workspace.deleteFirstWorkspace();
        }

        // add object from geometry
        window.storage.canvasContainer.addObjFromGeometries(window.storage.geometryContainer);

        // refresh tree view
        window.uiContainer.sidebar.treeview.refresh(window.storage.propertyContainer);

        log.info(">>>> succeed to load project");
      }
    }

    xhr.open("GET", "http://127.0.0.1:8080/load-project", true);
    xhr.send();

  }

  return ProjectManager;
});
