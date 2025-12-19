import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import { useLocation, useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow, parse } from "date-fns";
import { ko } from "date-fns/locale";
import axios from "axios";
import { FaAngleDown } from "react-icons/fa";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";

export default function ReservationAdd() {

    const location = useLocation();
    const { reservationTarget, reservationSeat, reservationPeopleCount, reservationTime, selectedRestaurant, selectedSeat, lockId } = location.state || {};

    //state
    const [reservationInfo, setReservationInfo] = useState({
        reservationTarget: reservationTarget,
        reservationSeat: reservationSeat,
        reservationPeopleCount: reservationPeopleCount,
        reservationTime: reservationTime,
        reservationRequestNote: "",
        reservationPurpose: ""
    });

    const [timeLeft, setTimeLeft] = useState(6 * 60);

    const [restaurantInfo, setRestaurantInfo] = useState(null);

    const [isPaying, setIsPaying] = useState(false);

    //날짜 변환
    const reservationTimeStr = reservationInfo.reservationTime;
    const reservationDate = parse(reservationTimeStr, "yyyy-MM-dd HH:mm", new Date());

    let dayStr;

    if (isToday(reservationDate)) {
        dayStr = `오늘 (${format(reservationDate, "eee", { locale: ko })})`;
    } else if (isTomorrow(reservationDate)) {
        dayStr = `내일 (${format(reservationDate, "eee", { locale: ko })})`;
    } else {
        dayStr = format(reservationDate, "yyyy-MM-dd");
    }

    const confirmDate = format(reservationDate, "MM월 dd일 (eee)", { locale: ko });

    //시간 변환
    const hour = reservationDate.getHours();
    const minutes = reservationDate.getMinutes();
    const ampm = hour >= 12 ? "오후" : "오전";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const timeStr = minutes === 0
        ? `${ampm} ${hour12}시`
        : `${ampm} ${hour12}시 ${minutes}분`;


    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    //가격 계산
    const [price, setPrice] = useState(0);

    //effect
    useEffect(() => {
        loadData();
    }, []);

    //타이머
    useEffect(() => {
        if (!timeLeft) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    //callback
    const loadData = useCallback(async () => {
        const { data } = await axios.get(`/restaurant/detail/${reservationTarget}`);
        setRestaurantInfo(data.restaurantDto);
        const price = parseInt(data.restaurantDto.restaurantReservationPrice);
        const people = parseInt(reservationInfo.reservationPeopleCount);
        setPrice(price * people);

    }, [reservationInfo]);

    const modal = useRef();

    const openModal = useCallback(() => {
        const instance = Modal.getOrCreateInstance(modal.current);
        instance.show();
    }, [modal]);

    const closeModal = useCallback(() => {
        const instance = Modal.getInstance(modal.current);
        instance.hide();
    }, [modal]);

    const navigate = useNavigate();

    const sendData = useCallback(async () => {
        setIsPaying(true);

        try {
            const { data } = await axios.post("/reservation/pay", reservationInfo);
            navigate(data.next_redirect_pc_url);
        }
        catch (err) {
            console.log(reservationInfo);
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
        finally {
            setIsPaying(false);
        }

    }, [reservationInfo]);
   
    return (
        <>
            <div className="row mt-2">
                <div className="col">
                    {timeLeft > 0 ?
                        <div className="bg-light p-3">
                            <span className="badge p-2 bg-primary badge-lg">{formatTime(timeLeft)}</span>
                            <small className="ms-3 fw-bold">6분간 예약 찜! 시간 내 예약을 완료해주세요</small>
                        </div>
                        :
                        <div className="bg-light p-3">
                            <span className="badge p-2 bg-danger badge-lg">{formatTime(timeLeft)}</span>
                            <small className="ms-3 fw-bold">찜 시간이 만료되어 다른 사람이 선택 좌석을 예약할 수 있습니다</small>
                        </div>
                    }
                </div>
            </div>
            <Jumbotron subject={`${selectedRestaurant} 예약 정보`} detail="예약 상세 페이지" />
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group border border-primary">
                        <li className="list-group-item list-group-item-primary text-center">예약 정보</li>
                        <li className="list-group-item p-4 d-flex align-items-center justify-content-between">
                            {/* 화살표 누르면 상세(예약 정보 : ? 테이블 : ? ) */}
                            <span className="flex-grow-1 text-center">
                                {dayStr} · {timeStr} · {reservationInfo.reservationPeopleCount}명 · {selectedSeat}
                            </span>
                            <FaAngleDown className="ms-2 fs-4 text-primary" />
                        </li>
                    </ul>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between border-primary p-4">
                            {/* 화살표 누르면 상세(예약금 : ? 인원 : ?) */}
                            <span className="fw-bold">총 결제 금액</span> <span className="text-primary fw-bold">{price.toLocaleString()} 원<FaAngleDown className="ms-2 fs-4" /></span></li>
                    </ul>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group border border-primary">
                        <li className="list-group-item list-group-item-primary text-center">
                            매장 유의사항
                            <div className="my-4 card rounded p-4" style={{ backgroundColor: "rgba(245, 255, 240, 0.4)" }}>
                                어쩌구 저쩌구
                            </div>
                        </li>
                        <li className="list-group-item d-flex flex-column p-4">
                            <label className="fw-bold"><span className="text-danger me-2">[필수]</span>확인해주세요</label>
                            <div className="input-group mt-2">
                                <input type="checkbox" className="form-check-input me-2"></input>
                                <label className="check-form-label"><span className="fw-bold me-2">[필수]</span>어쩌구 저쩌구</label>
                            </div>
                            <div className="input-group mt-2">
                                <input type="checkbox" className="form-check-input me-2"></input>
                                <label className="check-form-label"><span className="fw-bold me-2">[필수]</span>유의 사항에 동의합니다</label>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group">
                        <li className="list-group-item border-primary list-group-item-primary p-4">
                            고객 요청사항
                        </li>
                        <li className="list-group-item p-4">
                            <textarea className="form-control" rows={10} style={{ resize: "none" }} placeholder="매장에 요청할 내용이 있다면 작성해주세요"></textarea>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group">
                        <li className="list-group-item list-group-item-primary">
                            개인정보 제3자 제공 동의 및 환불 정책 동의
                        </li>
                        <li className="list-group-item d-flex flex-column align-items-center">
                            <div className="input-group border rounded p-3">
                                <input type="checkbox" className="form-check-input me-2"></input>
                                <label className="check-form-label">모두 동의합니다</label>
                            </div>
                            <div className="input-group mt-2 ms-3">
                                <input type="checkbox" className="form-check-input me-2"></input>
                                <label className="check-form-label">개인정보 제3자 제공 동의</label>
                            </div>
                            <div className="input-group mt-2 ms-3">
                                <input type="checkbox" className="form-check-input me-2"></input>
                                <label className="check-form-label">예약 취소/변경에 대한 환불 정책 동의</label>
                            </div>
                            <ul className="my-4 w-75 list-group">
                                <li className="list-group-item list-group-item-light p-3">
                                    예약금 · 메뉴 환불 정책
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>2일 전</span>
                                    <span>100% 환불</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>1일 전</span>
                                    <span>50% 환불</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>당일</span>
                                    <span>20% 환불</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>노쇼</span>
                                    <span>환불 불가</span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            {/* 임시 버튼 */}
            <button className="btn btn-info mt-4" onClick={openModal}>결제창 열기(임시 버튼)</button>
            {/* 체크박스 동의 시 활성화 */}
            <div className="modal fade" tabIndex={-1} data-bs-backdrop="static" ref={modal} data-bs-keyboard="false">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">예약 및 결제 정보</h5>
                            <button className="btn-close" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col">
                                    <ul className="list-group">
                                        <li className="list-group-item p-3 d-flex justify-content-between">
                                            <span className="fw-bold">예약 정보</span>
                                            <span className="fw-bold">{confirmDate} · {timeStr}</span>
                                        </li>
                                        <li className="list-group-item p-3 d-flex justify-content-between">
                                            <span className="fw-bold">결제 금액</span>
                                            <span className="fw-bold text-primary">{price.toLocaleString()}원</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="btn-wrapper text-end">
                                <button className="btn btn-success" onClick={sendData}>결제하기</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}