/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import * as React from 'react';

import { Classes, Icon, ITreeNode, Tooltip, Tree } from '@blueprintjs/core';


class TreeView extends React.Component {
    state = { nodes: INITIAL_STATE };

    // override @PureRender because nodes are not a primitive type and therefore aren't included in
    // shallow prop comparison
    shouldComponentUpdate() {
        return true;
    }

    render() {
        return (
            <Tree
                contents={this.state.nodes}
                onNodeClick={this.handleNodeClick}
                onNodeCollapse={this.handleNodeCollapse}
                onNodeExpand={this.handleNodeExpand}
                className={Classes.ELEVATION_0}
            />
        );
    }

     handleNodeClick = (nodeData: ITreeNode, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
        const originallySelected = nodeData.isSelected;
        if (!e.shiftKey) {
            this.forEachNode(this.state.nodes, n => (n.isSelected = false));
        }
        nodeData.isSelected = originallySelected == null ? true : !originallySelected;
        this.setState(this.state);
    };

     handleNodeCollapse = (nodeData: ITreeNode) => {
        nodeData.isExpanded = false;
        this.setState(this.state);
    };

     handleNodeExpand = (nodeData: ITreeNode) => {
        nodeData.isExpanded = true;
        this.setState(this.state);
    };

     forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
        if (nodes == null) {
            return;
        }

        for (const node of nodes) {
            callback(node);
            this.forEachNode(node.childNodes, callback);
        }
    }
}

/* tslint:disable:object-literal-sort-keys so childNodes can come last */
const INITIAL_STATE: ITreeNode[] = [
  {
      id: 'F1',
      hasCaret: true,
      label: "F1",
      childNodes: [
        {
            id: 'F1-Cell',
            label: 'Cell',
            hasCaret: true,
            childNodes:[
              {id: 'C1', label: 'C1', icon: 'widget'},
              {id: 'C2', label: 'C2', icon: 'widget'},
              {id: 'C3', label: 'C3', icon: 'widget'}
            ]
        },
        {
            id: 'F1-CellSpaceBoundary',
            label: 'CellSpaceBoundary',
            hasCaret: true,
            childNodes:[
              {id: 'B1', label: 'B1', icon: 'symbol-square'},
              {id: 'B2', label: 'B2', icon: 'symbol-square'},
              {id: 'B3', label: 'B3', icon: 'symbol-square'}
            ]
        },
        {
            id: 'F1-State',
            label: 'State',
            hasCaret: true,
            childNodes:[
              {id: 'S1', label: 'S1', icon: 'circle'},
              {id: 'S2', label: 'S2', icon: 'circle'},
              {id: 'S3', label: 'S3', icon: 'circle'}
            ]
        },
        {
            id: 'F1-Transition',
            label: 'Transition',
            hasCaret: true,
            childNodes:[
              {id: 'T1', label: 'T1', icon: 'minus'},
              {id: 'T2', label: 'T2', icon: 'minus'},
              {id: 'T3', label: 'T3', icon: 'minus'}
            ]
        },
      ]
  },
  {
      id: 'F2',
      label: "F2",
      childNodes: [
          {
              id: 'F2-Cell',
              label: 'Cell',
              hasCaret: true,
              childNodes:[]
          },
          {
              id: 'F2-CellSpaceBoundary',
              label: 'CellSpaceBoundary',
              hasCaret: true,
              childNodes:[]
          },
          {
              id: 'F2-State',
              label: 'State',
              hasCaret: true,
              childNodes:[]
          },
          {
              id: 'F2-Transition',
              label: 'Transition',
              hasCaret: true,
              childNodes:[]
          }
      ],
  },
  {
      id: 'F3',
      label: "F3",
      childNodes: [
          {
              id: 'F3-Cell',
              label: 'Cell',
              hasCaret: true,
              childNodes:[]
          },
          {
              id: 'F3-CellSpaceBoundary',
              label: 'CellSpaceBoundary',
              hasCaret: true,
              childNodes:[]
          },
          {
              id: 'F3-State',
              label: 'State',
              hasCaret: true,
              childNodes:[]
          },
          {
              id: 'F3-Transition',
              label: 'Transition',
              hasCaret: true,
              childNodes:[]
          }
      ],
  }
];

export default TreeView;
