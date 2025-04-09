import Cookies from "js-cookie";

export const setCookie = (name: string, value: string, hour?: string) => {
	if (hour) {
		Cookies.set(name, value, { expires: Number(hour) / 24, path: "/" }); // // n / 24 = 1 hour
		return;
	}
	Cookies.set(name, value, { expires: 1 / 24, path: "/" }); // default 1 hour
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string) => {
  Cookies.remove(name, { path: "/" });
};
