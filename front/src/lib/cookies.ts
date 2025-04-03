import Cookies from "js-cookie";

export const setCookie = (name: string, value: string) => {
  Cookies.set(name, value, { expires: 1 / 24, path: "/" }); // 1시간(1/24일)
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string) => {
  Cookies.remove(name, { path: "/" });
};
