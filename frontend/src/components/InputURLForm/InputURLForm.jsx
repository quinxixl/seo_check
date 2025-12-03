import React, { useState } from "react";
import "./InputURLForm.scss";
import { validateUrl } from "../../features/siteAnalyzer/utils.js";

const InputURLForm = ({ onSubmit, loading, error }) => {
  const [url, setUrl] = useState("");
  const [localError, setLocalError] = useState("");

  const normalizeUrl = (inputUrl) => {
    let normalized = inputUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    return normalized;
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLocalError("");
    
    if (!url.trim()) {
      setLocalError("Пожалуйста, введите URL сайта");
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    
    if (!validateUrl(normalizedUrl)) {
      setLocalError("Введите корректный URL (например: example.com или https://example.com)");
      return;
    }

    onSubmit(normalizedUrl);
  };

  return (
    <div className="input-url-form-wrapper">
      <form className="input-url-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Введите адрес сайта (например: example.com)"
          value={url}
          aria-label="Адрес сайта"
          onChange={(e) => {
            setUrl(e.target.value);
            setLocalError("");
          }}
          disabled={loading}
          autoFocus
          className={localError || error ? "input-error" : ""}
        />
        <button type="submit" disabled={loading || !url.trim()}>
          {loading ? "Проверка и анализ..." : "Проверить"}
        </button>
      </form>
      {(localError || error) && (
        <div className="input-url-form__error">
          {localError || error}
        </div>
      )}
    </div>
  );
};

export default InputURLForm;
