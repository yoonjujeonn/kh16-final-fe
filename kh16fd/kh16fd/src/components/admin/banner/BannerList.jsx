import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTrash, FaPlus } from "react-icons/fa6";

export default function BannerList() {

    const [list, setList] = useState([]);

    const loadData = useCallback(() => {
        axios.get("http://localhost:8080/banner/list")
            .then(res => setList(res.data))
            .catch(() => toast.error("배너 목록 불러오기 실패"));
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const deleteBanner = async (bannerNo) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await axios.delete(
                `http://localhost:8080/admin/banner/${bannerNo}`,
                { withCredentials: true }
            );
            toast.success("삭제 완료");
            loadData();
        } catch (err) {
            console.error(err);
            toast.error("삭제 실패");
        }
    };

    const getImageUrl = (attachmentNo) =>
        `http://localhost:8080/attachment/${attachmentNo}`;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center my-4">
                <h2>배너 목록</h2>
                <Link to="/banner/add" className="btn btn-primary">
                    <FaPlus className="me-2" /> 새 배너 등록
                </Link>
            </div>

            <table className="table table-bordered table-hover text-center">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>이미지</th>
                        <th>제목</th>
                        <th>링크</th>
                        <th>순서</th>
                        <th>관리</th>
                    </tr>
                </thead>

                <tbody>
                    {list.length === 0 ? (
                        <tr>
                            <td colSpan="6">등록된 배너가 없습니다.</td>
                        </tr>
                    ) : (
                        list.map(banner => (
                            <tr key={banner.bannerNo}>
                                <td>{banner.bannerNo}</td>
                                <td>
                                    {banner.bannerAttachmentNo ? (
                                        <img
                                            src={getImageUrl(banner.bannerAttachmentNo)}
                                            alt=""
                                            style={{ width: 150, borderRadius: 8 }}
                                        />
                                    ) : (
                                        <span className="text-muted">이미지 없음</span>
                                    )}
                                </td>
                                <td>{banner.bannerTitle}</td>
                                <td>{banner.bannerLink}</td>
                                <td>{banner.bannerOrder}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteBanner(banner.bannerNo)}
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
