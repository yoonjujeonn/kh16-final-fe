import { useNavigate, useParams } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
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

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/restaurant/detail/${restaurantId}/review/${reviewNo}`);
            const data = response.data;
            if (data.memberId !== currentMemberId) {
                toast.error("수정 권한이 없습니다");
                navigate(`/restaurant/detail/${restaurantId}/review`);
                return;
            }
            setReviewContent(data.reviewContent);
            setReviewRating(data.reviewRating);
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

    // 별점 입력
    const handleRatingChange = useCallback((ratingValue) => {
        setReviewRating(ratingValue);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!reviewContent.trim()) {
            toast.error("리뷰 내용을 입력해주세요.");
            return;
        }
        if (reviewRating <0.5 || isNaN(reviewRating)) {
            toast.error("별점은 0.5점 이상 선택해주세요");
            return;
        }

        const payload = {
            reviewNo: parseInt(reviewNo),
            restaurantId: parseInt(restaurantId),
            memberId: currentMemberId,
            reviewContent: reviewContent,
            reviewRating: reviewRating
        };

        try {
            await axios.put(`/restaurant/detail/${restaurantId}/review/${reviewNo}`, payload);

            toast.success("리뷰 수정이 완료되었습니다");
            navigate(`/restaurant/detail/${restaurantId}/review`);

        } catch (error) {
            console.error("리뷰 수정 실패:", error);
            toast.error("리뷰 수정에 실패했습니다");
        }
    }, [restaurantId, reviewNo, reviewContent, reviewRating, navigate, currentMemberId]);

    if (loading) {
        return <div className="text-center p-5">리뷰 데이터를 불러오는 중</div>
    }


    // render
    return (<>
        <Jumbotron subject={`${restaurantId}번 식당 리뷰 수정 (#${reviewNo})`} />
        <div className="container mt-5">
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