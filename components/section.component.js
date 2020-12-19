import React from "react";

export default function Section({style, children}) {
  return (
    <h5 className="mt-2 mb-2 ml-5 mr-5" style={{
      color: style ? `var(--${style})` : "inherit",
      borderBottomColor: style ? `var(--${style})` : "inherit",
      borderBottomWidth: "thin",
      borderBottomStyle: "solid"
    }}>{children}</h5>
  )
}