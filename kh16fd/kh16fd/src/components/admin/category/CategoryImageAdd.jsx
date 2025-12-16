import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa6";

export default function CategoryImageAdd() {

    const navigate = useNavigate();

    const [categoryList, setCategoryList] = useState([]);
    const [categoryNo, setCategoryNo] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:8080/category/parent")
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

        axios.post("http://localhost:8080/admin/category/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
        })
            .then(() => {
                toast.success("카테고리 이미지 등록 완료");
                navigate("/category/image/list");
            })
            .catch(() => toast.error("카테고리 이미지 등록 실패"));
    }, [categoryNo, file, navigate]);

    return (
        <>
            <h2 className="my-4">카테고리 이미지 등록</h2>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">카테고리 *</label>
                <div className="col-sm-9">
                    <select
                        className="form-select"
                        value={categoryNo}
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
                        <FaPlus className="me-2" />등록
                    </button>
                </div>
            </div>
        </>
    );
}
