import { useAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom"
import { loginIdState } from "../../utils/jotai";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Jumbotron from "../templates/Jumbotron";
import StarRatingInput from "./StarRatingInput";



export default function ReviewWrite() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();

    const [loginId] = useAtom(loginIdState);

    const currentMemberId = loginId;

    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(0.0);
    const [attachFile, setAttachFile] = useState(null);

    const changeFile = useCallback((e) => {
        setAttachFile(e.target.files[0] || null);
    }, []);

    const handleSubmit = useCallback(async () => {

        if (!currentMemberId) {
            toast.error("리뷰 작성을 위해 먼저 로그인 해주세요");
            navigate("/member/login");
            return;
        }
        if (!reviewContent.trim()) {
            toast.error("리뷰 내용을 입력해주세요");
            return;
        }
        if (reviewRating < 0.5) {
            toast.error("별점을 0.5점 이상 선택해주세요");
            return;
        }

        // ⭐⭐ JSON 대신 FormData 객체 생성
        const formData = new FormData();

        // 1. DTO 필드를 FormData에 추가 (백엔드 ReviewDto 필드와 이름 일치)
        formData.append('restaurantId', parseInt(restaurantId));
        formData.append('memberId', currentMemberId);
        formData.append('reviewContent', reviewContent);
        formData.append('reviewRating', reviewRating);

        // 2. 파일이 있다면 'attach' 키로 추가 (백엔드 @RequestParam 'attach'와 이름 일치)
        if (attachFile) {
            formData.append('attach', attachFile);
        }

        try {
            // ⭐ Content-Type 헤더를 명시하여 멀티파트 데이터 전송을 확실히 합니다.
            await axios.post(
                `http://192.168.20.12:8080/restaurant/detail/${restaurantId}/review/`,
                formData,
                {
                    headers: {
                        // 파일(FormData) 전송 시 필수적으로 명시하는 것이 좋습니다.
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            toast.success("리뷰 작성이 완료되었습니다");
            navigate(`/restaurant/detail/${restaurantId}/review/`); // 리뷰 목록이나 상세 페이지로 이동
        }
        catch (error) {
            console.error("리뷰 작성 실패 : ", error);
            toast.error("리뷰 작성에 실패했습니다");
        }
        // const payload = {
        //     restaurantId: parseInt(restaurantId),
        //     memberId: currentMemberId,
        //     reviewContent: reviewContent,
        //     reviewRating: reviewRating
        // };

        // try {
        //     await axios.post(`http://192.168.20.12:8080/restaurant/detail/${restaurantId}/review/`, payload);
        //     toast.success("리뷰 작성이 완료되었습니다");
        //     navigate(`/restaurant/detail/${restaurantId}/review/`);
        // }
        // catch (error) {
        //     console.error("리뷰 작성 실패 : ", error);
        //     toast.error("리뷰 작성에 실패했습니다");
        // }


    }, [restaurantId, reviewContent, reviewRating, navigate, currentMemberId, attachFile]);

    // render
    return (<>
        {/* <Jumbotron subject={`${restaurantId}번 식당 리뷰 작성`} /> */}
        <div className="container mt-5">

            <div className="form-container">

                <div className="row mb-4 align-items-center">

                    <div className="col-md-8">
                        <label htmlFor="reviewRating" className="form-label">
                            ⭐ 별점 (0.5 ~ 5.0)
                        </label>
                        <StarRatingInput
                            rating={reviewRating}
                            onRatingChange={setReviewRating} // 리뷰 점수 상태 업데이트 함수 전달
                            disabled={!currentMemberId} // 로그인 여부에 따라 비활성화 여부 전달
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

                {/* ⭐⭐ 2. 파일 입력 요소 추가 */}
                <div className="row mb-3">
                    <div className="col-12">
                        <label htmlFor="attach" className="form-label">
                            📸 이미지 첨부 (선택)
                        </label>
                        <input
                            type="file"
                            id="attach"
                            className="form-control"
                            // ⭐ 파일 선택 시 changeFile 콜백 함수 호출
                            onChange={changeFile}
                            accept="image/*"
                            disabled={!currentMemberId}
                        />
                    </div>
                </div>

                <div className="row mb-4">
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