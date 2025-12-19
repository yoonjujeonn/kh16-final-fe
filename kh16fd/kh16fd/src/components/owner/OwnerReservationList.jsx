import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react"
import { accessTokenState } from "../../utils/jotai";
import axios from "axios";
import { toast } from "react-toastify";
import Jumbotron from "../templates/Jumbotron";
import { ScaleLoader } from "react-spinners";


export default function OwnerReservationList() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessToken] = useAtom(accessTokenState);

    const loadData = useCallback(async () => {
        if (!accessToken) return;
        try {
            const response = await axios.get("/reservation/ownerList", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setList(response.data);
        } catch (error) {
            console.error("목록 로드 실패", error);
            toast.error("예약 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateStatus = async (reservationId, status) => {
        try {
            await axios.patch(`/reservation/status/${reservationId}`,
                { reservationStatus: status },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            toast.success(`${status} 처리되었습니다.`);
            loadData();
        } catch (error) {
            toast.error("상태 변경에 실패했습니다.");
        }
    };
    if (loading) return <div className="text-center my-5"><ScaleLoader color="#7eb6ac" /></div>;

    // render
    return (<>
        <h3>매장 예약 관리</h3>
        {list.length === 0 ? (
            <div className="text-center py-5 border rounded bg-light">데이터가 없습니다.</div>
        ) : (
            list.map(item => (
                <div key={item.reservationId} className="card mb-3 shadow-sm">
                    <div className="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bold">{item.restaurantName}</h5>
                            <p className="mb-1">예약자: {item.reservationMember}</p>
                            <p className="mb-0">시간: {item.reservationTime}</p>
                            <span className={`badge mt-2 ${item.reservationStatus === '예약완료' ? 'bg-success' : 'bg-secondary'}`}>
                                {item.reservationStatus}
                            </span>
                        </div>
                        {/* 버튼 영역 */}
                        <div className="text-end">
                            {item.reservationStatus === '예약완료' && (
                                <div className="btn-group">
                                    <button className="btn btn-primary" onClick={() => updateStatus(item.reservationId, '방문완료')}>
                                        방문완료
                                    </button>
                                    <button className="btn btn-dark" onClick={() => updateStatus(item.reservationId, '노쇼')}>
                                        노쇼
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))
        )}
    </>)
}