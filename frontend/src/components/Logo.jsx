import React from "react";
import logoSrc from "../assets/logo.svg";
import "../styles/components/Logo.css";

const Logo = ({ showText = true, className = "" }) => {
  return (
    <span className={`lnf-logo ${className}`.trim()}>
      <img src={logoSrc} alt="" aria-hidden="true" className="lnf-logo-icon" />
      {showText && <span className="lnf-logo-text">LostNFound</span>}
    </span>
  );
};

export default Logo;
