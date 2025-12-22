import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaPen, FaPlus } from "react-icons/fa6";

export default function PlaceImageList() {

    const [list, setList] = useState([]);
    const navigate = useNavigate();

    const loadData = useCallback(() => {
        axios.get("http://192.168.20.12:8080/place/top")
            .then(res => setList(res.data))
            .catch(() => toast.error("지역 목록 불러오기 실패"));
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const deleteImage = async (placeId) => {
        if (!window.confirm("지역 이미지를 삭제하시겠습니까?")) return;
        try {
            await axios.delete(
                `http://192.168.20.12:8080/admin/place/image/${placeId}`,
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
                <h2>지역 이미지 목록</h2>
                <Link to="/place/image/add" className="btn btn-primary">
                    <FaPlus className="me-2" /> 새 이미지 등록
                </Link>
            </div>

            <table className="table table-bordered table-hover text-center align-middle">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>지역명</th>
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
                        list.map(p => (
                            <tr key={p.placeId}>
                                <td>{p.placeId}</td>
                                <td>
                                    {p.placeDepth1}
                                    {p.placeDepth2 && ` > ${p.placeDepth2}`}
                                    {p.placeDepth3 && ` > ${p.placeDepth3}`}
                                </td>
                                <td>
                                    {p.attachmentNo ? (
                                        <img
                                            src={`http://192.168.20.12:8080/attachment/${p.attachmentNo}`}
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
                                            navigate("/place/image/add", {
                                                state: { placeId: p.placeId }
                                            })
                                        }
                                    >
                                        <FaPen />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteImage(p.placeId)}
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
