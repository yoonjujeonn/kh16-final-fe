
import { Modal } from "bootstrap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function ReservationMoreInfo() {

    const { restaurantId } = useParams();

    const id = parseInt(restaurantId);

    const [holidays, setHolidays] = useState([]);

    const [seat, setSeat] = useState({
        seatRestaurantId: id,
        seatType: "",
        seatMaxPeople: 1
    });

    const [seatCount, setSeatCount] = useState(1);

    const [seatList, setSeatList] = useState([]);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const fileInput = useRef();

    //미리보기용
    const fileChange = useCallback(e => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        //미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    }, []);

    const fileUpload = useCallback(async () => {
        if (!file) {
            toast.warning("대표 이미지는 필수항목입니다");
            return;
        }

        const formData = new FormData();
        formData.append("restaurantId", id);
        formData.append("attach", file);

        try {
            const response = await axios.post("/restaurant/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("대표 이미지가 등록되었습니다");
        }
        catch (err) {
            toast.error("업로드에 실패했습니다. 다시 한번 시도해주세요")
        }
    }, [file, id]);


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

        setSeatCount(value);
    }, []);

    const navigate = useNavigate();

    const clearData = useCallback(() => {
        setSeat(prev => ({
            ...prev,
            seatType: "",
            seatMaxPeople: 1
        }));

        setSeatCount(1);

    }, []);

    useEffect(() => {
        loadSeatList();
    }, [id]);

    //좌석 생성 - axios
    const createSeat = useCallback(async () => {
        const request = { seatDto: seat, count: seatCount };
        console.log(request);
        try {
            const response = await axios.post("/slot/seat", request);
            toast.success("좌석이 정상적으로 등록되었습니다");
            clearAndCloseModal();
            loadSeatList();
        }
        catch (err) {
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
    }, [seat, seatCount]);

    //휴무일 생성
    const creatHolidays = useCallback(async () => {

        const request = holidays.map(day => ({
            restaurantId: id,
            restaurantHolidayDate: day.toISOString().slice(0, 10)
        }));
        console.log(request);
        try {
            const response = await axios.post("/restaurant/holiday", request);
            toast.success("휴무일이 정상적으로 등록되었습니다");
        }
        catch (err) {
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
    }, [holidays]);
    //식당 등록 완료 페이지로 이동
    const completeAdd = useCallback(() => {
        navigate("/restaurant/add/finish");
    }, []);

    //좌석 리스트 불러오기
    const loadSeatList = useCallback(async () => {
        try {
            const { data } = await axios.get(`/slot/seat/${id}`);
            setSeatList(data);
        }
        catch (err) {
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
    }, []);

    const hasSeat = useMemo(() => {
        if (seatList.length === 0) return false;
        return true;
    }, [seatList]);

    return (
        <>
            <div className="progress">
                <div className="progress-bar" role="progressbar" style={{ width: "90%" }}>
                </div>
            </div>
            {/* 좌석 정보 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">좌석 정보</label>
                <div className="col-sm-9">
                    {hasSeat ? (
                        <>
                            <ul className="list-group">
                                {seatList.map(seat => (
                                    <li className="list-group-item" key={seat.seatId}>
                                        좌석 종류: {seat.seatType}, 수용 인원: {seat.seatMaxPeople}명, 좌석 수: {seat.count} 개
                                    </li>
                                ))}
                                <li className="list-group-item">
                                    총 좌석 수: {seatList.length}개
                                </li>
                                <div className="col btn-wrapper text-end">
                                    <button className="ms-2 mt-2 btn btn-outline-info" onClick={openModal}>
                                        신규 좌석 등록
                                    </button>
                                </div>
                            </ul>
                        </>
                    ) : (
                        <button className="ms-2 btn btn-primary" onClick={openModal}>
                            신규 좌석 등록
                        </button>
                    )}
                </div>
            </div>
            {/* 휴무일 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">휴무일</label>
                <div className="col-sm-9">
                    <DayPicker mode="multiple" selected={holidays} onSelect={setHolidays} />
                </div>
                <div className="col btn-wrapper text-end">
                    <button className="btn btn-outline-info" onClick={creatHolidays}>휴무일 등록</button>
                </div>
            </div>
            {/* 대표 이미지 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">대표 이미지</label>
                <div className="col-sm-9">
                    <input type="file" accept="image/*" className="form-control" ref={fileInput} onChange={fileChange} />
                </div>
                {preview && (
                    <>
                        <div className="preview-wrapper text-center mt-4">
                            {/*미리보기 영역*/}
                            <img src={preview} alt="미리보기" style={{ width: "300px", height: "auto" }} onClick={() => fileInput.current.click()} />
                        </div>
                        <div className="btn-wrapper mt-2 text-end">
                            <button className="btn btn-outline-info" onClick={fileUpload}>이미지 등록</button>
                        </div>
                    </>
                )}
            </div>

            <div className="row mt-4">
                <div className="col d-flex justify-content-between">
                    <div className="btn-wrapper">
                        <Link to="/restaurant/add/info" className="btn btn-secondary">이전으로</Link>
                    </div>
                    <button className="btn btn-success" onClick={completeAdd}>식당 등록 신청</button>
                </div>
            </div>
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
                                <input type="number" name="seatCount" value={seatCount} className="col-sm-9 form-control w-25" placeholder="좌석 수" onChange={changeCountValue} />
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