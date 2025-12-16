import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaPen, FaPlus } from "react-icons/fa6";

export default function CategoryImageList() {
    const [list, setList] = useState([]);
    const navigate = useNavigate();

    const loadData = useCallback(() => {
        axios.get("http://localhost:8080/category/top")
            .then(res => setList(res.data))
            .catch(() => toast.error("카테고리 목록 불러오기 실패"));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const deleteImage = async (categoryNo) => {
        if (!window.confirm("카테고리 이미지를 삭제하시겠습니까?")) return;
        try {
            await axios.delete(
                `http://localhost:8080/admin/category/image/${categoryNo}`,
                { withCredentials: true }
            );
            toast.success("이미지 삭제 완료");
            loadData();
        } catch {
            toast.error("이미지 삭제 실패");
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center my-4">
                <h2>카테고리 이미지 목록</h2>
                <Link to="/category/image/add" className="btn btn-primary">
                    <FaPlus className="me-2" /> 새 이미지 등록
                </Link>
            </div>

            <table className="table table-bordered table-hover text-center align-middle">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>카테고리명</th>
                        <th>이미지</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {list.length === 0 ? (
                        <tr>
                            <td>데이터 없음</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    ) : (
                        list.map(c => (
                            <tr key={c.categoryNo}>
                                <td>{c.categoryNo}</td>
                                <td>{c.categoryName}</td>
                                <td>
                                    {c.attachmentNo ? (
                                        <img
                                            src={`http://localhost:8080/attachment/${c.attachmentNo}`}
                                            style={{ width: 120, borderRadius: 8 }}
                                        />
                                    ) : (
                                        <span className="text-muted">이미지 없음</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() =>
                                            navigate("/category/image/add", {
                                                state: { categoryNo: c.categoryNo }
                                            })
                                        }
                                    >
                                        <FaPen />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteImage(c.categoryNo)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </>
    );
}
