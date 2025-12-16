import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Jumbotron from "../../templates/Jumbotron";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaList } from "react-icons/fa6";

export default function CategoryAdd() {

    const navigate = useNavigate();

    const [category, setCategory] = useState({
        categoryName: "",
        parentCategoryNo: ""
    });

    const [parentList, setParentList] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/category/parent")
            .then(res => setParentList(res.data))
            .catch(() => toast.error("카테고리 목록 조회 실패"));
    }, []);

    const changeValue = useCallback(e => {
        const { name, value } = e.target;
        setCategory(prev => ({ ...prev, [name]: value }));
    }, []);

    const sendData = useCallback(() => {

        if (!category.categoryName.trim()) {
            toast.warning("카테고리명을 입력하세요.");
            return;
        }

        const payload = {
            categoryName: category.categoryName,
            parentCategoryNo:
                category.parentCategoryNo === ""
                    ? null
                    : Number(category.parentCategoryNo)
        };

        axios.post("http://localhost:8080/admin/category", payload, {
            withCredentials: true
        })
        .then(() => {
            toast.success("카테고리 등록 완료");
            navigate("/category/list");
        })
        .catch(() => toast.error("카테고리 등록 실패"));

    }, [category, navigate]);

    return (
        <>
            <Jumbotron subject="카테고리 등록" detail="새로운 카테고리를 등록합니다." />

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
                        {parentList.map(p => (
                            <option key={p.categoryNo} value={p.categoryNo}>
                                {p.categoryName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-success me-2" onClick={sendData}>
                        <FaPlus className="me-2" />등록
                    </button>
                    <Link to="/category/list" className="btn btn-secondary">
                        <FaList className="me-2" />목록
                    </Link>
                </div>
            </div>
        </>
    );
}
