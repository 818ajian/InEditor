/**
 * @author suheeeee <lalune1120@hotmail.com>
 */

define([
  "../PubSub/Message.js",
  "./Result.js"
], function(
  Message,
  Result
) {
  'use strict';

  /**
   * @class DrawEventHandler
   */
  function DrawEventHandler() {

  }

  /**
   * @memberof DrawEventHandler
   */
  DrawEventHandler.prototype.setHandlerBinder = function(handlerBinder) {

    handlerBinder['floor-btn'] = {
      'click': this.clickFloorBtn
    };

    handlerBinder['cell-btn'] = {
      'click': this.clickCellBtn
    };

    handlerBinder['cellboundary-btn'] = {
      'click': this.clickCellBoundaryBtn
    };

    handlerBinder['state-btn'] = {
      'click': this.clickStateBtn
    };

    handlerBinder['transition-btn'] = {
      'click': this.clickTransitionBtn
    }

    handlerBinder['stair-btn'] = {
      'click': this.clickStairBtn
    }

    handlerBinder['stage'] = {
      'contentClick': this.addNewDot,
      'contentMousemove': this.stageMoveMouse,
      'contentDblclick': this.stageDbclick
      // 'contentMousedown': this.mousedown
    };

    handlerBinder['line'] = {
      'mouseover': this.lineDbclick
    };

    handlerBinder['Escape'] = {
      'keyup': this.cancelDraw
    };

    handlerBinder['Enter'] = {
      'keyup': this.finishDraw
    }

    handlerBinder['c'] = {
      'keydown': this.clickCellBtn
    }

    handlerBinder['b'] = {
      'keydown': this.clickCellBoundaryBtn
    }

    handlerBinder['r'] = {
      'keydown': this.clickTransitionBtn
    }


  }

  DrawEventHandler.prototype.stageDbclick = function(broker, previous, data){

    log.info('stage dbclick called');

    var result = new Result();

    var floor = data.currentTarget.attrs.id;
    var cursor = window.storage.canvasContainer.stages[floor].tmpLayer.group.getCursor();
    var cursorData =  window.storage.canvasContainer.stages[floor].tmpLayer.group.getCursorData();

    if(cursorData.isSnapped == false){

      result.msg = "There is no match function !";

    } else if( cursorData.snapedObj.type == 'line' && broker.isPublishable('modifyline') ){

      broker.publish(new Message('modifyline', {
        floor: floor,
        line : cursorData.snapedObj.obj
      }));

      broker.publish(new Message('start-modifypoint',{
        floor: floor,
        point: window.storage.dotFoolContainer.getDotFool(floor).getDotByPoint(cursor.coor)
      }));

      result.result = true;
      result.msg = 'modifypoint';

    } else if( cursorData.snapedObj.type == 'point' && broker.isPublishable('start-modifypoint') ){

      broker.publish(new Message('start-modifypoint', {
        floor: floor,
        point : cursorData.snapedObj.obj
      }));

      result.result = true;
      result.msg = 'modifypoint';

    } else if( broker.isPublishable('end-modifypoint') ){

      broker.publish(new Message('end-modifypoint', {
        floor: floor
      }));

      result.result = true;
      result.msg = null;

    } else {

      result.msg = 'ERROR !! There is some erroe with cursor data ' + cursorData;

    }

    return result;

  }

  DrawEventHandler.prototype.mousedown = function(broker, previous, data){
    log.info('mousedown : ', data);

    return new Result();
  }

  /**
   * @desc When cell btn clicked `start-addnewcell` or `end-addnewcell` can publish.
   * @memberof DrawEventHandler
   */
  DrawEventHandler.prototype.clickCellBtn = function(broker, previousMsg) {

    var result = new Result();

    var isFloorExist = (window.storage.propertyContainer.floorProperties.length != 0);

    if (isFloorExist && broker.isPublishable('start-addnewcell')) {

      // reqObj.floor will be active workspace
      broker.publish(new Message('start-addnewcell', null));

      result = {
        'result': true,
        'msg': 'start-addnewcell'
      };

    } else if (broker.isPublishable('end-addnewcell')) {

      if (window.tmpObj.isEmpty()) {

        broker.publish(new Message('end-addnewcell', {
          'id': window.conditions.pre_cell + (++window.conditions.LAST_CELL_ID_NUM),
          'floor': window.tmpObj.floor,
          'isEmpty': true
        }));

      } else {

        broker.publish(new Message('end-addnewcell', {
          'id': window.conditions.pre_cell + (++window.conditions.LAST_CELL_ID_NUM),
          'floor': window.tmpObj.floor
        }));

      }

      result.result = true;
      result.msg = null;

    } else if (!isFloorExist) {

      result.msg = "There is no floor ...";

    } else {

      result.msg = "wrong state transition : " + previousMsg + " to start-addnewcell, end-addnewcell.";

    }

    return result;

  }

  /**
   * @desc When floor btn clicked `addnewfloor` can publish.
   * @memberof DrawEventHandler
   */
  DrawEventHandler.prototype.clickFloorBtn = function(broker, previousMsg) {

    var result = new Result();

    if (broker.isPublishable('addnewfloor')) {

      broker.publish(new Message('addnewfloor', {
        'floor': window.conditions.pre_floor + (++window.conditions.LAST_FLOOR_ID_NUM)
      }));

      result.result = true;
      result.msg = null;

    } else {

      result.msg = "wrong state transition : " + previousMsg + " to addnewfloor.";

    }

    return result;

  }

  /**
   * @desc This will call when stage clicked, so we need to distinguish which geometry will be added new dot by the previous run message.<br>This can publish `addnewcell`,
   * @memberof DrawEventHandler
   */
  DrawEventHandler.prototype.addNewDot = function(broker, previousMsg, data) {

    var result = new Result();

    if (broker.isPublishable('addnewcell')) {

      var isSameFloor = (data.currentTarget.attrs.id == window.tmpObj.floor);
      var isFirstClick = (window.tmpObj.floor == null);

      if (isFirstClick || (!isFirstClick && isSameFloor)) {

        broker.publish(new Message('addnewcell', {
          'floor': data.currentTarget.attrs.id
        }));

        result.result = true;
        result.msg = 'addnewcell';


      } else if (!isFirstClick && !isSameFloor) {

        result.msg = "you clicked different floor!";

      } else {

        result.msg = "wrong state transition : " + previousMsg + " to addnewfloor.";

      }


    }
    else if (broker.isPublishable('addnewcellboundary')) {

      var isSameFloor = (data.currentTarget.attrs.id == window.tmpObj.floor);
      var isFirstClick = (window.tmpObj.affiliatedCell == null);

      if (isFirstClick || (!isFirstClick && isSameFloor)) {

        broker.publish(new Message('addnewcellboundary', {
          'floor': data.currentTarget.attrs.id
        }));

        result.result = true;
        result.msg = 'addnewcellboundary';

      } else if (!isFirstClick && !isSameFloor) {

        result.msg = "you clicked different floor!";

      } else {

        result.msg = "wrong state transition : " + previousMsg + " to addnewcellboundary.";

      }

    }
    else if (broker.isPublishable('addnewtransition')) {

      var isFirstClick = (window.tmpObj.floor == null);
      var isSameFloor = (data.currentTarget.attrs.id == window.tmpObj.floor);

      if(isSameFloor || isFirstClick){

        broker.publish(new Message('addnewtransition', {
          'floor': data.currentTarget.attrs.id
        }));

        result.result = true;
        result.msg = 'addnewtransition';

      } else {

        result.msg = 'Transition need states which existed same floor but you select wrong state.';

      }

      if(window.tmpObj.dots.length == 3){

        broker.publish(new Message('end-addnewtransition', {
          floor: data.currentTarget.attrs.id,
          id: window.conditions.pre_transition+(++window.conditions.LAST_TRANSITION_ID_NUM)
        }));

        result.result = true;
        result.msg = null;
      }

    }
    else if (broker.isPublishable('addnewstair')) {

      var isFirstClick = (window.tmpObj.floor == null);
      var isSameFloor = (data.currentTarget.attrs.id == window.tmpObj.floor);

      if(isFirstClick || !isSameFloor){

        broker.publish(new Message('addnewstair', {
          'floor': data.currentTarget.attrs.id
        }));

        result.result = true;
        result.msg = 'addnewstair';

      } else if( isSameFloor ) {

        result.msg = 'You should select state which on the different floor from the floor that the state you selected before.';

      } else {

        result.msg = "wrong state transition : " + previousMsg + " to addnewstair.";

      }

      if(window.tmpObj.dots.length == 2){

        broker.publish(new Message('end-addnewstair', {
          floor: window.tmpObj.floor,
          id: window.conditions.pre_transition+(++window.conditions.LAST_TRANSITION_ID_NUM)
        }));

        result.result = true;
        result.msg = null;
      }

    }
    else {

      result.msg = "no match function.";

    }

    return result;

  }

  /**
   * @memberof DrawEventHandler
   */
  DrawEventHandler.prototype.cancelDraw = function(broker, previousMsg) {

    var result = new Result();

    switch (previousMsg) {
      case 'addnewcell':
        if (broker.isPublishable('cancel-addnewcell')) {
          broker.publish(new Message('cancel-addnewcell', {
            'floor': window.tmpObj.floor
          }));

          result.result = true;
          result.msg = null;
        }
        break;
      case 'addnewcellboundary':
        if (broker.isPublishable('cancel-addnewcellboundary')) {

          broker.publish(new Message('cancel-addnewcellboundary', {
            'floor': window.tmpObj.floor
          }));

          result.result = true;
          result.msg = null;

        }
        break;
      case 'addnewstate':
        if (broker.isPublishable('cancel-addnewstate')) {

          broker.publish(new Message('cancel-addnewstate', {
            'floor': window.tmpObj.floor
          }));

          result.result = true;
          result.msg = null;

        }

        break;
      case 'addnewtransition':
        if(broker.isPublishable('cancel-addnewtransition')){

          broker.publish(new Message('cancel-addnewtransition', {
            'floor': window.tmpObj.floor
          }));

          result.result = true;
          result.msg = null;

        }
        break;
      default:
        result.msg = "no match function.";
    }

    return result;
  }

  /**
   * @memberof DrawEventHandler
   */
  DrawEventHandler.prototype.finishDraw = function(broker, previousMsg) {

    var result = new Result();

    if (broker.isPublishable('end-addnewcell')) {

      if (window.tmpObj.isEmpty()) {

        broker.publish(new Message('end-addnewcell', {
          'isEmpty': true
        }));

      } else {

        broker.publish(new Message('end-addnewcell', {
          'id': window.conditions.pre_cell + (++window.conditions.LAST_CELL_ID_NUM),
          'floor': window.tmpObj.floor
        }));

      }

      result.result = true;
      result.msg = null;

    } else if (broker.isPublishable('end-addnewcellboundary')) {

      if (window.tmpObj.isEmpty()) {

        broker.publish(new Message('end-addnewcellboundary', {
          'isEmpty': true
        }));

      } else {

        broker.publish(new Message('end-addnewcellboundary', {
          'id': window.conditions.pre_cellBoundary + (++window.conditions.LAST_CELLBOUNDARY_ID_NUM),
          'floor': window.tmpObj.floor
        }));

      }

      result.result = true;
      result.msg = null;

    } else if (broker.isPublishable('end-addnewstate')) {

    } else if (broker.isPublishable('end-addnewtransition')) {

      if (window.tmpObj.isEmpty()){

        broker.publish(new Message('end-addnewcellboundary', {
          'isEmpty': true
        }));

      } else {

        broker.publish(new Message('end-addnewtransition', {
          'id': window.conditions.pre_transition + (++window.conditions.LAST_TRANSITION_ID_NUM),
          'floor': window.tmpObj.floor
        }));

      }

      result.result = true;
      result.msg = null;

    } else {
      result.mgs = "no match function."
    }

    return result;

  }

  /**
   * @memberof DrawEventHandler
   */
  DrawEventHandler.prototype.stageMoveMouse = function(broker, previousMsg, data) {

    var result = new Result();
    var rect = window.storage.canvasContainer.stages[data.currentTarget.attrs.id].stage.content.getBoundingClientRect();

    if (broker.isPublishable('snapping')) {

      var reqObj = {
        floor: data.currentTarget.attrs.id,
        point: {
          x: data.evt.clientX - rect.left,
          y: data.evt.clientY - rect.top
        }
      };

      broker.publish(new Message('snapping', reqObj));

      broker.publish(new Message('movetooltip', reqObj));

      result.result = true;
      result.msg = 'snapping';

    } else if (broker.isPublishable('modifypoint')) {

      var reqObj = {
        floor: data.currentTarget.attrs.id,
        point: {
          x: data.evt.clientX - rect.left,
          y: data.evt.clientY - rect.top
        }
      };

      broker.publish(new Message('snapping', reqObj));

      broker.publish(new Message('modifypoint', {
        floor: data.currentTarget.attrs.id
      }));

      result.result = true;
      result.msg = 'modifypoint';

    } else {

      result.msg = "no match function.";

    }


    return result;
  }

  /**
   * @memberof DrawEventHandler
   */
  DrawEventHandler.prototype.clickCellBoundaryBtn = function(broker, previousMsg) {

    var result = new Result();

    var isFloorExist = (window.storage.propertyContainer.floorProperties.length != 0);
    var isCellExist = (window.storage.propertyContainer.cellProperties.length != 0);

    if (!isFloorExist) {
      result.msg = "There is no floor ...";
    } else if (!isCellExist) {
      result.msg = "There is no cell ...";
    } else if (broker.isPublishable('start-addnewcellboundary')) {

      broker.publish(new Message('start-addnewcellboundary', null));

      result = {
        'result': true,
        'msg': 'start-addnewcellboundary'
      };

    } else if (broker.isPublishable('end-addnewcellboundary')) {

      if (window.tmpObj.isEmpty()) {

        broker.publish(new Message('end-addnewcellboundary', {
          'isEmpty': true
        }));

      } else {

        broker.publish(new Message('end-addnewcellboundary', {
          'id': window.conditions.pre_cellBoundary + (++window.conditions.LAST_CELLBOUNDARY_ID_NUM),
          'floor': window.tmpObj.floor
        }));

      }

      result.result = true;
      result.msg = null;

    } else {
      result.msg = "wrong transition : " + previousMsg + " to start-addnewcellboundary, end-addnewcellboundary.";
    }

    return result;

  }

  /**
  * @memberof DrawEventHandler
  */
  DrawEventHandler.prototype.clickStateBtn = function(broker, previousMsg){

    var result = new Result();

    log.info('call click state-btn');

    return result;

  }

  /**
  * @memberof DrawEventHandler
  */
  DrawEventHandler.prototype.clickTransitionBtn = function(broker, previousMsg){

    var result = new Result();
    var isFloorExist = (window.storage.propertyContainer.floorProperties.length != 0);
    var isStateExist = (window.storage.propertyContainer.stateProperties.length >= 2);

    if (!isFloorExist) {

      result.msg = "There is no floor ...";

    } else if (!isStateExist){

      result.msg = "There is too few state ...";

    } else if(broker.isPublishable('start-addnewtransition')){

      broker.publish(new Message('start-addnewtransition', null));

      result.result = true;
      result.msg = 'start-addnewtransition';

    } else if(broker.isPublishable('end-addnewtransition')){

      broker.publish(new Message('start-addnewtransition', null));

      result.result = true;
      result.msg = null;

    } else {
      result.msg = "wrong transition : " + previousMsg + " to start-addnewtransition, end-addnewtransition.";
    }

    return result;

  }

  /**
  * @memberof DrawEventHandler
  */
  DrawEventHandler.prototype.clickStairBtn = function(broker, previousMsg){

    var result = new Result();
    var isFloorExist = (window.storage.propertyContainer.floorProperties.length >= 2);
    var isStateExist = (window.storage.propertyContainer.stateProperties.length >= 2);

    if (!isFloorExist) {

      result.msg = "There is too few floor ...";

    } else if (!isStateExist){

      result.msg = "There is too few state ...";

    } else if(broker.isPublishable('start-addnewstair')){

      broker.publish(new Message('start-addnewstair', null));

      result.result = true;
      result.msg = 'start-addnewstair';

    } else if(broker.isPublishable('end-addnewstair')){

      broker.publish(new Message('start-addnewstair', null));

      result.result = true;
      result.msg = null;

    } else {

      result.msg = "wrong transition : " + previousMsg + " to start-addnewstair, end-addnewstair.";

    }

    return result;

  }

  /**
  * @memberof EventHandler
  */
  DrawEventHandler.prototype.lineDbclick = function(broker, previous, data){
    log.info('dbclick : ', data);

    return new Result();
  }

  return DrawEventHandler;
});
