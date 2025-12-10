import { useAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom"
import { loginIdState } from "../../utils/jotai";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Jumbotron from "../templates/Jumbotron";


export default function ReviewWrite() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();

    const [loginId] = useAtom(loginIdState);

    const currentMemberId = loginId;

    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5.0);

    // 별점 입력 핸들러 (숫자 필드용)
    const handleRatingChange = useCallback((e) => {
        const value = parseFloat(e.target.value);
        setReviewRating(value);
    }, []);

    const handleSubmit = useCallback(async () => {

        if (!currentMemberId) {
            toast.error("리뷰 작성을 위해 먼저 로그인 해주세요");
            navigate("http://localhost:8080//member/login");
            return;
        }
        if (!reviewContent.trim()) {
            toast.error("리뷰 내용을 입력해주세요");
            return;
        }
        if (reviewRating < 1.0 || reviewRating > 5.0 || isNaN(reviewRating)) {
            toast.error("별점은 1.0점에서 5.0점 사이의 숫자로 입력해주세요");
            return;
        }
        const payload = {
            restaurantId: parseInt(restaurantId),
            memberId: currentMemberId,
            reviewContent: reviewContent,
            reviewRating: reviewRating
        };

        try {
            await axios.post(`http://localhost:8080/restaurant/${restaurantId}/review/`, payload);
            toast.success("리뷰 작성이 완료되었습니다");
            navigate(`/restaurant/${restaurantId}/review/`);
        }
        catch (error) {
            console.error("리뷰 작성 실패 : ", error);
            toast.error("리뷰 작성에 실패했습니다");
        }


    }, [restaurantId, reviewContent, reviewRating, navigate, currentMemberId]);

    // render
    return (<>
        <Jumbotron subject={`${restaurantId}번 식당 리뷰 작성`} />
        <div className="container mt-5">

            <div className="form-container">

                <div className="row mb-4 align-items-center">

                    <div className="col-md-8">
                        <label htmlFor="reviewRating" className="form-label">
                            ⭐ 별점 (1.0 ~ 5.0)
                        </label>
                        <input
                            type="number"
                            id="reviewRating"
                            className="form-control"
                            value={reviewRating}
                            onChange={handleRatingChange}
                            step="0.5"
                            min="1.0"
                            max="5.0"
                            required
                            disabled={!currentMemberId}
                        />
                    </div>

                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <small className="text-muted">
                            작성자 ID: **{currentMemberId || '로그인 필요'}**
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
                            placeholder="이 식당에 대한 솔직한 의견을 남겨주세요."
                            required
                            disabled={!currentMemberId}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 d-flex justify-content-between">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={!currentMemberId}
                        >
                            리뷰 등록
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

                {/* 로그인 필요 메시지 */}
                {!currentMemberId && (
                    <div className="alert alert-danger mt-3">
                        리뷰를 작성하려면 로그인이 필요합니다.
                    </div>
                )}
            </div>
        </div>

    </>)
}