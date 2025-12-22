import { useNavigate, useParams } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import StarRatingInput from "./StarRatingInput";


export default function ReviewEdit() {
    const { restaurantId, reviewNo } = useParams();
    const navigate = useNavigate();
    const [loginId] = useAtom(loginIdState);
    const currentMemberId = loginId;

    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(0.0);
    const [loading, setLoading] = useState(true);

    const [existingAttachmentNo, setExistingAttachmentNo] = useState(null); // 기존 이미지 번호
    const [newFile, setNewFile] = useState(null); // 새로 선택한 파일 객체
    const [previewUrl, setPreviewUrl] = useState(null); // 미리보기용 URL
    const fileInputRef = useRef(); // 파일 입력창 초기화를 위한 Ref


    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://192.168.20.12:8080/restaurant/detail/${restaurantId}/review/${reviewNo}`);
            const data = response.data;
            if (data.memberId !== currentMemberId) {
                toast.error("수정 권한이 없습니다");
                navigate(`/restaurant/detail/${restaurantId}/review`);
                return;
            }
            setReviewContent(data.reviewContent);
            setReviewRating(data.reviewRating);

            // ⭐ 기존 이미지가 없으면 null로 확실히 초기화
        if (data.reviewAttachmentNo) {
            setExistingAttachmentNo(data.reviewAttachmentNo);
            setPreviewUrl(`http://192.168.20.12:8080/attachment/${data.reviewAttachmentNo}`);
        } else {
            setExistingAttachmentNo(null);
            setPreviewUrl(null);
        }
        } catch (error) {
            console.error("리뷰 로딩 실패 : ", error);
            toast.error("리뷰 데이터를 불러오는데 실패했습니다");
            navigate(`/restaurant/detail/${restaurantId}/review`);
        } finally {
            setLoading(false);
        }
    }, [restaurantId, reviewNo, currentMemberId, navigate]);

    useEffect(() => {
        if (currentMemberId) {
            loadData();
        } else {
            toast.error("로그인이 필요합니다");
            navigate("/member/login");
        }
    }, [currentMemberId, loadData, navigate]);

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewFile(file);
            // 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // 이미지 삭제(초기화) 핸들러
    const handleRemoveImage = () => {
        setNewFile(null);
        setPreviewUrl(null);
        setExistingAttachmentNo(null); // 백엔드 서비스의 2-2 로직(삭제)을 태우기 위해 null 처리
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // 별점 입력
    const handleRatingChange = useCallback((ratingValue) => {
        setReviewRating(ratingValue);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!reviewContent.trim()) {
            toast.error("리뷰 내용을 입력해주세요.");
            return;
        }
        if (reviewRating < 0.5 || isNaN(reviewRating)) {
            toast.error("별점은 0.5점 이상 선택해주세요");
            return;
        }

        const formData = new FormData();

        // 1. ReviewDto에 매핑될 데이터들 (문자열로 전송되지만 백엔드에서 DTO로 자동 변환됨)
        formData.append("reviewNo", reviewNo);
        formData.append("restaurantId", restaurantId);
        formData.append("memberId", currentMemberId);
        formData.append("reviewContent", reviewContent);
        formData.append("reviewRating", reviewRating);

        if (newFile) {
            // 새 파일이 있는 경우 (Service 2-1)
            formData.append("newAttach", newFile);
        } else if (existingAttachmentNo === null) {
            // 이미지를 삭제한 경우 (Service 2-2)
            // reviewAttachmentNo를 보내지 않거나 null로 인지하게 함
        } else {
            // 기존 이미지 유지 (Service 2-3)
            formData.append("reviewAttachmentNo", existingAttachmentNo);
        }

        try {
            await axios.put(`/restaurant/detail/${restaurantId}/review/${reviewNo}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("리뷰 수정이 완료되었습니다");
            navigate(`/restaurant/detail/${restaurantId}/review`);
        } catch (error) {
            console.error("리뷰 수정 실패:", error);
            toast.error("리뷰 수정에 실패했습니다");
        }
    }, [restaurantId, reviewNo, reviewContent, reviewRating, navigate, currentMemberId,newFile, existingAttachmentNo]);

    if (loading) {
        return <div className="text-center p-5">리뷰 데이터를 불러오는 중</div>
    }


    // render
    return (<>
        <div className="title-wrapper mt-4">
        <h1 className="text-primary p-4 rounded" style={{backgroundColor : "#cee4d557"}}>리뷰 수정 (#{reviewNo})</h1>
        </div>
        <div className="container mt-4 border rounded p-4">
            <div className="form-container">

                <div className="row mb-4 align-items-center">

                    <div className="col-md-8">
                        <label htmlFor="reviewRating" className="form-label">
                            ⭐ 별점 (1.0 ~ 5.0)
                        </label>
                        <StarRatingInput
                            rating={reviewRating}
                            onRatingChange={handleRatingChange} // 숫자 값을 직접 받음
                        />
                    </div>

                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <small className="text-muted">
                            작성자 ID: **{currentMemberId}**
                        </small>
                    </div>
                </div>

                {/* 이미지 수정 영역 추가 */}
                <div className="row mb-4">
                    <div className="col-12">
                        <label className="form-label">🖼️ 리뷰 사진</label>
                        <input 
                            type="file" 
                            className="form-control" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                        {previewUrl && (
                            <div className="mt-3 position-relative d-inline-block">
                                <img src={previewUrl} alt="미리보기" className="rounded shadow-sm" style={{ maxWidth: '200px' }} />
                                <button 
                                    type="button" 
                                    className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                    onClick={handleRemoveImage}
                                >X</button>
                            </div>
                        )}
                    </div>
                </div>



                <div className="row mb-3">
                    <div className="col-12">
                        <label htmlFor="reviewContent" className="form-label">
                            📝 리뷰 내용
                        </label>
                        <textarea
                            id="reviewContent"
                            className="form-control"
                            rows="5"
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            placeholder="수정할 내용을 입력해주세요."
                            required
                        />
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12 d-flex justify-content-between">
                        <button
                            type="button"
                            className="btn btn-warning"
                            onClick={handleSubmit}
                        >
                            리뷰 수정 완료
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>)
}