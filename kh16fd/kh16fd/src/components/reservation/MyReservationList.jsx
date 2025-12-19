import { useCallback, useEffect, useMemo, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import { FaCalendar, FaUser } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { differenceInDays, format, parse, startOfDay } from "date-fns";


export default function MyReservationList() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessToken] = useAtom(accessTokenState);
    const [currentTab, setCurrentTab] = useState("전체");
    const navigate = useNavigate();

    const tabs = ["전체", "예약완료", "방문완료", "예약취소", "노쇼"];



    const loadData = useCallback(async () => {
        if (!accessToken) return;
        try {
            const response = await axios.get("/reservation/myList", {
                headers: {
                    Authorization: `Bearer ${accessToken}` // 헤더 추가
                }
            });
            setList(response.data);
        } catch (error) {
            console.error("목록 로드 실패", error);
            toast.error("나의 예약 로드 실패");
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredList = useMemo(() => {
        if (currentTab === "전체") return list;
        return list.filter(item => item.reservationStatus === currentTab);
    }, [list, currentTab]);

    const handleCancel = async (item) => {
        try {
            const now = new Date();
            // 1. 예약 시간을 객체로 변환
            const reserveDate = parse(item.reservationTime, "yyyy-MM-dd HH:mm", new Date());

            // 2. 시간 제외하고 '날짜'만 비교하기 위해 오늘과 예약일의 시작 시점 구함
            const todayStart = startOfDay(now);
            const reserveStart = startOfDay(reserveDate);

            // 날짜 차이 계산
            const diffDays = differenceInDays(reserveStart, todayStart);

            let refundPercent = 0;
            let policyText = "";

            if (diffDays >= 2) {
                refundPercent = 100;
                policyText = "방문 2일 전으로 100% 환불이 가능합니다.";
            } else if (diffDays === 1) {
                refundPercent = 50;
                policyText = "방문 1일 전으로 50% 환불이 가능합니다.";
            } else {
                refundPercent = 0;
                policyText = "방문 당일은 규정상 환불이 불가합니다.";
            }

            const refundAmount = (item.paymentTotalAmount * refundPercent) / 100;

            // SweetAlert 안내 창 (기존과 동일)
            const result = await Swal.fire({
                title: '예약을 취소하시겠습니까?',
                html: `
                <div class="text-start mt-3 p-3 bg-light rounded" style="font-size: 0.9rem;">
                    <p class="mb-2"><strong>식당:</strong> ${item.restaurantName}</p>
                    <p class="mb-2"><strong>규정:</strong> ${policyText}</p>
                    <hr>
                    <p class="mb-0 text-center">
                        예상 환불 금액: <span class="text-danger fw-bold fs-5">${refundAmount.toLocaleString()}원</span>
                    </p>
                </div>
            `,
                icon: refundPercent > 0 ? 'warning' : 'error',
                showCancelButton: true,
                confirmButtonColor: refundPercent > 0 ? '#d33' : '#6c757d',
                confirmButtonText: refundPercent > 0 ? '네, 취소하겠습니다' : '확인',
                cancelButtonText: '아니오'
            });

            if (!result.isConfirmed) return;

            // 로딩 바 표시
            Swal.fire({
                title: '처리 중...',
                text: '환불 절차를 진행 중입니다.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            // 백엔드 요청
            await axios.post(`/reservation/refund?reservationId=${item.reservationId}`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            await Swal.fire({
                title: '취소 완료',
                text: `${refundAmount.toLocaleString()}원이 환불 처리되었습니다.`,
                icon: 'success'
            });

            loadData(); // 목록 새로고침

        } catch (error) {
            console.error("취소 실패", error);
            Swal.fire({
                title: '취소 실패',
                text: error.response?.data || "처리 중 오류가 발생했습니다.",
                icon: 'error'
            });
        }
    };

    if (loading) return <div className="text-center my-5"><ScaleLoader color="#7eb6ac" /></div>;

    // render
    return (<>

        {/* 탭 메뉴 UI */}
        <div className="container-fluid my-4">
            <ul className="nav nav-pills nav-fill bg-white p-1 rounded shadow-sm">
                {tabs.map(tab => (
                    <li className="nav-item" key={tab}>
                        <button
                            className={`nav-link ${currentTab === tab ? 'active' : 'text-muted'}`}
                            style={currentTab === tab ? { backgroundColor: '#7eb6ac' } : {}}
                            onClick={() => setCurrentTab(tab)}
                        >
                            {tab}
                            <span className="ms-1 small">
                                ({tab === "전체" ? list.length : list.filter(i => i.reservationStatus === tab).length})
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>

        <div className="container-fluid">
            {filteredList.length === 0 ? (
                <div className="text-center py-5 border rounded bg-light">
                    <p className="text-muted mb-0">내역이 없습니다.</p>
                </div>
            ) : (
                filteredList.map(item => {
                    const isCancelled = item.reservationStatus === '예약취소';
                    const isNoShow = item.reservationStatus === '노쇼';
                    const isCompleted = item.reservationStatus === '방문완료';

                    const diffDays = differenceInDays(startOfDay(parse(item.reservationTime, "yyyy-MM-dd HH:mm", new Date())), startOfDay(new Date()));

                    // 상태별 배지 색상 결정
                    const getBadgeClass = (status) => {
                        switch (status) {
                            case '예약완료': return 'bg-success';
                            case '예약취소': return 'bg-danger';
                            case '방문완료': return 'bg-primary';
                            case '노쇼': return 'bg-dark';
                            default: return 'bg-secondary';
                        }
                    };

                    return (
                        <div key={item.reservationId} className={`card mb-4 shadow-sm border-0 ${isCancelled ? 'opacity-75' : ''}`}>
                            <div className="card-body p-4">
                                {/* 상단: 예약 상태 및 결제 금액 */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className={`badge ${isCancelled ? 'bg-danger' : 'bg-success'}`}>
                                        {item.reservationStatus}
                                    </span>

                                    {item.paymentTotalAmount > 0 && (
                                        <div className="text-end">
                                            <div className={`fw-bold ${isCancelled ? 'text-decoration-line-through text-muted small' : 'text-primary'}`}>
                                                결제액: {item.paymentTotalAmount.toLocaleString()}원
                                            </div>

                                            {isCancelled && (
                                                <div className="text-danger fw-bold fs-5">
                                                    환불액: {item.refundAmount.toLocaleString()}원
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 중단: 식당 정보 */}
                                <h5 className={`fw-bold mb-1 ${isCancelled ? 'text-muted' : ''}`}>{item.restaurantName}</h5>
                                <p className="text-muted small mb-2">{item.restaurantAddress}</p>
                                <p className="mb-1"><FaCalendar /> <strong>예약:</strong> {item.reservationTime}</p>
                                <p className="mb-3"><FaUser /> <strong>인원:</strong> {item.reservationPeopleCount}명</p>

                                {/* 결제 정보 (TID 등) - 취소 시에도 기록용 */}
                                {item.tid && (
                                    <div className="mt-2 py-2 px-3 bg-light rounded shadow-none" style={{ fontSize: "0.8rem" }}>
                                        <div className="d-flex justify-content-between text-muted">
                                            <span>거래번호 | {item.tid}</span>
                                            <span>결제일 | {format(new Date(item.paymentTime), "yyyy년 MM월 dd일 HH:mm")}</span>
                                        </div>
                                    </div>
                                )}

                                {/* 하단 버튼 */}
                                <div className="text-end mt-3">
                                    {item.reservationStatus === '예약완료' && (
                                        diffDays < 0 ? (
                                                <span className="text-danger me-2">기한 만료</span>
                                        ):(
                                        <button className="btn btn-outline-danger me-2" onClick={() => handleCancel(item)}>
                                            취소하기
                                        </button>
                                        )
                                    )}

                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </>
    );
}