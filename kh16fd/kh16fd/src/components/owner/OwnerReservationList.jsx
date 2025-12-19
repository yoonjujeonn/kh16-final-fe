import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react"
import { accessTokenState } from "../../utils/jotai";
import axios from "axios";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";


export default function OwnerReservationList() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessToken] = useAtom(accessTokenState);

    // 필터 탭
    const [activeTab, setActiveTab] = useState("전체");
    const [selectedRestaurant, setSelectedRestaurant] = useState("전체");

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

    // 오늘 날짜 
    const todayStr = new Date().toISOString().split('T')[0];

    // 자영업자의 식당 목록
    const restaurantOptions = useMemo(() => {
        return ["전체", ...new Set(list.map(item => item.restaurantName))];
    }, [list]);

    // 필터링 된 리스트 계산
    const filteredList = useMemo(() => {
        return list.filter(item => {
            const itemDate = item.reservationTime.split(' ')[0];

            let matchStatus = false;
            if (activeTab === "전체") matchStatus = true;
            else if (activeTab === "오늘") matchStatus = (itemDate === todayStr && item.reservationStatus === '예약완료');
            else matchStatus = (item.reservationStatus === activeTab);

            const matchRestaurant = (selectedRestaurant === "전체" || item.restaurantName === selectedRestaurant);

            return matchStatus && matchRestaurant;
        });
    }, [list, activeTab, selectedRestaurant, todayStr]);

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

        {/* 식당 필터 */}
        <div className="mb-4 p-3 bg-light rounded border">
            <label className="form-label small fw-bold text-muted">운영 식당 필터</label>
            <select className="form-select" value={selectedRestaurant} onChange={e => setSelectedRestaurant(e.target.value)}>
                {restaurantOptions.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
        </div>

        {/* 상태 구분 탭 */}
        <ul className="nav nav-pills mb-4 p-2 rounded shadow-sm border">
            {["전체", "오늘", "예약완료", "방문완료", "노쇼"].map(tab => (
                <li className="nav-item" key={tab}>
                    <button
                        className={`nav-link ${activeTab === tab ? "active" : "text-dark"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                </li>
            ))}
        </ul>
        {filteredList.length === 0 ? (
            <div className="text-center py-5 border rounded bg-light">해당내역이 없습니다.</div>
        ) : (
            filteredList.map(item => {
                const isToday = item.reservationTime.split(' ')[0] === todayStr;
                const isPast = item.reservationTime.split(' ')[0] < todayStr;
                return (
                    <div key={item.reservationId} className="card mb-3 shadow-sm">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold">{item.restaurantName}</h5>
                                <p className="mb-1">예약자: {item.reservationMember}</p>
                                <p className="mb-0">시간: {item.reservationTime}</p>

                                {isToday && item.reservationStatus === '예약완료' && (
                                    <span className="badge bg-warning text-dark me-2">오늘 방문예정</span>
                                )}

                                <span className={`badge mt-2 ${item.reservationStatus === '예약완료' ? 'bg-success' : 'bg-secondary'}`}>
                                    {item.reservationStatus}
                                </span>
                            </div>
                            {/* 버튼 영역 */}
                            <div className="text-end">
                                {item.reservationStatus === '예약완료' && (
                                    <>
                                        {isToday ? (
                                            <div className="btn-group">
                                                <button className="btn btn-primary" onClick={() => updateStatus(item.reservationId, '방문완료')}
                                                    disabled={!isToday}>
                                                    방문완료
                                                </button>
                                                <button className="btn btn-dark" onClick={() => updateStatus(item.reservationId, '노쇼')}
                                                    disabled={!isToday}>
                                                    노쇼
                                                </button>
                                            </div>
                                        ) : isPast ? (
                                            <span className="text-danger fw-bold small">처리 기한 만료</span>

                                        ) : (
                                            <span className="text-muted small">방문예정</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })
        )}
    </>)
}