import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { toast } from "react-toastify";

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
       메뉴 STATE (info 포함)
    ========================= */
    const [menuList, setMenuList] = useState([]);
    const [newMenu, setNewMenu] = useState({
        menuName: "",
        menuPrice: "",
        menuInfo: ""
    });
    const [editMenuId, setEditMenuId] = useState(null);

    /* =========================
       좌석
    ========================= */
    const [seatList, setSeatList] = useState([]);

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
                setCategoryNameMap(prev => {
                    const copy = { ...prev };
                    res.data.forEach(c => copy[c.categoryNo] = c.categoryName);
                    return copy;
                });
            });
    }, [parentNo]);

    useEffect(() => {
        if (!accessToken) return;

        axios.get(`/owner/restaurant/${restaurantId}/category`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(res => {
                setCheckedCategories(res.data.map(c => c.categoryNo));
                setCategoryNameMap(prev => {
                    const copy = { ...prev };
                    res.data.forEach(c => copy[c.categoryNo] = c.categoryName);
                    return copy;
                });
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
        })
            .then(res => setMenuList(res.data));
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

    const updateMenu = (menu) => {
        axios.put(
            `/owner/restaurant/${restaurantId}/menu/${menu.menuId}`,
            menu,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )
            .then(() => {
                toast.success("메뉴 수정 완료");
                setEditMenuId(null);
            })
            .catch(() => toast.error("메뉴 수정 실패"));
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
       좌석 조회
    ========================= */
    useEffect(() => {
        if (!accessToken) return;

        axios.get(`/owner/restaurant/${restaurantId}/seat`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(res => setSeatList(res.data));
    }, [restaurantId, accessToken]);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">식당 운영 정보 관리</h2>

            {/* ================= 카테고리 ================= */}
            <div className="card p-4 mb-5">
                <h4 className="mb-3">카테고리 관리</h4>

                <div className="mb-3">
                    <strong>선택된 카테고리 :</strong>
                    <div className="mt-2">
                        {checkedCategories.map(no => (
                            <span key={no} className="badge bg-primary me-2">
                                {categoryNameMap[no]}
                            </span>
                        ))}
                    </div>
                </div>

                <select
                    className="form-select my-3"
                    value={parentNo}
                    onChange={e => setParentNo(e.target.value)}
                >
                    <option value="">상위 카테고리 선택</option>
                    {parentList.map(p => (
                        <option key={p.categoryNo} value={p.categoryNo}>
                            {p.categoryName}
                        </option>
                    ))}
                </select>

                <div className="d-flex flex-wrap">
                    {childList.map(c => (
                        <label key={c.categoryNo} className="me-3 mb-2">
                            <input
                                type="checkbox"
                                checked={checkedCategories.includes(c.categoryNo)}
                                onChange={() => toggleCategory(c.categoryNo)}
                            />{" "}
                            {c.categoryName}
                        </label>
                    ))}
                </div>

                <button className="btn btn-primary mt-3" onClick={saveCategory}>
                    카테고리 저장
                </button>
            </div>

            {/* ================= 메뉴 ================= */}
            <div className="card p-4 mb-5">
                <h4 className="mb-3">메뉴 관리</h4>

                {/* 메뉴 추가 */}
                <div className="d-flex mb-3">
                    <input
                        className="form-control me-2"
                        placeholder="메뉴명"
                        value={newMenu.menuName}
                        onChange={e => setNewMenu({ ...newMenu, menuName: e.target.value })}
                    />
                    <input
                        className="form-control me-2"
                        type="number"
                        placeholder="가격"
                        value={newMenu.menuPrice}
                        onChange={e => setNewMenu({ ...newMenu, menuPrice: e.target.value })}
                    />
                    <input
                        className="form-control me-2"
                        placeholder="메뉴 설명"
                        value={newMenu.menuInfo}
                        onChange={e => setNewMenu({ ...newMenu, menuInfo: e.target.value })}
                    />
                    <button className="btn btn-success" onClick={addMenu}>추가</button>
                </div>

                {/* 메뉴 목록 */}
                {menuList.map(menu => (
                    <div key={menu.menuId} className="d-flex align-items-center mb-2">
                        {editMenuId === menu.menuId ? (
                            <>
                                <input
                                    className="form-control me-2"
                                    value={menu.menuName}
                                    onChange={e =>
                                        setMenuList(prev =>
                                            prev.map(m =>
                                                m.menuId === menu.menuId
                                                    ? { ...m, menuName: e.target.value }
                                                    : m
                                            )
                                        )
                                    }
                                />
                                <input
                                    className="form-control me-2"
                                    type="number"
                                    value={menu.menuPrice}
                                    onChange={e =>
                                        setMenuList(prev =>
                                            prev.map(m =>
                                                m.menuId === menu.menuId
                                                    ? { ...m, menuPrice: e.target.value }
                                                    : m
                                            )
                                        )
                                    }
                                />
                                <input
                                    className="form-control me-2"
                                    value={menu.menuInfo}
                                    onChange={e =>
                                        setMenuList(prev =>
                                            prev.map(m =>
                                                m.menuId === menu.menuId
                                                    ? { ...m, menuInfo: e.target.value }
                                                    : m
                                            )
                                        )
                                    }
                                />
                                <button className="btn btn-primary me-2" onClick={() => updateMenu(menu)}>저장</button>
                                <button className="btn btn-secondary" onClick={() => setEditMenuId(null)}>취소</button>
                            </>
                        ) : (
                            <>
                                <div className="flex-grow-1">
                                    <div>
                                        <strong>{menu.menuName}</strong> - {menu.menuPrice}원
                                    </div>
                                    <div className="text-muted small">
                                        {menu.menuInfo}
                                    </div>
                                </div>
                                <button className="btn btn-outline-primary btn-sm me-2" onClick={() => setEditMenuId(menu.menuId)}>수정</button>
                                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteMenu(menu.menuId)}>삭제</button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* ================= 좌석 ================= */}
            <div className="card p-4">
                <h4>좌석 관리</h4>
                {seatList.map(s => (
                    <div key={s.seatId}>
                        {s.seatName} ({s.seatCapacity}인)
                    </div>
                ))}
            </div>
            {/* ================= 하단 버튼 ================= */}
            <div className="d-flex justify-content-between mt-4 mb-5">
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    이전
                </button>

                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/owner/my-restaurant")}
                >
                    완료
                </button>
            </div>
        </div>
    );
}
