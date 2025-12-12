import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { restaurantInfoState } from "../../utils/jotai";
import { Link, useNavigate } from "react-router-dom";

export default function RestaurantCategorySelect() {

    // 기존 restaurantInfoState 사용
    const [basicInfo, setBasicInfo] = useAtom(restaurantInfoState);

    // 상위 / 하위 카테고리 목록 상태
    const [parentList, setParentList] = useState([]);
    const [childList, setChildList] = useState([]);

    // 선택된 상위 카테고리 번호
    const [parentNo, setParentNo] = useState("");

    const navigate = useNavigate();

    // 상위 카테고리 목록 불러오기
    useEffect(() => {
        axios.get("http://localhost:8080/category/parent")
            .then(res => setParentList(res.data))
            .catch(err => console.log("상위 카테고리 불러오기 실패", err));
    }, []);

    // 하위 카테고리 불러오기
    const loadChild = useCallback(async (no) => {
        setParentNo(no);

        if (!no) {
            setChildList([]);
            return;
        }

        const res = await axios.get(`http://localhost:8080/category/child/${no}`)
        setChildList(res.data);

    }, [parentList]);

    const toggleCategory = useCallback((categoryId) => {
        const id = parseInt(categoryId);

            setBasicInfo(prev => {
                const currentList = prev.categoryIdList || [];
                const isSelected = currentList.includes(id);
                const currentPreview = prev.preview || [];

                let updated;
                let updatedPreview;

                if (isSelected) {
                    updated = currentList.filter(item => item !== id);
                    updatedPreview = currentPreview.filter(p => p.childId !== id);
                } else {
                    updated = [...currentList, id];

                    const child = childList.find(c => c.categoryNo === id);
                    const parent = parentList.find(p => p.categoryNo === child?.parentCategoryNo);

                    const newItems = {
                        childId: id,
                        childName: child?.categoryName || "",
                        parentId: parent?.categoryNo || null,
                        parentName: parent?.categoryName || ""
                    };

                    updatedPreview = [...currentPreview, newItems];
                }

                return {
                    ...prev,
                    categoryIdList: updated,
                    preview : updatedPreview
                };
            });

        }, [basicInfo, childList, parentList]);

        // 체크 여부
        const isChecked = useCallback((id) => {
            return basicInfo.categoryIdList?.includes(id) || false;
        }, [basicInfo]);

        const goNext = () => {
            if (!basicInfo.categoryIdList || basicInfo.categoryIdList.length === 0) {
                alert("하나 이상의 카테고리를 선택해주세요.");
                return;
            }
            navigate("/restaurant/add/info");
        };

        return (
            <>
                <div className="progress">
                    <div className="progress-bar" role="progressbar" style={{ width: "20%" }}>
                    </div>
                </div>

                <h4 className="mt-4">카테고리 선택</h4>
                <p className="text-muted">식당이 속할 카테고리를 선택해주세요.</p>

                {/* 상위 카테고리 */}
                <div className="row mt-3">
                    <label className="col-sm-3 col-form-label">상위 카테고리</label>
                    <div className="col-sm-9">
                        <select
                            className="form-select"
                            value={parentNo}
                            onChange={(e) => loadChild(e.target.value)}
                        >
                            <option value="">상위 카테고리 선택</option>
                            {parentList.map(item => (
                                <option key={item.categoryNo} value={item.categoryNo}>
                                    {item.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 하위 카테고리 */}
                {childList.length > 0 && (
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">하위 카테고리</label>
                        <div className="col-sm-9 d-flex flex-wrap">

                            {childList.map(child => (
                                <label
                                    key={child.categoryNo}
                                    className="form-check me-3"
                                >
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={isChecked(child.categoryNo)}
                                        onChange={() => toggleCategory(child.categoryNo)}
                                    />
                                    {child.categoryName}
                                </label>
                            ))}

                        </div>
                    </div>
                )}

                {/* 선택 항목 보여주기 */}
                <div className="row-mt-4">
                    <div className="col">
                        {basicInfo.preview.length > 0 &&
                            (<ul className="list-group mt-4">
                                <li className="list-group-item list-group-item-primary">선택한 카테고리</li>
                                {basicInfo.preview.map(p => (
                                    <li className="list-group-item" key={p.childId}>
                                        {p.childName} ({p.parentName}) &nbsp;
                                    </li>
                                ))}
                            </ul>
                            )
                        }
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col d-flex justify-content-between">
                        <Link to="/restaurant/add" className="btn btn-secondary">이전으로</Link>
                        <button className="btn btn-success" onClick={goNext}>다음으로</button>
                    </div>
                </div>
            </>
        );
    }