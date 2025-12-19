import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import { useLocation, useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow, parse } from "date-fns";
import { ko } from "date-fns/locale";
import axios from "axios";
import { FaAngleDown, FaAngleLeft } from "react-icons/fa";
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

    console.log(reservationTime);
    
    const [agreements, setAgreements] = useState({
        required1: false,
        required2: false,
        required3: false,
        required4: false
    });

    //상세보기(화살표) state
    const [showReservationDetail, setShowReservationDetail] = useState(false);
    const [showPriceDetail, setShowPriceDetail] = useState(false);

    //전체 동의
    const handleAllAgreement = (e) => {
        const { checked } = e.target;
        setAgreements(prev => ({
            ...prev,
            required3: checked,
            required4: checked
        }));
    };

    //개별 동의
    const handleCheck = (name) => {
        setAgreements(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const isAllChecked = agreements.required1 && agreements.required2 && agreements.required3 && agreements.required4;
    const isGroupChecked = agreements.required3 && agreements.required4;
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

    const goToTarget = useCallback(async () => {
        const response = await axios.delete(`/slot/lock/delete/${lockId}`);
        navigate(`/restaurant/detail/${reservationTarget}`);
    }, []);

    return (
        <>
            <div className="title-wrapper d-flex mb-4">
                <FaAngleLeft className="ms-3 fs-1 me-2"></FaAngleLeft>
                <h1 className="clickable" onClick={goToTarget}>{selectedRestaurant}</h1>
            </div>
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
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group border border-primary">
                        <li className="list-group-item list-group-item-primary text-center">예약 정보</li>
                        {/* <li className="list-group-item p-4 d-flex align-items-center justify-content-between"> */}
                        {/* 화살표 누르면 상세(예약 정보 : ? 테이블 : ? ) */}
                        {/* <span className="flex-grow-1 text-center">
                                {dayStr} · {timeStr} · {reservationInfo.reservationPeopleCount}명 · {selectedSeat}
                            </span>
                            <FaAngleDown className="ms-2 fs-4 text-primary" />
                        </li> */}
                        <li className="list-group-item p-0">
                            <div className="p-4 d-flex align-items-center justify-content-between"
                                onClick={() => setShowReservationDetail(!showReservationDetail)}>
                                <span className="flex-grow-1 text-center">
                                    {dayStr} · {timeStr} · {reservationInfo.reservationPeopleCount}명 · {selectedSeat}
                                </span>
                                <FaAngleDown className="ms-2 fs-4 text-primary"
                                    style={{ transform: showReservationDetail ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                            </div>
                            {/* 상세내용 */}
                            {showReservationDetail && (
                                <div className="bg-light p-4 border-top">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>방문 식당</span><span className="fw-bold">{selectedRestaurant}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>예약 인원</span><span className="fw-bold">성인 {reservationInfo.reservationPeopleCount}명</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>예약 일시</span><span className="fw-bold">{dayStr} {timeStr}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>좌석 정보</span><span className="fw-bold">{selectedSeat}</span>
                                    </div>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group">
                        {/* <li className="list-group-item d-flex justify-content-between border-primary p-4"> */}
                        {/* 화살표 누르면 상세(예약금 : ? 인원 : ?) */}
                        {/* <span className="fw-bold">총 결제 금액</span> <span className="text-primary fw-bold">{price.toLocaleString()} 원<FaAngleDown className="ms-2 fs-4" /></span>
                        </li> */}
                        <li className="list-group-item border-primary p-0">
                            <div className="p-4 d-flex justify-content-between align-items-center"
                                onClick={() => setShowPriceDetail(!showPriceDetail)}>
                                <span className="fw-bold">총 결제 금액</span>
                                <span className="text-primary fw-bold">
                                    {price.toLocaleString()} 원
                                    <FaAngleDown className="ms-2 fs-4"
                                        style={{ transform: showPriceDetail ? "rotate(180deg)" : "none", transition: "0.3s" }} />
                                </span>
                            </div>
                            {showPriceDetail && (
                                <div className="bg-light p-4 border-top border-primary">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>예약금 상세</span>
                                        <span className="fw-bold">
                                            {parseInt(restaurantInfo.restaurantReservationPrice).toLocaleString()}원 (1인)
                                            <span className="mx-2 text-muted">×</span>
                                            {reservationInfo.reservationPeopleCount}명
                                        </span>
                                    </div>

                                    <hr className="my-3" />

                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold text-danger">최종 결제 금액</span>
                                        <span className="fs-5 fw-bold text-danger">
                                            {price.toLocaleString()}원
                                        </span>
                                    </div>

                                    <div className="text-end mt-2">
                                        <small className="text-muted">* 인원수에 따른 예약금이 부과됩니다.</small>
                                    </div>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group border border-primary">
                        <li className="list-group-item list-group-item-primary text-center">
                            매장 유의사항
                            <div className="my-4 card rounded p-4 text-start" style={{ backgroundColor: "rgba(245, 255, 240, 0.4)" }}>
                                <div className="mb-2">
                                    <strong>1. 예약 시간 준수</strong>
                                    <p className="small mb-2 text-muted">- 예약 시간을 반드시 준수해주세요.</p>
                                </div>
                                <div className="mb-2">
                                    <strong>2. 인원 변경 및 좌석 안내</strong>
                                    <p className="small mb-2 text-muted">- 방문 인원 변경 시 사전에 꼭 연락 주시기 바랍니다. 좌석은 매장 상황에 따라 배정됩니다.</p>
                                </div>
                                <div className="mb-0">
                                    <strong>3. 취소 및 환불 규정</strong>
                                    <p className="small mb-0 text-muted">- 하단의 환불 정책을 반드시 확인해 주세요. 당일 취소는 환불이 어렵습니다.</p>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item d-flex flex-column p-4">
                            <label className="fw-bold"><span className="text-danger me-2">[필수]</span>확인해주세요</label>
                            <div className="input-group mt-2">
                                <input type="checkbox" className="form-check-input me-2" checked={agreements.required1} onChange={() => handleCheck("required1")}></input>
                                <label className="check-form-label"><span className="fw-bold me-2">[필수]</span>매장 이용수칙을 확인했습니다</label>
                            </div>
                            <div className="input-group mt-2">
                                <input type="checkbox" className="form-check-input me-2" checked={agreements.required2} onChange={() => handleCheck("required2")}></input>
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
                            <textarea className="form-control" rows={10} style={{ resize: "none" }} placeholder="매장에 요청할 내용이 있다면 작성해주세요"
                                value={reservationInfo.reservationRequestNote}
                                onChange={(e) => setReservationInfo({ ...reservationInfo, reservationRequestNote: e.target.value })}
                            ></textarea>
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
                                <input type="checkbox" className="form-check-input me-2" checked={isGroupChecked} onChange={handleAllAgreement}></input>
                                <label className="check-form-label">모두 동의합니다</label>
                            </div>
                            <div className="input-group mt-2 ms-3">
                                <input type="checkbox" className="form-check-input me-2" checked={agreements.required3} onChange={() => handleCheck("required3")}></input>
                                <label className="check-form-label">개인정보 제3자 제공 동의</label>
                            </div>
                            <div className="input-group mt-2 ms-3">
                                <input type="checkbox" className="form-check-input me-2" checked={agreements.required4} onChange={() => handleCheck("required4")}></input>
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
                                    <span>당일 취소 및 노쇼</span>
                                    <span>환불 불가</span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            {/* 임시 버튼 */}
            <button className={`btn mt-4 ${isAllChecked ? 'btn-info' : 'btn-secondary'}`} onClick={isAllChecked ? openModal : () => toast.warn("모든 필수 약관에 동의해주세요.")}>결제하기</button>
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