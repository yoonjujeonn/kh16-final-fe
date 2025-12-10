import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify";
import Jumbotron from "../templates/Jumbotron";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import Swal from "sweetalert2";
import { FaStar } from "react-icons/fa6";


export default function ReviewList() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();

    const [loginId] = useAtom(loginIdState);

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8080/restaurant/${restaurantId}/review/`);
            setReviews(response.data);
        }
        catch (err) {
            toast.error("리뷰 목록 로딩 실패");
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    const handleDelete = useCallback(async (reviewNo) => {
        const result = await Swal.fire({
            title: "리뷰 삭제",
            text: "정말로 이 리뷰를 삭제하시겠습니까?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545", 
            cancelButtonColor: "#6c757d", 
            confirmButtonText: "삭제",
            cancelButtonText: "취소"
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/restaurant/${restaurantId}/review/${reviewNo}`);
                Swal.fire({
                    title: "삭제 완료!",
                    text: "리뷰가 성공적으로 삭제되었습니다.",
                    icon: "success"
                });
                loadData();
            } catch (error) {
                console.error("리뷰 삭제 실패 : ", error);
                Swal.fire({
                    title: "삭제 실패",
                    text: "리뷰 삭제 중 오류가 발생했습니다.",
                    icon: "error"
                });
            }
        }

    }, [restaurantId, loadData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return <div className="text-center p-5">리뷰 목록을 불러오는 중...</div>;
    }


    // render
    return (<>
        <Jumbotron subject={`${restaurantId}번 식당의 리뷰 목록`} />
        <div className="text-end">
            <Link to={`/restaurant/${restaurantId}/review/write`} className="btn btn-success mt-2">리뷰 작성하기</Link>
        </div>
        {reviews.length === 0 ? (
            <div className="alert alert-warning">아직 등록된 리뷰가 없습니다.</div>
        ) : (
            <ul className="list-group">
                {reviews.map((review) => (
                    <li key={review.reviewNo} className="list-group-item d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <h5>{review.memberId} (<FaStar color="#ffc107"/> {review.reviewRating})</h5>
                            <p>{review.reviewContent}</p>
                            <small className="text-muted">작성일: {review.reviewCreatedAt}</small>
                        </div>

                        {/* 조건부 렌더링 유지 */}
                        {loginId && loginId === review.memberId && (
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => navigate(`/restaurant/${restaurantId}/review/edit/${review.reviewNo}`)}
                                >
                                    수정
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(review.reviewNo)} // 수정된 handleDelete 호출
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        )}

    </>)
}