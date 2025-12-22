import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaPen } from "react-icons/fa6";

export default function CategoryImageAdd() {

    const navigate = useNavigate();
    const location = useLocation();

    // 수정 모드 여부
    const editCategoryNo = location.state?.categoryNo || "";

    const [categoryList, setCategoryList] = useState([]);
    const [categoryNo, setCategoryNo] = useState(editCategoryNo);
    const [file, setFile] = useState(null);

    useEffect(() => {
        axios.get("http://192.168.20.12:8080/category/parent")
            .then(res => setCategoryList(res.data))
            .catch(() => toast.error("카테고리 목록 불러오기 실패"));
    }, []);

    const sendData = useCallback(() => {
        if (!categoryNo) {
            toast.warning("카테고리를 선택하세요.");
            return;
        }
        if (!file) {
            toast.warning("이미지를 선택하세요.");
            return;
        }

        const formData = new FormData();
        formData.append("categoryNo", categoryNo);
        formData.append("attach", file);

        axios.post("http://192.168.20.12:8080/admin/category/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
        })
            .then(() => {
                toast.success(editCategoryNo ? "이미지 수정 완료" : "이미지 등록 완료");
                navigate("/category/image/list");
            })
            .catch(() => toast.error("카테고리 이미지 처리 실패"));
    }, [categoryNo, file, navigate, editCategoryNo]);

    return (
        <>
            <h2 className="my-4">
                {editCategoryNo ? "카테고리 이미지 수정" : "카테고리 이미지 등록"}
            </h2>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">카테고리 *</label>
                <div className="col-sm-9">
                    <select
                        className="form-select"
                        value={categoryNo}
                        disabled={!!editCategoryNo}
                        onChange={e => setCategoryNo(e.target.value)}
                    >
                        <option value="">선택</option>
                        {categoryList.map(c => (
                            <option key={c.categoryNo} value={c.categoryNo}>
                                {c.categoryName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">카테고리 이미지 *</label>
                <div className="col-sm-9">
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={e => setFile(e.target.files[0])}
                    />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-success" onClick={sendData}>
                        {editCategoryNo ? <FaPen className="me-2" /> : <FaPlus className="me-2" />}
                        {editCategoryNo ? "수정" : "등록"}
                    </button>
                </div>
            </div>
        </>
    );
}
