import axios from "axios";
import { useEffect, useState } from "react"
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { toast } from "react-toastify";

export default function ReservationDetail() {
    const [reservation, setReservation] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reservationId = searchParams.get("reservationId");

    useEffect(() => {
        if (reservationId) {
            loadData();
        }
    }, [reservationId]);

    const loadData = async () => {
        try {
            const response = await axios.get(`/reservation/detail/${reservationId}`);
            setReservation(response.data);
        } catch (error) {
            console.error("예약 정보를 불러오기 실패 : ", error);
            toast.error("예약 정보를 불러오는 데 실패했습니다.");
        }
    };

    if (!reservation) {
        return <div className="text-center my-5">
            <ScaleLoader color="#7eb6ac" />
            <p className="mt-3 text-primary">loading...</p>
        </div>
    }

    return (<>
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <div className="card shadow-sm border-0 p-4 text-center">
                    <div className="mb-3">
                        <FaCheckCircle className="text-success" size={60} />
                    </div>
                    <h2 className="fw-bold mb-2">예약 완료!</h2>
                    <p className="text-muted mb-4">성공적으로 예약이 확정되었습니다.</p>

                    <div className="bg-light p-4 rounded text-start mb-4">
                        <h5 className="border-bottom pb-2 mb-3">방문 정보</h5>
                        <p className="mb-2"><strong>식당명:</strong> {reservation.restaurantName}</p>
                        <p className="mb-2"><strong>예약일시:</strong> {reservation.reservationTime}</p>
                        <p className="mb-2"><strong>인원수:</strong> {reservation.reservationPeopleCount}명</p>
                        <p className="mb-2"><strong>주소:</strong> {reservation.restaurantAddress}</p>

                        {reservation.paymentTotalAmount && (
                            <div className="mt-3 pt-3 border-top">
                                <p className="mb-0 text-primary fw-bold">
                                    결제 금액: {reservation.paymentTotalAmount.toLocaleString()}원
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                        <button className="btn btn-outline-secondary px-4" onClick={() => navigate("/")}>
                            홈으로
                        </button>
                        <button className="btn btn-primary px-4" onClick={() => navigate("/member/info/reservation")}>
                            예약 내역 확인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}