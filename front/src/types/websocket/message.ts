export type Message = {
	action: "leave" | "update" | "join";
	roomID: string;
	clientID: string;
	data?: any;
}
