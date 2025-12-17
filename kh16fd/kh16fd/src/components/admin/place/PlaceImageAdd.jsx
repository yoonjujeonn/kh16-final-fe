import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaPen } from "react-icons/fa6";

export default function PlaceImageAdd() {

    const navigate = useNavigate();
    const location = useLocation();

    // 수정 모드 여부
    const editPlaceId = location.state?.placeId || "";

    const [placeList, setPlaceList] = useState([]);
    const [placeId, setPlaceId] = useState(editPlaceId);
    const [file, setFile] = useState(null);

    // 지역 목록 조회
    useEffect(() => {
        axios.get("http://localhost:8080/place/depth1/list")
            .then(res => setPlaceList(res.data))
            .catch(() => toast.error("지역 목록 불러오기 실패"));
    }, []);

    const sendData = useCallback(() => {
        if (!placeId) {
            toast.warning("지역을 선택하세요.");
            return;
        }
        if (!file) {
            toast.warning("이미지를 선택하세요.");
            return;
        }

        const formData = new FormData();
        formData.append("placeId", placeId);
        formData.append("attach", file);

        axios.post("http://localhost:8080/admin/place/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
        })
            .then(() => {
                toast.success(editPlaceId ? "지역 이미지 수정 완료" : "지역 이미지 등록 완료");
                navigate("/place/image/list");
            })
            .catch(() => toast.error("지역 이미지 처리 실패"));
    }, [placeId, file, navigate, editPlaceId]);

    return (
        <>
            <h2 className="my-4">
                {editPlaceId ? "지역 이미지 수정" : "지역 이미지 등록"}
            </h2>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">지역 *</label>
                <div className="col-sm-9">
                    <select
                        className="form-select"
                        value={placeId}
                        disabled={!!editPlaceId}
                        onChange={e => setPlaceId(e.target.value)}
                    >
                        <option value="">선택</option>
                        {placeList.map(p => (
                            <option key={p.placeId} value={p.placeId}>
                                {p.placeDepth1}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">지역 이미지 *</label>
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
                        {editPlaceId ? <FaPen className="me-2" /> : <FaPlus className="me-2" />}
                        {editPlaceId ? "수정" : "등록"}
                    </button>
                </div>
            </div>
        </>
    );
}
