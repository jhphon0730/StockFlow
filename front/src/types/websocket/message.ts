export type Message = {
	action: "leave" | "update";
	roomID: string;
	clientID: string;
	data?: any;
}
