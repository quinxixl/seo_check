import React from "react";
import "./Footer.scss";

const Footer = () => (
  <footer className="footer">
    <p>© {new Date().getFullYear()} Сервис аудита сайтов</p>
  </footer>
);

export default Footer;
