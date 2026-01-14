/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
const createRequest = (options = {}) => {
  const { url, method = "GET", data, callback } = options;

  const xhr = new XMLHttpRequest();
  xhr.responseType = "json";

  let finalUrl = url;
  let body = null;

  if (method === "GET" && data) {
    const params = new URLSearchParams(data).toString();
    finalUrl += `?${params}`;
  }

  if (method !== "GET" && data) {
    body = new FormData();
    for (const key in data) {
      body.append(key, data[key]);
    }
  }

  xhr.open(method, finalUrl);

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      callback?.(null, xhr.response);
    } else {
      callback?.(new Error(`HTTP error: ${xhr.status}`));
    }
  };

  xhr.onerror = () => {
    callback?.(new Error("Network error"));
  };
  xhr.send(body);
};
