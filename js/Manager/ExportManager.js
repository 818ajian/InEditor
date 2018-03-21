/**
 * @author suheeeee<lalune1120@hotmail.com>
 */

define([
  "../PubSub/Subscriber.js",
  "../JsonFormat/FeatureFactory4Factory.js",
  "../JsonFormat/FeatureFactory4Viewer.js"
], function(
  Subscriber,
  FeatureFactory4Factory,
  FeatureFactory4Viewer
) {
  'use strict';

  /**
   * @class ExportManager
   * @augments Subscriber
   */
  function ExportManager() {

    Subscriber.apply(this, arguments);

    this.init();
  }

  ExportManager.prototype = Object.create(Subscriber.prototype);

  ExportManager.prototype.init = function() {

    this.name = 'ExportManager';

    this.addCallbackFun('exporttoviewer', this.exportToViewer);
    this.addCallbackFun('exporttofactory', this.exportToFactory);

  }

  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.exportToViewer = function(reqObj) {

    $('#go-viewer-modal').modal('hide');

    var manager = window.broker.getManager('exporttoviewer', 'ExportManager');

    var cellsResult = manager.cellObj4Viewer(manager);
    var bbox = cellsResult.bbox;
    var cells = cellsResult.cells;
    var cellBoundaries = manager.cellBoundaryObj4Viewer(manager);
    var states = manager.stateObj4Viewer(manager);
    var transitions = manager.transitionObj4Viewer(manager);

    var result = {
      'bbox': bbox
    };

    if (Object.keys(cells).length != 0) result['CellSpace'] = cells;
    if (Object.keys(cellBoundaries).length != 0) result['CellSpaceBoundary'] = cellBoundaries;
    if (Object.keys(states).length != 0) result['State'] = states;
    if (Object.keys(transitions).length != 0) result['Transition'] = transitions;

    if (Object.keys(result).length == 1) {

      log.warn('ExportManager.exportToViewer : There is nothing to export :-<');
      return;

    }

    result = JSON.stringify(result);

    // send json data to viewer
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status == 200) {
        log.info(">>>> succeed to export to viewer");
      }
    }

    xhr.open("POST", reqObj.address, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(result);
  }


  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.cellObj4Viewer = function(manager) {

    var cells = {};
    var VERY_SMALL_VALUE = -999999;
    var VERY_BIG_VALUE = 999999;
    var min = {
      x: VERY_BIG_VALUE,
      y: VERY_BIG_VALUE,
      z: VERY_BIG_VALUE,
      d: VERY_BIG_VALUE
    };
    var max = {
      x: VERY_SMALL_VALUE,
      y: VERY_SMALL_VALUE,
      z: VERY_SMALL_VALUE,
      d: VERY_SMALL_VALUE
    };


    var geometries = window.storage.geometryContainer.cellGeometry;
    var properties = window.storage.propertyContainer.cellProperties;
    var floorProperties = window.storage.propertyContainer.floorProperties;

    // copy geometry coordinates
    for (var key in geometries) {

      var tmp = new FeatureFactory4Viewer('CellSpace');
      tmp.setGeometryId("CG-" + geometries[key].id);
      tmp.pushCoordinatesFromDots(geometries[key].points);
      cells[geometries[key].id] = tmp;

    }

    // copy attributes
    for (var key in properties) {

      var id = properties[key].id;
      cells[id].setName(properties[key].name);
      cells[id].setDescription(properties[key].description);
      cells[id].setPartialboundedBy(properties[key].partialboundedBy);
      cells[id].setExternalReference(properties[key].externalReference);
      cells[id].setDuality(properties[key].duality);

    }

    // pixel to real world coordinates
    for (var floorKey in floorProperties) {

      var cellkeyInFloor = floorProperties[floorKey].cellKey;
      var stage = window.storage.canvasContainer.stages[floorProperties[floorKey].id].stage;

      var pixelLLC = [0, 0, 0];
      var pixelURC = [stage.getAttr('width'), stage.getAttr('height'), 0];
      var worldLLC = [floorProperties[floorKey].lowerCorner[0] * 1, floorProperties[floorKey].lowerCorner[1] * 1, 0];
      var worldURC = [floorProperties[floorKey].upperCorner[0] * 1, floorProperties[floorKey].upperCorner[1] * 1, 0];


      for (var cellKey in cellkeyInFloor) {

        cells[cellkeyInFloor[cellKey]].setHeight(floorProperties[floorKey].celingHeight);
        var points = cells[cellkeyInFloor[cellKey]].getCoordinates();
        if (floorProperties[floorKey].groundHeight * 1 + floorProperties[floorKey].celingHeight * 1 > max.z)
          max.z = floorProperties[floorKey].groundHeight * 1 + floorProperties[floorKey].celingHeight * 1;
        if (floorProperties[floorKey].groundHeight * 1 < min.z)
          min.z = floorProperties[floorKey].groundHeight * 1;

        for (var i = 0; i < points.length; i++) {
          var trans = manager.affineTransformation(pixelURC, pixelLLC, worldURC, worldLLC, points[i]);
          cells[cellkeyInFloor[cellKey]].updateCoordinates(i, 'x', trans._data[0]);
          cells[cellkeyInFloor[cellKey]].updateCoordinates(i, 'y', trans._data[1]);
          cells[cellkeyInFloor[cellKey]].updateCoordinates(i, 'z', floorProperties[floorKey].groundHeight * 1);

          if (trans._data[0] > max.x)
            max.x = trans._data[0];
          if (trans._data[1] > max.y)
            max.y = trans._data[1];
          if (trans._data[0] < min.x)
            min.x = trans._data[0];
          if (trans._data[1] < min.y)
            min.y = trans._data[1];
        }
      }
    }

    return {
      cells: cells,
      bbox: [min.x, min.y, min.z, max.x, max.y, max.z]
    };

  }

  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.cellBoundaryObj4Viewer = function(manager) {

    var cellBoundaries = {};

    var geometries = window.storage.geometryContainer.cellBoundaryGeometry;
    var properties = window.storage.propertyContainer.cellBoundaryProperties;
    var floorProperties = window.storage.propertyContainer.floorProperties;

    // copy geometry coordinates
    for (var key in geometries) {

      var tmp = new FeatureFactory4Viewer('CellSpaceBoundary');
      tmp.setGeometryId("CBG-" + geometries[key].id);
      tmp.pushCoordinatesFromDots(geometries[key].points);
      cellBoundaries[geometries[key].id] = tmp;

    }

    // copy attributes
    for (var key in properties) {

      var id = properties[key].id;
      cellBoundaries[id].setName(properties[key].name);
      cellBoundaries[id].setDescription(properties[key].description);
      cellBoundaries[id].setExternalReference(properties[key].externalReference);
      cellBoundaries[id].setDuality(properties[key].duality);

    }

    // pixel to real world coordinates
    for (var floorKey in floorProperties) {

      var cellBoundarykeyInFloor = floorProperties[floorKey].cellBoundaryKey;
      var stage = window.storage.canvasContainer.stages[floorProperties[floorKey].id].stage;

      var pixelLLC = [0, 0, 0];
      var pixelURC = [stage.getAttr('width'), stage.getAttr('height'), 0];
      var worldLLC = [floorProperties[floorKey].lowerCorner[0] * 1, floorProperties[floorKey].lowerCorner[1] * 1, 0];
      var worldURC = [floorProperties[floorKey].upperCorner[0] * 1, floorProperties[floorKey].upperCorner[1] * 1, 0];


      for (var cellBoundaryKey in cellBoundarykeyInFloor) {

        cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].setHeight(floorProperties[floorKey].doorHeight);
        var points = cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].getCoordinates();

        for (var i = 0; i < points.length; i++) {
          var trans = manager.affineTransformation(pixelURC, pixelLLC, worldURC, worldLLC, points[i]);
          cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].updateCoordinates(i, 'x', trans._data[0]);
          cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].updateCoordinates(i, 'y', trans._data[1]);
          cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].updateCoordinates(i, 'z', floorProperties[floorKey].groundHeight * 1);
        }


        // make reverse
        var reverseObj = new FeatureFactory4Viewer('CellSpaceBoundary');
        reverseObj.copy(cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]]);
        reverseObj.setGeometryId(reverseObj.geometry.properties.id + '-REVERSE');
        reverseObj.setName(reverseObj.attributes.name + '-REVERSE');
        reverseObj.reverseCoor();
        cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey] + '-REVERSE'] = reverseObj;
      }
    }

    return cellBoundaries;

  }

  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.stateObj4Viewer = function() {

    var cells = {};


    return cells;

  }

  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.transitionObj4Viewer = function() {

    var cells = {};


    return cells;

  }


  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.exportToFactory = function(reqObj) {

    var manager = window.broker.getManager('exporttofactory', 'ExportManager');
    manager.getExportConditionFromModal();

    $('#go-factory-modal-body-to-footer-before').addClass('d-none');
    $('#go-factory-modal-body-to-footer-loading').removeClass('d-none');
    $('#go-factory-modal-body-to-footer-down').addClass('d-none');

    var result = {};

    var document = {
      "id": window.storage.propertyContainer.projectProperty.id
    };

    var indoorfeatures = {
      "docId": document.id,
      "id": window.conditions.guid()
    };

    var primalspacefeatures = {
      "docId": document.id,
      "parentId": indoorfeatures.id,
      "id": window.conditions.guid()
    };

    var baseURL = reqObj.baseURL;

    var cells = manager.cellObj4VFactory(document.id, primalspacefeatures.id);
    var cellBoundaries = manager.cellBoundaryObj4VFactory(document.id, primalspacefeatures.id);
    var states = manager.stateObj4VFactory(document.id, primalspacefeatures.id);
    var transitions = manager.transitionObj4VFactory(document.id, primalspacefeatures.id);

    var address = {
      'post-document': baseURL + '/document/' + document.id,
      'post-indoorfeatures': baseURL + '/indoorfeatures/' + indoorfeatures.id,
      'post-primalspacefeatures': baseURL + '/primalspacefeatures/' + primalspacefeatures.id,
      'post-cell': baseURL + '/cellspace/',
      'post-cellspaceboundary': baseURL + '/cellspaceboundary/',
      'get-document': baseURL + '/document/' + document.id
    };

    manager.postJson(address['post-document'], JSON.stringify(document));

    if (cells.length != 0 || cellBoundaries.length != 0) {

      manager.postJson(address['post-indoorfeatures'], JSON.stringify(indoorfeatures));
      manager.postJson(address['post-primalspacefeatures'], JSON.stringify(primalspacefeatures));

    }

    for (var i = 0; i < cells.length; i++)
      manager.postJson(address['post-cell'] + cells[i].id, JSON.stringify(cells[i]));

    for (var i = 0; i < cellBoundaries.length; i++)
      manager.postJson(address['post-cellspaceboundary'] + cellBoundaries[i].id, JSON.stringify(cellBoundaries[i]));

    manager.getDocument(address['get-document'], document.id);

  }

  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.postJson = function(address, data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", address, false);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data);
  }

  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.getDocument = function(address, documentId) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && ( xhr.status == 302 || xhr.status == 200 )){

        var getXhr = new XMLHttpRequest();
        getXhr.onreadystatechange = function(){

          if(getXhr.readyState == 4 && getXhr.status == 200){
            $('#go-factory-modal-body-to-footer-before').addClass('d-none');
            $('#go-factory-modal-body-to-footer-loading').addClass('d-none');
            $('#go-factory-modal-body-to-footer-down').removeClass('d-none');

            // download gml
            window.document.getElementById('gml-down-link').href = 'http://127.0.0.1:8080/'+getXhr.responseText;

          }

        }

        getXhr.open("POST", "http://localhost:8080/save-gml/"+documentId, false);
        getXhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
        // save gml
        getXhr.send(xhr.responseXML);

      }
    };

    xhr.open("GET", address, false);
    xhr.send();
  }

  /**
  * @memberof ExportManager
  */
  ExportManager.prototype.getExportConditionFromModal = function(){

    var exportConditions = window.conditions.exportConditions;

    // cell
    if($('#factory-geometry-type-2D').prop("checked")) exportConditions.CellSpace.geometry.extrude = false;
    if($('#factory-geometry-type-3D').prop("checked")) exportConditions.CellSpace.geometry.extrude = true;

    if($('#factory-property-cell-name').prop("checked")) exportConditions.CellSpace.properties.name = true;
    else exportConditions.CellSpace.properties.name = false;

    if($('#factory-property-cell-description').prop("checked")) exportConditions.CellSpace.properties.description = true;
    else exportConditions.CellSpace.properties.description = false;

    if($('#factory-property-cell-partialboundedByexternalReference').prop("checked")) exportConditions.CellSpace.properties.partialboundedByexternalReference = true;
    else exportConditions.CellSpace.properties.partialboundedByexternalReference = false;

    if($('#factory-property-cell-externalReference').prop("checked")) exportConditions.CellSpace.properties.externalReference = true;
    else exportConditions.CellSpace.properties.externalReference = false;

    if($('#factory-property-cell-duality').prop("checked")) exportConditions.CellSpace.properties.duality = true;
    else exportConditions.CellSpace.properties.duality = false;


    // cellboundary
    if($('#factory-geometry-type-2D').prop("checked")) exportConditions.CellSpaceBoundary.geometry.extrude = false;
    if($('#factory-geometry-type-3D').prop("checked")) exportConditions.CellSpaceBoundary.geometry.extrude = true;

    if($('#factory-property-cellbondary-name').prop("checked")) exportConditions.CellSpaceBoundary.properties.name = true;
    else exportConditions.CellSpaceBoundary.properties.name = false;

    if($('#factory-property-cellbondary-description').prop("checked")) exportConditions.CellSpaceBoundary.properties.description = true;
    else exportConditions.CellSpaceBoundary.properties.description = false;

    if($('#factory-property-cellbondary-externalReference').prop("checked")) exportConditions.CellSpaceBoundary.properties.externalReference = true;
    else exportConditions.CellSpaceBoundary.properties.externalReference = false;

    if($('#factory-property-cellbondary-duality').prop("checked")) exportConditions.CellSpaceBoundary.properties.duality = true;
    else exportConditions.CellSpaceBoundary.properties.duality = false;


    // state
    if($('#factory-property-state-name').prop("checked")) exportConditions.State.properties.name = true;
    else exportConditions.State.properties.name = false;

    if($('#factory-property-state-description').prop("checked")) exportConditions.State.properties.description = true;
    else exportConditions.State.properties.description = false;

    if($('#factory-property-state-connected').prop("checked")) exportConditions.State.properties.connected = true;
    else exportConditions.State.properties.connected = false;

    if($('#factory-property-state-duality').prop("checked")) exportConditions.State.properties.duality = true;
    else exportConditions.State.properties.duality = false;


    // transition
    if($('#factory-property-transition-name').prop("checked")) exportConditions.Transition.properties.name = true;
    else exportConditions.Transition.properties.name = false;

    if($('#factory-property-transition-description').prop("checked")) exportConditions.Transition.properties.description = true;
    else exportConditions.Transition.properties.description = false;

    if($('#factory-property-transition-weight').prop("checked")) exportConditions.Transition.properties.weight = true;
    else exportConditions.Transition.properties.weight = false;

    if($('#factory-property-transition-duality').prop("checked")) exportConditions.Transition.properties.duality = true;
    else exportConditions.Transition.properties.duality = false;

  }


  /**
   * @memberof ExportManager
   * @return Array of Format4Factory.CellSpace
   */
  ExportManager.prototype.cellObj4VFactory = function(docId, parentId) {

    var cells = {};
    var result = [];
    var conditions = window.conditions.exportConditions.CellSpace;
    var geometries = window.storage.geometryContainer.cellGeometry;
    var properties = window.storage.propertyContainer.cellProperties;
    var floorProperties = window.storage.propertyContainer.floorProperties;
    var manager = window.broker.getManager('exporttofactory', 'ExportManager');

    var solid = [];

    // copy geometry coordinates
    for (var key in geometries) {

      var tmp = new FeatureFactory4Factory('CellSpace', conditions);
      tmp.setId(geometries[key].id);
      tmp.setDocId(docId);
      tmp.setParentId(parentId);
      tmp.setGeometryId("CG-" + geometries[key].id);
      tmp.pushCoordinatesFromDots(geometries[key].points);
      cells[geometries[key].id] = tmp;

    }

    // copy attributes
    for (var key in properties) {

      var id = properties[key].id;
      if (conditions.properties.name) cells[id].setName(properties[key].name);
      if (conditions.properties.description) cells[id].setDescription(properties[key].description);
      if (conditions.properties.partialboundedBy) cells[id].setPartialboundedBy(properties[key].partialboundedBy);
      if (conditions.properties.externalReference) cells[id].setExternalReference(properties[key].externalReference);
      if (conditions.properties.duality) cells[id].setDuality(properties[key].duality);

    }

    // pixel to real world coordinates
    for (var floorKey in floorProperties) {

      var cellkeyInFloor = floorProperties[floorKey].cellKey;
      var stage = window.storage.canvasContainer.stages[floorProperties[floorKey].id].stage;

      var pixelLLC = [0, 0, 0];
      var pixelURC = [stage.getAttr('width'), stage.getAttr('height'), 0];
      var worldLLC = [floorProperties[floorKey].lowerCorner[0] * 1, floorProperties[floorKey].lowerCorner[1] * 1, 0];
      var worldURC = [floorProperties[floorKey].upperCorner[0] * 1, floorProperties[floorKey].upperCorner[1] * 1, 0];


      for (var cellKey in cellkeyInFloor) {

        solid = [];

        cells[cellkeyInFloor[cellKey]].setHeight(floorProperties[floorKey].celingHeight);
        var points = cells[cellkeyInFloor[cellKey]].getCoordinates();

        for (var i = 0; i < points.length; i++) {
          var trans = manager.affineTransformation(pixelURC, pixelLLC, worldURC, worldLLC, points[i]);
          cells[cellkeyInFloor[cellKey]].updateCoordinates(i, 'x', trans._data[0]);
          cells[cellkeyInFloor[cellKey]].updateCoordinates(i, 'y', trans._data[1]);
          cells[cellkeyInFloor[cellKey]].updateCoordinates(i, 'z', floorProperties[floorKey].groundHeight * 1);

        }

        cells[cellkeyInFloor[cellKey]].setWKT(manager.extrudCell(cells[cellkeyInFloor[cellKey]].getCoordinates(), floorProperties[floorKey].celingHeight * 1));
      }
    }

    for (var key in cells) {
      cells[key].simplify();
      result.push(cells[key]);
    }

    return result;

  }

  /**
   * @memberof ExportManager
   * @return Array of Format4Factory.CellSpaceBoundary
   */
  ExportManager.prototype.cellBoundaryObj4VFactory = function(docId, parentId) {
    var cellBoundaries = {};
    var result = [];
    var conditions = window.conditions.exportConditions.CellSpaceBoundary;
    var geometries = window.storage.geometryContainer.cellBoundaryGeometry;
    var properties = window.storage.propertyContainer.cellBoundaryProperties;
    var floorProperties = window.storage.propertyContainer.floorProperties;
    var manager = window.broker.getManager('exporttofactory', 'ExportManager');




    // copy geometry coordinates
    for (var key in geometries) {

      var tmp = new FeatureFactory4Factory('CellSpaceBoundary', conditions);
      tmp.setId(geometries[key].id);
      tmp.setDocId(docId);
      tmp.setParentId(parentId);
      tmp.setGeometryId("CBG-" + geometries[key].id);
      tmp.pushCoordinatesFromDots(geometries[key].points);
      cellBoundaries[geometries[key].id] = tmp;

    }

    // copy attributes
    for (var key in properties) {

      var id = properties[key].id;
      if (conditions.properties.name) cellBoundaries[id].setName(properties[key].name);
      if (conditions.properties.description) cellBoundaries[id].setDescription(properties[key].description);
      if (conditions.properties.externalReference) cellBoundaries[id].setExternalReference(properties[key].externalReference);
      if (conditions.properties.duality) cellBoundaries[id].setDuality(properties[key].duality);

    }

    // pixel to real world coordinates
    for (var floorKey in floorProperties) {

      var cellBoundarykeyInFloor = floorProperties[floorKey].cellBoundaryKey;
      var stage = window.storage.canvasContainer.stages[floorProperties[floorKey].id].stage;

      var pixelLLC = [0, 0, 0];
      var pixelURC = [stage.getAttr('width'), stage.getAttr('height'), 0];
      var worldLLC = [floorProperties[floorKey].lowerCorner[0] * 1, floorProperties[floorKey].lowerCorner[1] * 1, 0];
      var worldURC = [floorProperties[floorKey].upperCorner[0] * 1, floorProperties[floorKey].upperCorner[1] * 1, 0];


      for (var cellBoundaryKey in cellBoundarykeyInFloor) {

        var surface = [];

        cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].setHeight(floorProperties[floorKey].doorHeight);
        var points = cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].getCoordinates();

        for (var i = 0; i < points.length; i++) {
          var trans = manager.affineTransformation(pixelURC, pixelLLC, worldURC, worldLLC, points[i]);
          cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].updateCoordinates(i, 'x', trans._data[0]);
          cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].updateCoordinates(i, 'y', trans._data[1]);
          cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].updateCoordinates(i, 'z', floorProperties[floorKey].groundHeight * 1);

        }

        // make reverse
        var reverseObj = new FeatureFactory4Factory('CellSpaceBoundary', conditions);
        reverseObj.copy(cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]]);
        reverseObj.setId(reverseObj.id + '-REVERSE');
        reverseObj.setGeometryId(reverseObj.geometry.properties.id + '-REVERSE');
        reverseObj.setName(reverseObj.properties.name + '-REVERSE')
        reverseObj.reverseCoor();
        cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey] + '-REVERSE'] = reverseObj;

        cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].setWKT(manager.extrudeCellBoundary(cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey]].getCoordinates(), floorProperties[floorKey].doorHeight * 1));
        cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey] + '-REVERSE'].setWKT(manager.extrudeCellBoundary(cellBoundaries[cellBoundarykeyInFloor[cellBoundaryKey] + '-REVERSE'].getCoordinates(), floorProperties[floorKey].doorHeight * 1));

      }
    }

    for (var key in cellBoundaries) {
      cellBoundaries[key].simplify();
      result.push(cellBoundaries[key]);
    }

    return result;
  }

  /**
   * @memberof ExportManager
   * @return Array of Format4Factory.State
   */
  ExportManager.prototype.stateObj4VFactory = function(docId, parentId) {
    var states = [];

    return states;
  }

  /**
   * @memberof ExportManager
   * @return Array of Format4Factory.Transition
   */
  ExportManager.prototype.transitionObj4VFactory = function(docId, parentId) {
    var transitions = [];

    return transitions;
  }

  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.affineTransformation = function(pixelURC, pixelLLC, worldURC, worldLLC, point) {

    var widthScale = worldURC[0] / pixelURC[0];
    var heightScale = worldURC[1] / pixelURC[1];
    var widthTrans = worldLLC[0] - pixelLLC[0];
    var heightTrans = worldLLC[1] - pixelLLC[1];
    var matrix = math.matrix([
      [widthScale, 0, widthTrans],
      [0, heightScale, heightTrans],
      [0, 0, 1]
    ]);
    var pointMatrix = math.matrix([point[0], point[1], point[2]]);

    return math.multiply(matrix, pointMatrix);

  }

  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.extrudCell = function(surface, ch) {

    var down = surface;
    var up = [];
    var result = [];

    var len = down.length;

    for (var i = 0; i < len; i++) {
      var tmp = JSON.parse(JSON.stringify(down[i]));
      tmp[2] += ch;
      up.push(tmp);
    }

    // result.push(down);

    for (var i = 0; i < len - 1; i++) {

      var downLeft = JSON.parse(JSON.stringify(down[i]));
      var downRight = JSON.parse(JSON.stringify(down[i + 1]));
      var upRigth = JSON.parse(JSON.stringify(up[i + 1]));
      var upLeft = JSON.parse(JSON.stringify(up[i]));

      result.push([downLeft, downRight, upRigth, upLeft, downLeft]);

    }

    result.push(up);

    var tmp = [];
    for (var i = 0; i < down.length; i++) {
      tmp.push(down[down.length - i - 1]);
    }

    result.push(tmp);

    return result;
  }

  /**
   * @memberof ExportManager
   */
  ExportManager.prototype.extrudeCellBoundary = function(line, ch) {

    // var result = [];
    //
    // for(var i = 0; i < line.length-1; i++){
    //
    //   var first = line[i];
    //   var second = line[i+1];
    //
    //   result.push([first, second, [second[0], second[1], ch], [first[0], first[1], ch], first]);
    //
    // }

    var first = line[0];
    var second = line[1];

    var result = [first, second, [second[0], second[1], ch],
      [first[0], first[1], ch], first
    ];


    return result;

  }


  return ExportManager;
});