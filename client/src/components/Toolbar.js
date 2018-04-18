import React from 'react';
// import floor_d from '../assets/icon/floor_d.png';
import assets from 'components/Assets';

import {
  Nav,
  Navbar,
  NavItem
} from 'reactstrap';

class Toolbar extends React.Component {

  render() {
    return (
      <Navbar className="toolbar">
        <Nav>
          <NavItem >
            <img src={assets.icon['deactivatedFloor']} alt='floor btn'/>
          </NavItem>
          <NavItem >
            <img src={assets.icon['deactivatedCell']} alt='cell btn'/>
          </NavItem>
          <NavItem >
            <img src={assets.icon['deactivatedCellSpaceBoundary']} alt='cellSpaceBoundry btn'/>
          </NavItem>
          <NavItem >
            <img src={assets.icon['deactivatedState']} alt='state btn'/>
          </NavItem>
          <NavItem >
            <img src={assets.icon['deactivatedTransition']} alt='transition btn'/>
          </NavItem>
          <NavItem >
            <img src={assets.icon['deactivatedStair']} alt='stair btn'/>
          </NavItem>
          <NavItem >
            <img src={assets.icon['viewer']} alt='viewer btn'/>
          </NavItem>
        </Nav>
      </Navbar>
    );
  }
}

export default Toolbar;
