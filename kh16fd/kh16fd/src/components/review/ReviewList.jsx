import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify";
import Jumbotron from "../templates/Jumbotron";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import Swal from "sweetalert2";
import { FaStar } from "react-icons/fa6";
import { MdExpandLess, MdExpandMore } from "react-icons/md";


export default function ReviewList() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();

    const [loginId] = useAtom(loginIdState);

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const max_length = 150;
    const [expandedReviews, setExpandedReviews] = useState({});

    const toggleExpand = useCallback((reviewNo) => {
        setExpandedReviews(prev => ({
            ...prev,
            [reviewNo]: !prev[reviewNo]
        }));
    }, []);
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8080/restaurant/detail/${restaurantId}/review/`);
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
                await axios.delete(`http://localhost:8080/restaurant/detail/${restaurantId}/review/${reviewNo}`);
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
        {/* <Jumbotron subject={`${restaurantId}번 식당의 리뷰 목록`} /> */}
        {/* 로그인 상태일 때만 리뷰 작성하기 버튼 표시 */}
        {loginId && (
            <div className="text-end">
                <Link to={`/restaurant/detail/${restaurantId}/review/write`} className="btn btn-success mt-4">
                    리뷰 작성하기
                </Link>
            </div>
        )}
        {reviews.length === 0 ? (
            <div className="alert alert-warning">아직 등록된 리뷰가 없습니다.</div>
        ) : (
            <ul className="list-unstyled">
                {reviews.map((review, index) => {
                    // 현재 리뷰가 확장 상태인지 확인
                    const isExpanded = expandedReviews[review.reviewNo];
                    const content = review.reviewContent;
                    const isLong = content.length > max_length; // max_length를 사용합니다.

                    // 표시할 내용 결정: 길고 접힌 상태면 자르고, 아니면 전체 표시
                    const displayContent = isLong && !isExpanded
                        ? content.substring(0, max_length) + '...'
                        : content;

                    const rawDate = review.reviewCreatedAt ? review.reviewCreatedAt.substring(0, 10) : '날짜정보 없음';
                    const formattedCreatedAt = rawDate.replace(/-/g, '.'); // 모든 '-'를 '.'으로 치환

                    const isLast = index === reviews.length - 1;

                    return (

                        <li key={review.reviewNo}
                            className="py-3" // 상하 패딩 (구분선과의 간격 확보)
                            style={{
                                borderBottom: isLast ? 'none' : '1px solid #e0e0e0'
                            }} // 얇은 회색 구분선 추가
                        >
                            <div>
                                {/* 닉네임과 버튼을 묶는 d-flex 컨테이너 (이전에 <h5>였던 부분을 div로 감싸고, 버튼을 안에 넣음) */}
                                <div className="d-flex align-items-center mb-1">

                                    {/* 닉네임, 별점 부분 */}
                                    <h5 className="mb-0 me-3">
                                        {review.memberId} (<FaStar color="#ffc107" /> {review.reviewRating})
                                    </h5>

                                    {/* 수정/삭제 버튼 그룹 */}
                                    {loginId && loginId === review.memberId && (
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => navigate(`/restaurant/detail/${restaurantId}/review/edit/${review.reviewNo}`)}
                                            >
                                                수정
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(review.reviewNo)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* [수정] 리뷰 내용: 더보기 버튼을 분리하기 위해 텍스트만 표시 */}
                                <p className="mt-2 mb-0">
                                    {displayContent}
                                </p>

                                {/* [추가] 더보기/접기 버튼을 오른쪽 끝에 배치하기 위한 <div> */}
                                {isLong && (
                                    <div className="text-end mt-2">
                                        <button
                                            className="text-secondary" 
                                            style={{ background: 'none', border: 'none', cursor: 'pointer' }} 
                                            onClick={() => toggleExpand(review.reviewNo)}
                                        >
                                            {isExpanded ? '접기' : '더보기'}
                                            <span className="ms-1">
                                                {isExpanded ?
                                                    <MdExpandLess /> : // 위쪽 화살표 (접기 상태)
                                                    <MdExpandMore />  // 아래쪽 화살표 (더보기 상태)
                                                }
                                            </span>
                                        </button>
                                    </div>
                                )}
                                <small className="text-muted">{formattedCreatedAt}</small>
                            </div>
                        </li>
                    );
                })}
            </ul>
        )}

    </>)
}