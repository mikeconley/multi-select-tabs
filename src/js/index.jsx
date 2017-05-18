import React from "react";
import { render } from "react-dom";

import Sidebar from "components/sidebar";

addEventListener("load", async () => {
  const windowInfo = await browser.windows.getCurrent();
  render(
    <Sidebar windowId={windowInfo.id} />,
    document.getElementById("container"),
  );
});
