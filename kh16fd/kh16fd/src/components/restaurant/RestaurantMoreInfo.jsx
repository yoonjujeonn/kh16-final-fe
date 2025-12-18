import { useCallback, useMemo, useRef, useState } from "react"
import { Modal } from "bootstrap";
import { usePreventRefresh } from "../../hooks/usePreventRefresh";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function RestaurantMoreInfo({ data, setData, onPrev }) {
    //state
    const [reservationInfo, setReservationInfo] = useState(data);

    //입력용 state
    const [seat, setSeat] = useState({
        seatType: "",
        seatMaxPeople: 1,
        count: 1
    });

    const navigate = useNavigate();

    //callback
    const sendData = useCallback(async () => {

        setData(reservationInfo);

        const request = {
            ...reservationInfo,
            seatList: reservationInfo.seatList.map(seat => ({
                seatDto: {
                    seatType: seat.seatType,
                    seatMaxPeople: seat.seatMaxPeople
                },
                count: seat.count
            }))
        }

        console.log(request)
        try {
            const {data} = await axios.post("/restaurant/", request);
            console.log("data", data);
            const id = data.restaurantId;
            navigate(`/restaurant/add/finish/${id}`);
        }
        catch (err) {
            console.error(err);
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }

    }, [reservationInfo]);

    const prevStep = () => {
        setData(reservationInfo);
        onPrev();
    };

    const modal = useRef();

    const openModal = useCallback(() => {
        const instance = Modal.getOrCreateInstance(modal.current);
        instance.show();
    }, [modal]);

    const closeModal = useCallback(() => {
        const instance = Modal.getInstance(modal.current);
        instance.hide();
    }, [modal]);

    const clearAndCloseModal = useCallback(() => {
        clearData();
        const instance = Modal.getInstance(modal.current);
        instance.hide();
    }, [modal]);

    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setReservationInfo(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const selectType = useCallback(e => {
        const value = e.target.value;

        setSeat(prev => ({
            ...prev,
            seatType: value
        }));

    }, []);

    const changeNumberValue = useCallback(e => {
        const value = e.target.value;

        setSeat(prev => ({
            ...prev,
            seatMaxPeople: value
        }));

    }, []);

    const changeCountValue = useCallback(e => {
        const value = e.target.value;

        setSeat(prev => ({
            ...prev,
            count: value
        }));

    }, []);

    const createSeat = useCallback(() => {
        setReservationInfo(prev => ({
            ...prev,
            seatList: [...prev.seatList, seat]
        }));

        clearAndCloseModal();

    }, [seat]);

    const clearData = useCallback(() => {
        setSeat(prev => ({
            ...prev,
            seatType: "",
            seatMaxPeople: 1,
            count: 1
        }));
    }, []);

    const hasSeat = useMemo(() => {
        if (reservationInfo.seatList.length === 0) return false;
        return true;
    }, [reservationInfo]);

    console.log(data);

    const entered = useMemo(() => {
        return JSON.stringify(reservationInfo) !== JSON.stringify(data);
    }, [reservationInfo, data]);

    const { } = usePreventRefresh(entered);

    return (
        <>
            {/* 예약금 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">예약금</label>
                <div className="col-sm-9">
                    <input type="text" name="restaurantReservationPrice" className="form-control w-50" value={reservationInfo.restaurantReservationPrice} placeholder="미설정 시 5000원 " onChange={changeStrValue} />
                </div>
            </div>

            {/* 예약 시간 간격 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">예약 시간 간격</label>
                <div className="col-sm-9">
                    <input type="text" name="reservationInterval" className="form-control w-50" value={reservationInfo.reservationInterval} placeholder="미설정 시 30분" onChange={changeStrValue} />
                </div>
            </div>

            {/* 좌석 정보 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">좌석 정보</label>
                <div className="col-sm-9">
                    {hasSeat ? (
                        <>
                            <ul className="list-group">
                                <li className="list-group-item list-group-item-primary">
                                    좌석
                                </li>
                                {reservationInfo.seatList.map(seat => (
                                    <li className="list-group-item" key={seat.seatId}>
                                        좌석 종류: {seat.seatType}, 수용 인원: {seat.seatMaxPeople}명, 좌석 수: {seat.count} 개
                                    </li>
                                ))}
                            </ul>
                            <div className="col btn-wrapper text-end">
                                <button className="ms-2 mt-2 btn btn-outline-info" onClick={openModal}>
                                    신규 좌석 등록
                                </button>
                            </div>
                        </>
                    ) : (
                        <button className="ms-2 btn btn-primary" onClick={openModal}>
                            신규 좌석 등록
                        </button>
                    )}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col d-flex justify-content-between">
                    <div className="btn-wrapper">
                        <button className="btn btn-secondary" onClick={prevStep} >이전으로</button>
                    </div>
                    <div className="btn-wrapper">
                        <button className="btn btn-primary" onClick={sendData}>등록신청</button>
                    </div>
                </div>
            </div>

            {/* 좌석 정보 모달 */}
            <div className="modal fade" tabIndex={-1} data-bs-backdrop="static" ref={modal} data-bs-keyboard="false">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">좌석 정보 설정</h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <label className="col-sm-3 col-form-label">좌석 종류</label>
                                <select className="col-sm-9 form-select w-50" value={seat.seatType} onChange={selectType}>
                                    <option value="">좌석 종류</option>
                                    <option value="홀">홀</option>
                                    <option value="창가">창가</option>
                                    <option value="룸">룸</option>
                                    <option value="바">바</option>
                                </select>
                            </div>
                            <div className="row mt-3">
                                <label className="col-sm-3 col-form-label">수용 인원(명)</label>
                                <input type="number" name="seatMaxPeople" value={seat.seatMaxPeople} className="col-sm-9 form-control w-25" placeholder="수용 인원" onChange={changeNumberValue} />
                            </div>
                            <div className="row mt-3">
                                <label className="col-sm-3 col-form-label">좌석 수(개)</label>
                                <input type="number" name="count" value={seat.count} className="col-sm-9 form-control w-25" placeholder="좌석 수" onChange={changeCountValue} />
                            </div>
                            <div className="row mt-3">
                                <div className="col text-end">
                                    <button className="btn btn-success" onClick={createSeat}>좌석 생성</button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className={`ms-2 btn btn-primary`} onClick={closeModal}>닫기</button>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}