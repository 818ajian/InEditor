import React from 'react';
import {
  Nav,
  Navbar,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,

} from 'reactstrap';

class Menubar extends React.Component {
  render() {
    return (
      <Navbar className="menubar">
        <Nav>
          <NavItem>
            <UncontrolledDropdown>
              <DropdownToggle nav caret> PROJECT </DropdownToggle>
              <DropdownMenu>
                <DropdownItem> New </DropdownItem>
                <DropdownItem> Load </DropdownItem>
                <DropdownItem> Save </DropdownItem>
                <DropdownItem> Save As.. </DropdownItem>
                <DropdownItem divider />
                <DropdownItem> Import </DropdownItem>
                <DropdownItem> Export(.gml) </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </NavItem>
          <NavItem>
            <UncontrolledDropdown>
              <DropdownToggle nav caret> SETTING </DropdownToggle>
              <DropdownMenu>
                <DropdownItem> DUMMY </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </NavItem>
          <NavItem>
            <UncontrolledDropdown>
              <DropdownToggle caret nav> HELP </DropdownToggle>
              <DropdownMenu>
                <DropdownItem> DUMMY </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </NavItem>
        </Nav>
      </Navbar>
    );
  }
}

export default Menubar;
