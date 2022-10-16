import React from "react";

function Layout({ children }) {
  return (
    <>
      <h2 className="header">react-use review</h2>
      <main className="layout">{children}</main>
    </>
  );
}

export default Layout;
