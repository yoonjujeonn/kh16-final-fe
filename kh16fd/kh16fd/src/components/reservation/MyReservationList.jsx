import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import { FaCalendar, FaUser } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";


export default function MyReservationList() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessToken] = useAtom(accessTokenState);
    const navigate = useNavigate();



    const loadData = useCallback(async () => {
        console.log("현재 Jotai 토큰 상태:", accessToken);
        try {
            const response = await axios.get("/reservation/myList",{
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
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    const handleCancel = async (reservationId) => {
        const result = await Swal.fire({
            title: '예약을 취소하시겠습니까?',
            text: "방문일 기준 전전날까지 100%, 전날 50%, 당일은 환불이 불가합니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '네, 취소하겠습니다',
            cancelButtonText: '아니오',
            // 배경 클릭으로 창 닫기 방지
            allowOutsideClick: () => !Swal.isLoading()
        });
        // 사용자가 '아니오'를 눌렀다면 종료
        if (!result.isConfirmed) return;

        // 2. 실제 취소 처리 진행
        try {
            // 로딩 바 표시
            Swal.fire({
                title: '처리 중...',
                text: '카카오페이 환불을 진행하고 있습니다.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // 백엔드 API 호출
            await axios.post(`/reservation/refund?reservationId=${reservationId}`,{},{
                headers: {
                Authorization: `Bearer ${accessToken}` // 헤더 추가
            }
            });

            // 3. 성공 알림
            await Swal.fire({
                title: '취소 완료!',
                text: '예약 및 결제가 성공적으로 취소되었습니다.',
                icon: 'success'
            });

            // 목록 새로고침
            loadData();

        } catch (error) {
            console.error("취소 실패", error);
            const message = error.response?.data || "취소 중 오류가 발생했습니다.";

            // 4. 실패 알림
            Swal.fire({
                title: '취소 실패',
                text: message,
                icon: 'error'
            });
        }

    };

    if (loading) return <div className="text-center my-5"><ScaleLoader color="#7eb6ac" /></div>;

    // render
    return (<>
        <Jumbotron subject="나의 예약내역" />
        {list.length === 0 ? (
            <div className="text-center py-5 border rounded bg-light">
                <p className="text-muted mb-0">아직 예약된 내역이 없습니다.</p>
            </div>
        ) : (
            list.map(item => {
                // 취소 여부 판별
                const isCancelled = item.reservationStatus === '예약취소';

                return (
                    <div key={item.reservationId} className={`card mb-4 shadow-sm border-0 ${isCancelled ? 'opacity-75' : ''}`}>
                        <div className="card-body p-4">
                            {/* 상단: 예약 상태 및 결제 금액 */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className={`badge ${isCancelled ? 'bg-danger' : 'bg-success'}`}>
                                    {item.reservationStatus}
                                </span>
                                {item.paymentTotalAmount > 0 && (
                                    <span className={`fw-bold ${isCancelled ? 'text-decoration-line-through text-muted' : 'text-primary'}`}>
                                        {item.paymentTotalAmount.toLocaleString()}원
                                    </span>
                                )}
                            </div>

                            {/* 중단: 식당 정보 */}
                            <h5 className={`fw-bold mb-1 ${isCancelled ? 'text-muted' : ''}`}>{item.restaurantName}</h5>
                            <p className="text-muted small mb-2">{item.restaurantAddress}</p>
                            <p className="mb-1"><FaCalendar /> <strong>예약:</strong> {item.reservationTime}</p>
                            <p className="mb-3"><FaUser /> <strong>인원:</strong> {item.reservationPeopleCount}명</p>

                            {/* 결제 정보 (TID 등) - 취소 시에도 기록용으로 보여줌 */}
                            {item.tid && (
                                <div className="mt-2 py-2 px-3 bg-light rounded shadow-none" style={{ fontSize: "0.8rem" }}>
                                    <div className="d-flex justify-content-between text-muted">
                                        <span>거래번호: {item.tid}</span>
                                        <span>결제일: {item.paymentTime}</span>
                                    </div>
                                </div>
                            )}

                            {/* 하단 버튼 */}
                            <div className="text-end mt-3">
                                {!isCancelled && (
                                    <button
                                        className="btn btn-outline-danger btn-sm me-2"
                                        onClick={() => handleCancel(item.reservationId)}
                                    >
                                        취소하기
                                    </button>
                                )}
                                {/* 굳이? */}
                                {/* <button 
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => navigate(`/reservation/add/success?reservationId=${item.reservationId}`)}
                                        >
                                            상세보기
                                        </button> */}
                            </div>
                        </div>
                    </div>
                );
            })
        )}
    </>
    );
}