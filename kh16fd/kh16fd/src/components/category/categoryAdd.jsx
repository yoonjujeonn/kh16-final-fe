import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Jumbotron from "../templates/Jumbotron";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaList } from "react-icons/fa6";

export default function CategoryAdd() {

    const navigate = useNavigate();

    //state
    const [category, setCategory] = useState({
        categoryName: "",
        parentCategoryNo: ""  // "" → 상위 카테고리 없음
    });

    const [parentList, setParentList] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/category/")
            .then(response => {
                const list = Array.isArray(response.data) ? response.data : [];
                // 🔥 parentCategoryNo == null 인 애들만 상위 카테고리로 사용
                const parents = list.filter(item => item.parentCategoryNo == null);
                setParentList(parents);
            })
            .catch(err => {
                console.error("카테고리 목록 조회 실패", err);
                toast.error("카테고리 목록을 불러올 수 없습니다.");
            });
    }, []);

    //callback
    const changeValue = useCallback((e) => {
        const { name, value } = e.target;
        setCategory(prev => ({ ...prev, [name]: value }));
    }, []);

    const buildPayload = () => ({
        categoryName: category.categoryName,
        parentCategoryNo:
            category.parentCategoryNo === ""
                ? null
                : Number(category.parentCategoryNo)
    });

    const sendData = useCallback(() => {
        if (category.categoryName.trim().length === 0) {
            toast.warning("카테고리명을 입력하세요.");
            return;
        }

        const payload = buildPayload();

        axios.post("http://localhost:8080/category/", payload)
            .then(() => {
                toast.success("카테고리 등록 완료");
                navigate("/category/list");
            })
            .catch(err => {
                console.error(err);
                toast.error("카테고리 등록 실패");
            });
    }, [category, navigate]);

    return (
        <>
            <Jumbotron
                subject="카테고리 등록"
                detail="새로운 카테고리를 등록합니다."
            />

            {/* 카테고리명 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">카테고리명</label>
                <div className="col-sm-9">
                    <input
                        type="text"
                        name="categoryName"
                        className="form-control"
                        value={category.categoryName}
                        onChange={changeValue}
                    />
                </div>
            </div>

            {/* 상위 카테고리 선택 (상위만 표시) */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">상위 카테고리</label>
                <div className="col-sm-9">
                    <select
                        name="parentCategoryNo"
                        className="form-select"
                        value={category.parentCategoryNo}
                        onChange={changeValue}
                    >
                        <option value="">상위카테고리로 등록</option>
                        {parentList.map(parent => (
                            <option
                                key={parent.categoryNo}
                                value={parent.categoryNo}
                            >
                                [{parent.categoryNo}] {parent.categoryName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 버튼 영역 */}
            <div className="row mt-4">
                <div className="col text-end">
                    <button
                        type="button"
                        className="btn btn-success me-2"
                        onClick={sendData}
                    >
                        <FaPlus className="me-2" />
                        등록하기
                    </button>

                    <Link
                        to="/category/list"
                        className="btn btn-secondary"
                    >
                        <FaList className="me-2" />
                        목록으로
                    </Link>
                </div>
            </div>
        </>
    );
}
