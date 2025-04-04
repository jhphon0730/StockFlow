export interface WebSocketInformation {
	roomID: string;
	connectedClientCount: number;
}

// 대시보드에 구성되는 데이터의 반환 값
export interface DashboardInfo {

}
/*
{
    "data": {
        "inventory": {
            "comparison": 100,
            "count": 2
        },
        "product": {
            "comparison": 80,
            "count": 9
        },
        "recent_transactions": [],
        "warehouse": {
            "comparison": 0,
            "count": 2
        }
    }
}
*/
