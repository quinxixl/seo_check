import React, { useState, useMemo } from "react";
import "./Payment.scss";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPlan, unlockPlan } from "../../features/payments/paymentSlice.js";

const PLAN_DATA = {
  free: {
    id: "free",
    name: "Start",
    price: "0₽",
    description: "Попробовать сервис и увидеть базовые проблемы сайта.",
  },
  pro: {
    id: "pro",
    name: "PRO",
    price: "500₽ / мес",
    description: "Полноценная диагностика + рекомендации от ИИ.",
  },
  business: {
    id: "business",
    name: "Business",
    price: "2000₽ / мес",
    description: "Максимум мощности и автоматизации для агентств.",
  },
};

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "pro";

  const plan = useMemo(() => {
    return PLAN_DATA[planId] || PLAN_DATA.pro;
  }, [planId]);

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 19);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
    setError("");
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 3) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    setExpiry(value);
    setError("");
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvc(value);
    setError("");
  };

  const validate = () => {
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 16 || digits.length > 19) {
      return "Введите корректный номер карты (16–19 цифр).";
    }
    if (!cardHolder.trim() || cardHolder.trim().length < 3) {
      return "Введите имя владельца карты.";
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return "Введите срок действия в формате ММ/ГГ.";
    }
    const [mm, yy] = expiry.split("/").map(Number);
    if (mm < 1 || mm > 12) {
      return "Введите корректный месяц в сроке действия карты.";
    }
    if (cvc.length < 3) {
      return "Введите корректный CVC-код.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);

    // Имитируем обращение к платёжному шлюзу
    setTimeout(() => {
      setProcessing(false);
      dispatch(unlockPlan(plan.id));
      dispatch(setPlan(plan.id));
      alert(`Оплата тарифа «${plan.name}» успешно проведена (демо-режим). Тариф активирован!`);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="container payment-page">
      <div className="payment-layout">
        <div className="payment-summary">
          <h2>Оплата тарифа</h2>
          <div className="payment-plan-card">
            <div className="payment-plan-card__name">{plan.name}</div>
            <div className="payment-plan-card__price">{plan.price}</div>
            <p className="payment-plan-card__description">{plan.description}</p>
            <ul className="payment-plan-card__list">
              <li>Оплата российскими картами (МИР, Visa, Mastercard).</li>
              <li>Подписка без автопродления в демо-версии.</li>
              <li>Вы всегда сможете сменить тариф в кабинете.</li>
            </ul>
          </div>
          <p className="payment-note">
            Внимание: это демо-режим. Реальное списание средств не производится, но логика оплаты
            и активации тарифа повторяет поведение боевого сервиса.
          </p>
        </div>
        <div className="payment-form-wrapper">
          <form className="payment-form" onSubmit={handleSubmit} noValidate>
            <h3>Данные карты</h3>
            <div className="form-group">
              <label htmlFor="card-number">Номер карты</label>
              <input
                id="card-number"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={handleCardNumberChange}
                disabled={processing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="card-holder">Владелец карты</label>
              <input
                id="card-holder"
                type="text"
                autoComplete="cc-name"
                placeholder="ИМЯ ФАМИЛИЯ"
                value={cardHolder}
                onChange={(e) => {
                  setCardHolder(e.target.value.toUpperCase());
                  setError("");
                }}
                disabled={processing}
              />
            </div>
            <div className="payment-form__row">
              <div className="form-group">
                <label htmlFor="expiry">Срок действия</label>
                <input
                  id="expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/ГГ"
                  value={expiry}
                  onChange={handleExpiryChange}
                  disabled={processing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvc">CVC</label>
                <input
                  id="cvc"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="CVC"
                  value={cvc}
                  onChange={handleCvcChange}
                  disabled={processing}
                />
              </div>
            </div>
            {error && (
              <div className="payment-error" role="alert">
                {error}
              </div>
            )}
            <button type="submit" className="payment-submit" disabled={processing}>
              {processing ? "Обработка платежа..." : `Оплатить тариф «${plan.name}»`}
            </button>
            <p className="payment-secure">
              Данные карты передаются по защищённому соединению и не сохраняются на сервере сервиса
              аудита (демо-описание реального процесса).
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;


