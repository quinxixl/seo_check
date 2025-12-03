import React from "react";
import "./Header.scss";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice.js";

const Header = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">Сервис аудита</Link>
        <nav className="header__nav">
          <Link to="/">Главная</Link>
          {user && <Link to="/dashboard">Кабинет</Link>}
          <Link to="/pricing">Тарифы</Link>
          {user ? (
            <button className="header__logout" onClick={handleLogout}>
              Выйти
            </button>
          ) : (
            <Link to="/login" className="header__login">Войти</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
