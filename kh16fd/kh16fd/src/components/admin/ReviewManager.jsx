import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import axios from "axios";
import { toast } from "react-toastify";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { FaStar } from "react-icons/fa6";
import Swal from "sweetalert2";

export default function ReviewManager() {
    const [reviewList, setReviewList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const max_length = 150;
    const [expandedReviews, setExpandedReviews] = useState({});

    const getImageUrl = (attachmentNo) => {
        return `http://localhost:8080/attachment/${attachmentNo}`;
    };

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
            const response = await axios.get("/admin/review/list");
            setReviewList(response.data);
        } catch (err) {
            console.error("관리자 리뷰 목록 로드 실패 : ", err);
            toast.error("관리자 리뷰 목록 로드 실패");
        } finally {
            setLoading(false);
        }
    }, []);

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
                await axios.delete(`/admin/review/${reviewNo}`);

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

    if (loading) {
        return (
            <div className="text-center my-5">
                {/* <ScaleLoader color="#7eb6ac" /> */}
                <p className="mt-3 text-primary">loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger text-center my-5" role="alert">
                {error}
                <button onClick={loadAdminReviews} className="btn btn-sm btn-outline-danger ms-3">다시 시도</button>
            </div>
        );
    }

    // render
    return (<>
        <Jumbotron subject="리뷰 관리자 페이지" />
        <h3 className="my-4">전체 리뷰 관리 ({reviewList.length}건)</h3>
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>식당명</th>
                        <th>작성자</th>
                        <th>평점</th>
                        <th style={{ width: '35%' }}>내용</th>
                        <th>신고 수</th>
                        <th>작성일</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {reviewList.map((review) => {
                        const isExpanded = expandedReviews[review.reviewNo];
                        const content = review.reviewContent;
                        const isLong = content && content.length > max_length;
                        const attachmentNo = review.reviewAttachmentNo;
                        const hasAttachment = attachmentNo && attachmentNo > 0;

                        // 긴 내용 또는 첨부 파일이 있을 경우 '더보기' 버튼을 표시해야 함
                        const needsExpandButton = isLong || hasAttachment;

                        // 표시할 내용 (더보기/접기 로직 적용)
                        const displayContent = isLong && !isExpanded
                            ? content.substring(0, max_length) + '...'
                            : content;

                        return (
                            // 신고 수가 1 이상이면 경고 스타일 적용 (현재 reportCount=0이므로 일반 스타일)
                            <tr key={review.reviewNo} className={review.reportCount > 0 ? 'table-warning' : ''}>
                                <td>{review.reviewNo}</td>
                                <td>{review.restaurantName}</td>
                                <td>{review.memberId}</td>
                                <td><FaStar color="#ffc107" /> {review.reviewRating}</td>

                                {/*  리뷰 내용 영역 (더보기/접기) */}
                                <td>
                                    <div className="d-flex justify-content-between align-items-start">
                                        {/* 내용 표시 */}
                                        {displayContent}

                                        {/* 더보기/접기 버튼 */}
                                        {needsExpandButton && (
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

                                    {/* '더보기' 상태일 때만 사진 표시 */}
                                    {isExpanded && hasAttachment && (
                                        <div className="mt-3">
                                            <img
                                                src={getImageUrl(attachmentNo)}
                                                alt="리뷰 이미지"
                                                className="img-fluid rounded shadow-sm"
                                                style={{ maxWidth: "250px", height: "auto", border: "1px solid #eee" }}
                                            />
                                        </div>
                                    )}
                                </td>

                                {/* 신고 수 표시 (현재 0) */}
                                <td>
                                    {review.reportCount > 0 ?
                                        <span className="badge bg-danger">{review.reportCount}</span>
                                        : review.reportCount
                                    }
                                </td>

                                {/* 작성일 */}
                                <td>
                                    {new Date(review.reviewCreatedAt).toLocaleDateString()}
                                </td>

                                {/* 관리 (삭제 버튼) */}
                                <td>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(review.reviewNo)}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

    </>)
}