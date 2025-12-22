import Jumbotron from "../templates/Jumbotron";
import { useCallback, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaAsterisk } from "react-icons/fa";

export default function RestaurantAddFinish() {

    const { restaurantId } = useParams();
    const id = parseInt(restaurantId);
    const today = new Date();

    {/* 대표 이미지 */}
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fileValid, setFileValid] = useState(false);
    const fileInput = useRef();

    {/* 휴무일 */}
    const [holidays, setHolidays] = useState([]);

    const [menu, setMenu] = useState({
        menuName: "",
        menuPrice: "",
        menuInfo: ""
    });
    const [menuList, setMenuList] = useState([]); 

    const [isComplete, setIsComplete] = useState(false);

    {/* 파일 미리보기 */}
    const fileChange = useCallback(e => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            setFile(null);
            setPreview(null);
            setFileValid(false);
            return;
        }

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);

        setFileValid(true);
    }, []);

    {/* 대표 이미지 업로드 */}
    const fileUpload = useCallback(async () => {
        const formData = new FormData();
        formData.append("restaurantId", id);
        formData.append("attach", file);

        await axios.post("/restaurant/image", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    }, [file, id]);

    {/* 휴무일 등록 */}
    const createHolidays = useCallback(async () => {
        const request = holidays.map(day => ({
            restaurantId: id,
            restaurantHolidayDate: day.toISOString().slice(0, 10)
        }));

        await axios.post("/restaurant/holiday", request);
    }, [holidays, id]);

    const addMenuPreview = useCallback(() => {
        if (!menu.menuName || !menu.menuPrice) {
            toast.error("메뉴명과 가격은 필수입니다");
            return;
        }

        setMenuList(prev => [
            ...prev,
            {
                menuName: menu.menuName,
                menuPrice: menu.menuPrice,
                menuInfo: menu.menuInfo
            }
        ]);

        setMenu({ menuName: "", menuPrice: "", menuInfo: "" });
    }, [menu]);

    const insertMenus = async () => {
        for (const m of menuList) {
            await axios.post("/menu/", {
                restaurantId: id,
                menuName: m.menuName,
                menuPrice: m.menuPrice,
                menuInfo: m.menuInfo
            });
        }
    };

    {/* 완료 처리 */}
    const sendDataAndSetComplete = useCallback(async () => {
        if (!fileValid) {
            toast.error("대표 이미지는 필수입니다");
            return;
        }

        try {
            if (menuList.length > 0) {
                await insertMenus();
            }

            if (holidays.length > 0) {
                await createHolidays();
            }

            await fileUpload();

            setIsComplete(true);
        }
        catch {
            toast.error("등록 중 오류가 발생했습니다");
        }
    }, [fileValid, menuList, holidays, createHolidays, fileUpload]);

    {/* 메인 이동 */}
    const goToMain = useCallback(async () => {
        const choice = await Swal.fire({
            title: "메인페이지로 이동하시겠습니까?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#00b894",
            cancelButtonColor: "#ff7675",
            confirmButtonText: "메인으로",
            cancelButtonText: "취소",
            allowOutsideClick: false,
        });

        if (!choice.isConfirmed) return;
    }, []);

    return (
        <>
            {!isComplete ? (
                <>
                    <div className="title-wrapper">
                        <h1>추가 정보 등록하기</h1>
                        <div className="d-flex justify-content-end">
                            <span><FaAsterisk className="text-danger me-2"/>미입력 시 승인이 거절될 수 있습니다</span>
                        </div>
                    </div>
                    <hr/>
                    {/* 대표 이미지 */}
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">대표 이미지</label>
                        <div className="col-sm-9">
                            <input
                                type="file"
                                accept="image/*"
                                className={`form-control ${fileValid ? "is-valid" : "is-invalid"}`}
                                ref={fileInput}
                                onChange={fileChange}
                            />
                            <div className="invalid-feedback">
                                대표 이미지는 필수항목입니다
                            </div>
                        </div>
                        {preview && (
                            <div className="text-center mt-3">
                                <img
                                    src={preview}
                                    alt="미리보기"
                                    style={{ width: "300px" }}
                                    onClick={() => fileInput.current.click()}
                                />
                            </div>
                        )}
                    </div>

                    {/* 휴무일 */}
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">휴무일(선택)</label>
                        <div className="col-sm-9">
                            <DayPicker
                                mode="multiple"
                                disabled={{ before: today }}
                                selected={holidays}
                                onSelect={setHolidays}
                            />
                        </div>
                    </div>

                    {/* 메뉴 등록 */}
                    <div className="row mt-5">
                        <label className="col-sm-3 col-form-label">메뉴 등록</label>
                        <div className="col-sm-9">

                            <input
                                className="form-control mb-2"
                                placeholder="메뉴명"
                                value={menu.menuName}
                                onChange={e => setMenu({ ...menu, menuName: e.target.value })}
                            />

                            <input
                                type="number"
                                className="form-control mb-2"
                                placeholder="가격"
                                value={menu.menuPrice}
                                onChange={e => setMenu({ ...menu, menuPrice: e.target.value })}
                            />

                            <textarea
                                className="form-control mb-2"
                                placeholder="메뉴 설명"
                                value={menu.menuInfo}
                                onChange={e => setMenu({ ...menu, menuInfo: e.target.value })}
                            />

                            <button
                                className="btn btn-outline-primary"
                                onClick={addMenuPreview}
                            >
                                메뉴 추가
                            </button>

                            {/* 메뉴 미리보기 */}
                            {menuList.length > 0 && (
                                <ul className="list-group mt-3">
                                    <li className="list-group-item list-group-item-primary">
                                        등록할 메뉴
                                    </li>
                                    {menuList.map((m, i) => (
                                        <li key={i} className="list-group-item">
                                            <strong>{m.menuName}</strong> · {m.menuPrice}원
                                            {m.menuInfo && (
                                                <div className="text-muted">{m.menuInfo}</div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="row mt-4">
                        <div className="col d-flex justify-content-between">
                            <button className="btn btn-outline-secondary" onClick={goToMain}>
                                나중에 등록하기
                            </button>
                            <button
                                className={`btn btn-${fileValid ? "success" : "danger"}`}
                                disabled={!fileValid}
                                onClick={sendDataAndSetComplete}
                            >
                                {fileValid ? "등록하기" : "필수 항목 작성"}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="title-wrapper text-center">
                        <h1>식당 등록이 완료되었습니다</h1>
                        <span>관리자 승인 후 최종 등록됩니다(영업일 기준 2~3일)</span>
                    </div>
                    <div className="text-center mt-4 d-flex flex-column align-items-center">
                        <div className="text-center">
                        <Link to="/" className="btn btn-lg btn-primary mt-3">
                            메인 페이지로
                        </Link>
                        </div>
                        <img src="https://i.gifer.com/7efs.gif" alt="완료" />
                    </div>
                </>
            )}
        </>
    );
}
