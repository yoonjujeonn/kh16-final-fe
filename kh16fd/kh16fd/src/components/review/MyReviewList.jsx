import { useAtom } from "jotai"
import { loginIdState } from "../../utils/jotai"
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Jumbotron from "../templates/Jumbotron";
import { Link, useNavigate } from "react-router-dom";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { FaStar } from "react-icons/fa6";
import Swal from "sweetalert2";


export default function MyReviewList() {

    const navigate = useNavigate();
    const [loginId] = useAtom(loginIdState);


    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const max_length = 150; // 최대 길이 정의
    const [expandedReviews, setExpandedReviews] = useState({}); // 더보기/접기 상태

    const getImageUrl = (attachmentNo) => {
        return `http://localhost:8080/attachment/${attachmentNo}`;
    };


    // ------------------------------------
    // 2. 기능 로직 (데이터 로딩, 삭제, 토글)
    // ------------------------------------

    // 리뷰 내용 더보기/접기 토글 함수
    const toggleExpand = useCallback((reviewNo) => {
        setExpandedReviews(prev => ({
            ...prev,
            [reviewNo]: !prev[reviewNo]
        }));
    }, []);

    // 2. 데이터 로딩 함수 (기존 fetchReviews를 loadData로 변경하고 useCallback으로 감쌈)
    const loadData = useCallback(async () => {
        if (!loginId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `/restaurant/detail/1/review/myList`,
                {
                    params: {
                        memberId: loginId
                    }
                }
            );
            setReviews(response.data);
        } catch (err) {
            console.error("리뷰 목록 로드 실패:", err);
            setError("리뷰 목록을 불러오지 못했습니다.");
            toast.error("리뷰 목록 로딩 실패"); // toast 사용
        } finally {
            setLoading(false);
        }
    }, [loginId]); // loginId 의존성 추가 (변경될 때마다 loadData 재생성)

    // 2. 리뷰 삭제 처리 함수
    const handleDelete = useCallback(async (reviewNo, restaurantId) => { // restaurantId를 인수로 받도록 수정
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
                await axios.delete(`/restaurant/detail/${restaurantId}/review/${reviewNo}`);

                Swal.fire({
                    title: "삭제 완료!",
                    text: "리뷰가 성공적으로 삭제되었습니다.",
                    icon: "success"
                });

                loadData(); // 목록 새로고침
            } catch (error) {
                console.error("리뷰 삭제 실패 : ", error);
                Swal.fire({
                    title: "삭제 실패",
                    text: "리뷰 삭제 중 오류가 발생했습니다.",
                    icon: "error"
                });
            }
        }
    }, [loadData]);


    useEffect(() => {
        loadData();
    }, [loadData]);


    if (loading) return <div>리뷰 목록을 불러오는 중...</div>;
    if (error) return <div className="text-danger">{error}</div>;

    // render
    return (<>
        <Jumbotron subject={`${loginId} 님이 작성한 리뷰 목록`} />

        {reviews.length === 0 ? (
            <div className="alert alert-info mt-4">
                아직 작성된 리뷰가 없습니다.
            </div>
        ) : (
            <div className="row mt-4">
                <div className="col">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}></th>
                                <th style={{ width: '15%' }}></th>
                                <th style={{ width: '35%' }}></th>
                                <th style={{ width: '10%' }}></th>
                                <th style={{ width: '15%' }}></th>
                                <th style={{ width: '20%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review, index) => {
                                const isExpanded = expandedReviews[review.reviewNo];
                                const content = review.reviewContent;
                                const isLong = content.length > max_length;

                                const displayContent = isLong && !isExpanded
                                    ? content.substring(0, max_length) + '...'
                                    : content;
                                
                                const rawDate = review.reviewCreatedAt ? review.reviewCreatedAt.substring(0, 10) : '날짜정보 없음';
                                const formattedCreatedAt = rawDate.replace(/-/g, '.');
                                
                                // 첨부파일 확인
                                const attachmentNo = review.reviewAttachmentNo;
                                const hasAttachment = attachmentNo && attachmentNo > 0;

                                return (
                                    <tr key={review.reviewNo}>
                                        <td>{reviews.length - index}</td>
                                        {/* 식당 ID 링크 */}
                                        <td>
                                            <Link to={`/restaurant/detail/${review.restaurantId}`}>
                                                식당 #{review.restaurantId}
                                            </Link>
                                        </td>
                                        {/* 리뷰 내용 및 더보기/접기 버튼 */}
                                        <td>
                                            <div className="d-flex justify-content-between align-items-start">
                                            {displayContent}

                                            {/* 1. 글이 길거나 사진이 있는 경우 '더보기' 버튼 표시 */}
                                            {(isLong || hasAttachment) && (
                                                <button
                                                    className="btn btn-link btn-sm p-0 ms-2 text-secondary"
                                                    onClick={() => toggleExpand(review.reviewNo)}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    {isExpanded ? '접기' : '더보기'}
                                                    {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                                                </button>
                                            )}
                                        </div>

                                            {/* 2. '더보기' 상태일 때만 사진 표시 */}
                                            {isExpanded && hasAttachment && (
                                                <div className="mt-3 animate__animated animate__fadeIn">
                                                    <img
                                                        src={getImageUrl(attachmentNo)}
                                                        alt="리뷰 이미지"
                                                        className="img-fluid rounded shadow-sm"
                                                        style={{ maxWidth: "250px", height: "auto", border: "1px solid #eee" }}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        {/* 평점 */}
                                        <td><FaStar color="#ffc107" /> {review.reviewRating}</td>
                                        {/* 작성일 */}
                                        <td>{formattedCreatedAt}</td>
                                        {/* 관리 버튼 */}
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => navigate(`/restaurant/detail/${review.restaurantId}/review/edit/${review.reviewNo}`)}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(review.reviewNo, review.restaurantId)}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </>)
}