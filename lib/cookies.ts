import Cookies from 'js-cookie';

export const setCookie = (name: string, value: any, options = {}) => {
  Cookies.set(name, JSON.stringify(value), {
    ...options,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict'
  });
};

export const getCookie = (name: string) => {
  const cookieValue = Cookies.get(name);
  if (cookieValue) {
    try {
      return JSON.parse(cookieValue);
    } catch {
      return cookieValue;
    }
  }
  return null;
};

export const removeCookie = (name: string) => {
  Cookies.remove(name);
};
