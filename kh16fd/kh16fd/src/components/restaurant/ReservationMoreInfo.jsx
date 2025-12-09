
import { Modal } from "bootstrap";
import { useCallback, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Link } from "react-router-dom";

export default function ReservationMoreInfo() {
    const [holidays, setHolidays] = useState([]);

    const modal = useRef();

    const openModal = useCallback(() => {
        const instance = Modal.getOrCreateInstance(modal.current);
        instance.show();
    }, [modal]);

    const closeModal = useCallback(() => {
        const instance = Modal.getInstance(modal.current);
        instance.hide();
    }, [modal]);

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
                    <button className="ms-2 btn btn-primary" onClick={openModal}>신규 좌석 등록</button>
                </div>
            </div>
            
            {/* 휴무일 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">휴무일</label>
                <div className="col-sm-9">
                    <DayPicker mode="multiple" selected={holidays} onSelect={setHolidays} />
                </div>
            </div>
            {/* 대표 이미지 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">대표 이미지</label>
                <div className="col-sm-9">
                    <input type="file" className="form-control" />
                </div>
            </div>
            <div className="row mt-4">
                <div className="col d-flex justify-content-between">
                    <div className="btn-wrapper">
                        <Link to="/restaurant/add/info" className="btn btn-secondary">이전으로</Link>
                    </div>
                    <button className="btn btn-success">식당 등록 신청</button>
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
                                <select className="col-sm-9 form-select w-50">
                                    <option value="">좌석 종류</option>
                                    <option>홀</option>
                                    <option>창가</option>
                                    <option>룸</option>
                                    <option>바</option>
                                </select>
                            </div>
                            <div className="row mt-3">
                                <label className="col-sm-3 col-form-label">수용 인원(명)</label>
                                <input type="number" className="col-sm-9 form-control w-25" placeholder="수용 인원" />
                            </div>
                            <div className="row mt-3">
                                <label className="col-sm-3 col-form-label">좌석 수(개)</label>
                                <input type="number" className="col-sm-9 form-control w-25" placeholder="좌석 수" />
                            </div>
                            <div className="row mt-3">
                                <div className="col text-end">
                                    <button className="btn btn-success">좌석 생성</button>
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