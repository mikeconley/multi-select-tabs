import PropTypes from "prop-types";
import React from "react";

/**
 * Render information about a tab.
 *
 * This will render the controls for selecting that tab and render the metadata
 * for the tab as well.
 */
const TabInfo = function TabInfo(props) {
  const {
    active,
    onClick,
    onSelectionChanged,
    tabInfo,
    pinned,
  } = props;
  const { favIconUrl, id, selected, title, discarded } = tabInfo;

  const activeClassName = active ? "active" : "";
  const pinnedClassName = pinned ? "pinned" : "";
  const discardedClassName = discarded ? "discarded" : "";
  const className = `${activeClassName} ${pinnedClassName} ${discardedClassName}`;

  return (
    <li className={className} onClick={e => onClick(e, id)}>
      <label>
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelectionChanged(e, id)}
        />
        <img className="favicon" src={favIconUrl} />
        <span>{title}</span>
      </label>
    </li>
  );
};

TabInfo.propTypes = {
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onSelectionChanged: PropTypes.func.isRequired,
  tabInfo: PropTypes.shape({
    favIconUrl: PropTypes.string,
    id: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export default TabInfo;
