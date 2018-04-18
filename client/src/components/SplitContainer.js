import React from "react";
import SplitPane from "react-split-pane";

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
          <div />
          <div />
        </SplitPane>
        <div />
      </SplitPane>
    );
  }
}

export default SplitContainer;
