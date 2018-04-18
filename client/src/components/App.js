import React, { Component } from 'react';
import Menubar from 'components/Menubar';
import SplitContainer from 'components/SplitContainer';
import Toolbar from 'components/Toolbar';

class App extends Component {
  state = {
    response: ''
  };


  render() {
    return (
      <div className="App">
        <Menubar/>
        <Toolbar/>
        <SplitContainer/>
      </div>
    );
  }
}

export default App;
