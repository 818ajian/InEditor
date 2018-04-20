/** import assets from icon folder */
import floor_d from '../assets/icon/floor_d.png';
import floor_a from '../assets/icon/floor_a.png';
import cell_d from '../assets/icon/cell_d.png';
import cell_a from '../assets/icon/cell_a.png';
import cellboundary_d from '../assets/icon/cellboundary_d.png';
import cellboundary_a from '../assets/icon/cellboundary_a.png';
import state_d from '../assets/icon/state_d.png';
import state_a from '../assets/icon/state_a.png';
import transition_d from '../assets/icon/transition_d.png';
import transition_a from '../assets/icon/transition_a.png';
import stair_d from '../assets/icon/stair_d.png';
import stair_a from '../assets/icon/stair_a.png';
import go_viewer from '../assets/icon/go_viewer.png';

/** import assets from tree-icon folder */
import cell from '../assets/tree-icon/cell.png';
import cellboundary from '../assets/tree-icon/cellboundary.png';
import state from '../assets/tree-icon/state.png';
import transition from '../assets/tree-icon/transition.png';
import floor from '../assets/tree-icon/floor.png';

export default {

  icon:{

    deactivatedFloor : floor_d,
    deactivatedCell : cell_d,
    deactivatedCellSpaceBoundary : cellboundary_d,
    deactivatedState : state_d,
    deactivatedTransition : transition_d,
    deactivatedStair : stair_d,

    viewer : go_viewer,

    activatedFloor : floor_a,
    activatedCell : cell_a,
    activatedCellSpaceBoundary : cellboundary_a,
    activatedState : state_a,
    activatedTransition : transition_a,
    activatedStair : stair_a,

  },

  treeIcon:{

    floor: floor,
    cell: cell,
    cellSpaceBoundry: cellboundary,
    state: state,
    transition: transition

  }

};
