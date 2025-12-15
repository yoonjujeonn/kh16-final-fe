import Jumbotron from "../templates/Jumbotron"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function RestaurantAddFinish(){
    const { restaurantId } = useParams();

    const id = parseInt(restaurantId);

    const [holidays, setHolidays] = useState([]);

    const today = new Date();

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fileValid, setFileValid] = useState(null);
    const [isComplete, setIsComplete] = useState(false);

    const fileInput = useRef();

    //미리보기용
    const fileChange = useCallback(e => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            setFile(null);
            setPreview(null);
            setFileValid(false);
            return;
        };

        setFile(selectedFile);

        //미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);

        setFileValid(true);
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

    //휴무일 생성
    const createHolidays = useCallback(async () => {

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

    const sendDataAndSetComplete = useCallback(() => {
        if(!fileValid) {
            setIsComplete(false);
            toast.error("대표 이미지 설정은 필수입니다");
            return;
        }

        //휴무일 날짜 체크한 경우 선택한 값 등록
        if(holidays.length > 0){
            createHolidays();
        }
        
        fileUpload();

        setIsComplete(true);

    }, [file ,holidays]);

    const goToMain = useCallback(async () => {
        const choice = await Swal.fire({
            title: "메인페이지로 이동하시겠습니까?",
            text: "대표이미지가 설정되어야 승인 시 리스트에 출력됩니다",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#00b894",
            cancelButtonColor: "#ff7675",
            confirmButtonText: "메인으로",
            cancelButtonText: "취소",
            allowOutsideClick: false,
        });

        if (choice.isConfirmed === false) return;

    }, []);

    return (
    <>
        {isComplete === false ? (
            <>
                <Jumbotron
                    subject="추가 정보 등록"
                    detail="추가 정보를 입력해주세요(미입력시 승인이 늦어집니다)"
                    bgColor="secondary"
                />
                <div className="progress mt-4">
                    <div className="progress-bar" role="progressbar" style={{ width: "90%" }} />
                </div>

                {/* 대표 이미지 */}
                <div className="row mt-4">
                    <label className="col-sm-3 col-form-label">대표 이미지</label>
                    <div className="col-sm-9">
                        <input
                            type="file"
                            max={1}
                            accept="image/*"
                            className={`form-control ${fileValid ? "is-valid" : "is-invalid"}`}
                            ref={fileInput}
                            onChange={fileChange}
                        />
                        <div className="invalid-feedback">대표 이미지는 필수항목입니다</div>
                    </div>
                    {preview && (
                        <>
                            <div className="preview-wrapper text-center mt-4">
                                <img
                                    src={preview}
                                    alt="미리보기"
                                    style={{ width: "300px", height: "auto" }}
                                    onClick={() => fileInput.current.click()}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* 휴무일 */}
                <div className="row mt-4">
                    <label className="col-sm-3 col-form-label">휴무일(선택)</label>
                    <div className="col-sm-9">
                        <DayPicker mode="multiple" disabled={{before : today}} selected={holidays} onSelect={setHolidays} />
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col d-flex justify-content-between">
                        <div className="btn-wrapper">
                            <button className="btn btn-outline-secondary" onClick={goToMain}>
                                나중에 등록하기
                            </button>
                        </div>
                        <button className={`btn btn-${fileValid ? "success" : "danger"}`} disabled={!fileValid} onClick={sendDataAndSetComplete}>
                            {fileValid ? "등록하기" : "필수 항목 작성"}
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <>
                <Jumbotron subject="식당 등록 완료!" detail="관리자 최종 검토 후 승인됩니다" />
                <div className="row mt-4">
                    <div className="col">
                        <div className="d-flex flex-column align-items-center">
                            <img src="https://i.gifer.com/7efs.gif" alt="완료" />
                            <Link to="/" className="btn btn-primary">
                                메인 페이지로
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        )}
    </>
)
}