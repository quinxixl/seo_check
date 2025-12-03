import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../features/auth/authSlice.js";
import "./Login.scss";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleSubmit = e => {
    e.preventDefault();
    setFormError("");

    if (!username.trim()) {
      setFormError("Пожалуйста, введите имя пользователя");
      return;
    }

    if (!isLogin) {
      if (!email.trim()) {
        setFormError("Пожалуйста, введите email");
        return;
      }

      if (!isValidEmail(email)) {
        setFormError("Введите корректный email (например: name@mail.com)");
        return;
      }

      if (!password.trim()) {
        setFormError("Пожалуйста, введите пароль");
        return;
      }

      if (password.length < 6) {
        setFormError("Пароль должен содержать минимум 6 символов");
        return;
      }
    } else {
      if (!password.trim()) {
        setFormError("Пожалуйста, введите пароль");
        return;
      }
    }

    dispatch(login({ 
      name: username.trim(),
      email: email.trim() || null
    }));
    navigate("/dashboard");
  };

  return (
    <div className="container login-page">
      <div className="login-container">
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${isLogin ? "login-tab--active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Вход
          </button>
          <button
            type="button"
            className={`login-tab ${!isLogin ? "login-tab--active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Регистрация
          </button>
        </div>

        <h2>{isLogin ? "Вход в аккаунт" : "Создать аккаунт"}</h2>
        <p className="login-subtitle">
          {isLogin 
            ? "Войдите в свой аккаунт для доступа к истории анализов"
            : "Создайте аккаунт для сохранения истории анализов"
          }
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-username">Имя пользователя</label>
            <input
              id="login-username"
              type="text"
              placeholder="Ваше имя"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <input
              id="login-password"
              type="password"
              placeholder={isLogin ? "Ваш пароль" : "Минимум 6 символов"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={isLogin ? 1 : 6}
            />
          </div>

          <button type="submit" className="login-submit">
            {isLogin ? "Войти" : "Создать аккаунт"}
          </button>
        </form>
        {formError && (
          <div className="login-error" role="alert">
            {formError}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
