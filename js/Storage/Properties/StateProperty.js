define([],function() {
  'use strict';

  function StateProperty() {
    this.id;
    this.name;
    this.duality; // CellSpace
    this.connects = [];
  }

  return StateProperty;
});