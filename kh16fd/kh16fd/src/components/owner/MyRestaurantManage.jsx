import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";

export default function MyRestaurantManage() {
    const { restaurantId } = useParams();
    const [accessToken] = useAtom(accessTokenState);
    const navigate = useNavigate();

    /* =========================
       카테고리 STATE
    ========================= */
    const [parentList, setParentList] = useState([]);
    const [childList, setChildList] = useState([]);
    const [parentNo, setParentNo] = useState("");
    const [checkedCategories, setCheckedCategories] = useState([]);
    const [categoryNameMap, setCategoryNameMap] = useState({});

    /* =========================
       메뉴 STATE
    ========================= */
    const [menuList, setMenuList] = useState([]);
    const [newMenu, setNewMenu] = useState({
        menuName: "",
        menuPrice: "",
        menuInfo: ""
    });

    /* =========================
       좌석 STATE
    ========================= */
    const [seatList, setSeatList] = useState([]);
    const [seat, setSeat] = useState({
        seatType: "",
        seatMaxPeople: 1,
        count: 1
    });

    const seatModal = useRef(null);

    /* =========================
       카테고리 API
    ========================= */
    useEffect(() => {
        axios.get("/category/parent")
            .then(res => setParentList(res.data));
    }, []);

    useEffect(() => {
        if (!parentNo) {
            setChildList([]);
            return;
        }
        axios.get(`/category/child/${parentNo}`)
            .then(res => {
                setChildList(res.data);
                const map = {};
                res.data.forEach(c => map[c.categoryNo] = c.categoryName);
                setCategoryNameMap(prev => ({ ...prev, ...map }));
            });
    }, [parentNo]);

    useEffect(() => {
        if (!accessToken) return;

        axios.get(`/owner/restaurant/${restaurantId}/category`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => {
            setCheckedCategories(res.data.map(c => c.categoryNo));
            const map = {};
            res.data.forEach(c => map[c.categoryNo] = c.categoryName);
            setCategoryNameMap(prev => ({ ...prev, ...map }));
        });
    }, [restaurantId, accessToken]);

    const toggleCategory = (no) => {
        setCheckedCategories(prev =>
            prev.includes(no)
                ? prev.filter(n => n !== no)
                : [...prev, no]
        );
    };

    const saveCategory = () => {
        axios.post(
            `/owner/restaurant/${restaurantId}/category`,
            { categoryIdList: checkedCategories },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )
            .then(() => toast.success("카테고리 저장 완료"))
            .catch(() => toast.error("카테고리 저장 실패"));
    };

    /* =========================
       메뉴 API
    ========================= */
    useEffect(() => {
        if (!accessToken) return;

        axios.get(`/owner/restaurant/${restaurantId}/menu`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => setMenuList(res.data));
    }, [restaurantId, accessToken]);

    const addMenu = () => {
        if (!newMenu.menuName || !newMenu.menuPrice) {
            toast.warning("메뉴명과 가격을 입력하세요");
            return;
        }

        axios.post(
            `/owner/restaurant/${restaurantId}/menu`,
            newMenu,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )
            .then(() => {
                toast.success("메뉴 추가 완료");
                setNewMenu({ menuName: "", menuPrice: "", menuInfo: "" });
                return axios.get(`/owner/restaurant/${restaurantId}/menu`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
            })
            .then(res => setMenuList(res.data))
            .catch(() => toast.error("메뉴 추가 실패"));
    };

    const deleteMenu = (menuId) => {
        if (!window.confirm("메뉴를 삭제할까요?")) return;

        axios.delete(
            `/owner/restaurant/${restaurantId}/menu/${menuId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )
            .then(() => {
                toast.success("메뉴 삭제 완료");
                setMenuList(prev => prev.filter(m => m.menuId !== menuId));
            })
            .catch(() => toast.error("메뉴 삭제 실패"));
    };

    /* =========================
       좌석 API
    ========================= */
    const loadSeats = () => {
        axios.get(`/slot/seat/list/${restaurantId}`)
            .then(res => setSeatList(res.data))
            .catch(() => toast.error("좌석 조회 실패"));
    };

    useEffect(() => {
        loadSeats();
    }, [restaurantId]);

    const openSeatModal = () => {
        Modal.getOrCreateInstance(seatModal.current).show();
    };

    const closeSeatModal = () => {
        Modal.getInstance(seatModal.current).hide();
    };

    const createSeat = async () => {
        if (!seat.seatType || seat.count < 1) {
            toast.warning("좌석 정보를 입력하세요");
            return;
        }

        try {
            for (let i = 0; i < seat.count; i++) {
                await axios.post("/slot/seat/add", {
                    seatRestaurantId: restaurantId,
                    seatType: seat.seatType,
                    seatMaxPeople: seat.seatMaxPeople
                });
            }

            toast.success("좌석 등록 완료");
            setSeat({ seatType: "", seatMaxPeople: 1, count: 1 });
            closeSeatModal();
            loadSeats();
        }
        catch (e) {
            toast.error("좌석 등록 실패");
        }
    };
    
    const deleteSeat = (seatId) => {
        if (!window.confirm("좌석을 삭제할까요?")) return;

        axios.delete(`/slot/seat/${seatId}`)
            .then(() => {
                toast.success("좌석 삭제 완료");
                loadSeats();
            })
            .catch(() => toast.error("좌석 삭제 실패"));
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">식당 운영 정보 관리</h2>

            {/* ================= 카테고리 ================= */}
            <div className="card p-4 mb-5">
                <h4 className="mb-3">카테고리 관리</h4>

                <div className="mb-2">
                    {checkedCategories.map(no => (
                        <span key={no} className="badge bg-primary me-2">
                            {categoryNameMap[no]}
                        </span>
                    ))}
                </div>

                <select className="form-select my-3"
                    value={parentNo}
                    onChange={e => setParentNo(e.target.value)}>
                    <option value="">상위 카테고리 선택</option>
                    {parentList.map(p => (
                        <option key={p.categoryNo} value={p.categoryNo}>
                            {p.categoryName}
                        </option>
                    ))}
                </select>

                {childList.map(c => (
                    <label key={c.categoryNo} className="me-3">
                        <input
                            type="checkbox"
                            checked={checkedCategories.includes(c.categoryNo)}
                            onChange={() => toggleCategory(c.categoryNo)}
                        />{" "}
                        {c.categoryName}
                    </label>
                ))}

                <button className="btn btn-primary mt-3" onClick={saveCategory}>
                    카테고리 저장
                </button>
            </div>

            {/* ================= 메뉴 ================= */}
            <div className="card p-4 mb-5">
                <h4 className="mb-3">메뉴 관리</h4>

                <div className="d-flex mb-3">
                    <input className="form-control me-2" placeholder="메뉴명"
                        value={newMenu.menuName}
                        onChange={e => setNewMenu({ ...newMenu, menuName: e.target.value })}
                    />
                    <input className="form-control me-2" type="number" placeholder="가격"
                        value={newMenu.menuPrice}
                        onChange={e => setNewMenu({ ...newMenu, menuPrice: e.target.value })}
                    />
                    <input className="form-control me-2" placeholder="설명"
                        value={newMenu.menuInfo}
                        onChange={e => setNewMenu({ ...newMenu, menuInfo: e.target.value })}
                    />
                    <button className="btn btn-success" onClick={addMenu}>추가</button>
                </div>

                {menuList.map(m => (
                    <div key={m.menuId}
                        className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <strong>{m.menuName}</strong> - {m.menuPrice}원
                            <div className="text-muted small">{m.menuInfo}</div>
                        </div>
                        <button className="btn btn-outline-danger btn-sm"
                            onClick={() => deleteMenu(m.menuId)}>
                            삭제
                        </button>
                    </div>
                ))}
            </div>

            {/* ================= 좌석 ================= */}
            <div className="card p-4 mb-5">
                <h4 className="mb-3">좌석 관리</h4>

                {seatList.map(s => (
                    <div key={s.seatId}
                        className="d-flex justify-content-between mb-2">
                        <div>{s.seatType} / {s.seatMaxPeople}명</div>
                        <button className="btn btn-outline-danger btn-sm"
                            onClick={() => deleteSeat(s.seatId)}>
                            삭제
                        </button>
                    </div>
                ))}

                <button className="btn btn-success mt-3" onClick={openSeatModal}>
                    좌석 등록
                </button>
            </div>

            {/* 좌석 정보 모달 (등록 화면과 동일) */}
            <div
                className="modal fade"
                tabIndex={-1}
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                ref={seatModal}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">좌석 정보 설정</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={closeSeatModal}
                            ></button>
                        </div>

                        <div className="modal-body">
                            {/* 좌석 종류 */}
                            <div className="row">
                                <label className="col-sm-3 col-form-label">좌석 종류</label>
                                <select
                                    className="col-sm-9 form-select w-50"
                                    value={seat.seatType}
                                    onChange={e =>
                                        setSeat({ ...seat, seatType: e.target.value })
                                    }
                                >
                                    <option value="">좌석 종류</option>
                                    <option value="홀">홀</option>
                                    <option value="창가">창가</option>
                                    <option value="룸">룸</option>
                                    <option value="바">바</option>
                                </select>
                            </div>

                            {/* 수용 인원 */}
                            <div className="row mt-3">
                                <label className="col-sm-3 col-form-label">
                                    수용 인원(명)
                                </label>
                                <input
                                    type="number"
                                    className="col-sm-9 form-control w-25"
                                    min={1}
                                    value={seat.seatMaxPeople}
                                    onChange={e =>
                                        setSeat({
                                            ...seat,
                                            seatMaxPeople: e.target.value
                                        })
                                    }
                                />
                            </div>

                            {/* 좌석 수 */}
                            <div className="row mt-3">
                                <label className="col-sm-3 col-form-label">
                                    좌석 수(개)
                                </label>
                                <input
                                    type="number"
                                    className="col-sm-9 form-control w-25"
                                    min={1}
                                    value={seat.count}
                                    onChange={e =>
                                        setSeat({
                                            ...seat,
                                            count: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-success" onClick={createSeat}>
                                좌석 생성
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={closeSeatModal}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between mb-5">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>이전</button>
                <button className="btn btn-primary"
                    onClick={() => navigate("/owner/my-restaurant")}>
                    완료
                </button>
            </div>
        </div>
    );
}
