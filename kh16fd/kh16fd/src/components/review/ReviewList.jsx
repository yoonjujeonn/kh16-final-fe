import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify";
import Jumbotron from "../templates/Jumbotron";


export default function ReviewList() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();

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

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return <div className="text-center p-5">리뷰 목록을 불러오는 중...</div>;
    }


    // render
    return (<>
        <Jumbotron subject={`${restaurantId}번 식당의 리뷰 목록`} />

        {reviews.length === 0 ? (
            <div className="alert alert-warning">아직 등록된 리뷰가 없습니다.</div>
        ) : (
            <ul className="list-group">
                {reviews.map((review) => (
                    <li key={review.reviewNo} className="list-group-item d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <h5>{review.memberId} (별점: {review.reviewRating})</h5>
                            <p>{review.reviewContent}</p>
                            <small className="text-muted">작성일: {review.reviewCreatedAt}</small>
                        </div>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(`/restaurant/${restaurantId}/review/edit/${review.reviewNo}`)}
                        >
                            수정
                        </button>
                    </li>
                ))}
            </ul>
        )}

    </>)
}