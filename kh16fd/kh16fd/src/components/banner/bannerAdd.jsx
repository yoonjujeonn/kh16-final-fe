import { useCallback, useState } from "react";
import axios from "axios";
import Jumbotron from "../templates/Jumbotron";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaList } from "react-icons/fa6";

export default function BannerAdd() {

    const navigate = useNavigate();

    //state
    const [banner, setBanner] = useState({
        bannerTitle: "",
        bannerLink: "",
        bannerOrder: 1,
        attach: null
    });

    //callback
    const changeValue = useCallback((e) => {
        const { name, value } = e.target;

        setBanner(prev => ({
            ...prev,
            [name]: name === "bannerOrder" ? Number(value) : value
        }));
    }, []);

    const changeFile = useCallback((e) => {
        setBanner(prev => ({ ...prev, attach: e.target.files[0] }));
    }, []);

    const buildFormData = () => {
        const formData = new FormData();
        formData.append("bannerTitle", banner.bannerTitle);
        formData.append("bannerLink", banner.bannerLink);
        formData.append("bannerOrder", banner.bannerOrder);
        if (banner.attach) {
            formData.append("attach", banner.attach);
        }
        return formData;
    };

    const sendData = useCallback(() => {

        if (banner.bannerTitle.trim().length === 0) {
            toast.warning("배너 제목을 입력하세요.");
            return;
        }
        if (!banner.attach) {
            toast.warning("배너 이미지를 선택하세요.");
            return;
        }

        const formData = buildFormData();

        axios.post("http://localhost:8080/banner/add", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
        })
            .then(() => {
                toast.success("배너 등록 완료");
                navigate("/banner/list");
            })
            .catch(err => {
                console.error(err);
                toast.error("배너 등록 실패");
            });
    }, [banner, navigate]);

    return (
        <>
            <Jumbotron
                subject="배너 등록"
                detail="새로운 배너를 등록합니다."
            />

            {/* 배너 제목 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">배너 제목 *</label>
                <div className="col-sm-9">
                    <input
                        type="text"
                        name="bannerTitle"
                        className="form-control"
                        placeholder="배너 제목을 입력하세요"
                        value={banner.bannerTitle}
                        onChange={changeValue}
                    />
                </div>
            </div>

            {/* 배너 링크 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">배너 링크</label>
                <div className="col-sm-9">
                    <input
                        type="text"
                        name="bannerLink"
                        className="form-control"
                        placeholder="/restaurant/list"
                        value={banner.bannerLink}
                        onChange={changeValue}
                    />
                </div>
            </div>

            {/* 배너 순서 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">배너 순서</label>
                <div className="col-sm-9">
                    <input
                        type="number"
                        name="bannerOrder"
                        min="1"
                        className="form-control"
                        value={banner.bannerOrder}
                        onChange={changeValue}
                    />
                </div>
            </div>

            {/* 배너 이미지 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">배너 이미지 *</label>
                <div className="col-sm-9">
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={changeFile}
                    />
                    <div className="form-text">
                        이미지 파일만 업로드 가능합니다 (jpg, png, gif 등)
                    </div>
                </div>
            </div>

            {/* 버튼 */}
            <div className="row mt-4">
                <div className="col text-end">
                    <button type="button" className="btn btn-success me-2" onClick={sendData}>
                        <FaPlus className="me-2" /><span>등록</span>
                    </button>

                    <Link
                        to="/banner/list" className="btn btn-secondary">
                        <FaList className="me-2" /><span>목록</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
