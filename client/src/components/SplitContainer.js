import React from 'react';
import SplitPane from 'react-split-pane';
import TreeView from 'components/TreeView';
import { Container } from 'reactstrap';

console.log(new TreeView());

class SplitContainer extends React.Component {
  render() {
    return (
      <SplitPane
        split="vertical"
        minSize='0rem'
        defaultSize='17rem'
        className="splitContainer"
        style={{ height: "auto" }}
      >
        <SplitPane split="horizontal" defaultSize="60%">
          <Container className="TreeViewContainer">
            <TreeView />
          </Container>

          <div />
        </SplitPane>
        <div />
      </SplitPane>
    );
  }
}

export default SplitContainer;
