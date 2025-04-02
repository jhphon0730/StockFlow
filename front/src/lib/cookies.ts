import Cookies from "js-cookie";

export const setCookie = (name: string, value: string, days: number) => {
  Cookies.set(name, value, { expires: days, path: "/" });
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string) => {
  Cookies.remove(name, { path: "/" });
};
