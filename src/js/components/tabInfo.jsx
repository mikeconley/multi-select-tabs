import PropTypes from "prop-types";
import React from "react";

/**
 * Render information about a tab.
 *
 * This will render the controls for selecting that tab and render the metadata
 * for the tab as well.
 */
const TabInfo = function TabInfo(props) {
  const { active, onClick, onSelectionChanged, tabInfo } = props;
  const { favIconUrl, filtered, id, selected, title } = tabInfo;

  const classes = [];

  if (active) {
    classes.push("active");
  }

  if (filtered) {
    classes.push("filtered");
  }

  return (
    <li className={classes.join(" ")} onClick={e => onClick(e, id)}>
      <label>
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelectionChanged(e, id)}
        />
        <img className="favicon" src={favIconUrl} />
        {title}
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
    filtered: PropTypes.bool.isRequired,
    id: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export default TabInfo;
