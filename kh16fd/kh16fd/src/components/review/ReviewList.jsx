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

    const [profileMap, setProfileMap] = useState({});

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
            const response = await axios.get(`http://192.168.20.12:8080/restaurant/detail/${restaurantId}/review/`);
            setReviews(response.data);

            const ids = [...new Set(response.data.map(r => r.memberId))];
            ids.forEach(async (id) => {
                try {
                    const res = await axios.get(`http://192.168.20.12:8080/memberProfile/${id}`);
                    setProfileMap(prev => ({ ...prev, [id]: res.data.attachmentNo }));
                } catch (e) { }
            });
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
                await axios.delete(`http://192.168.20.12:8080/restaurant/detail/${restaurantId}/review/${reviewNo}`);
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

    const getImageUrl = (attachmentNo) => {
        // 백엔드에서 '/attachment/{파일번호}'로 이미지 파일을 제공한다고 가정합니다.
        return `http://192.168.20.12:8080/attachment/${attachmentNo}`;
    };
    const getUrl = (no) => no ? `http://192.168.20.12:8080/attachment/${no}` : "https://dummyimage.com/100/ccc/fff&text=no";

    if (loading) {
        return <div className="text-center p-5">리뷰 목록을 불러오는 중...</div>;
    }


    // render
    return (<>
        {/* <Jumbotron subject={`${restaurantId}번 식당의 리뷰 목록`} /> */}
        {reviews.length === 0 ? (
            <div className="p-4 alert alert-warning mt-3">아직 등록된 리뷰가 없습니다.</div>
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

                    const attachmentNo = review.reviewAttachmentNo;
                    const hasAttachment = attachmentNo && attachmentNo > 0;

                    return (

                        <li key={review.reviewNo} className="py-4 border-bottom">
                            {/* 1. 프로필 상단 영역 */}
                            <div className="d-flex align-items-center mb-2">
                                <img src={getUrl(profileMap[review.memberId])} className="rounded-circle border me-2" style={{ width: "35px", height: "35px", objectFit: "cover" }} />
                                <span className="fw-bold me-2">{review.memberId}</span>
                                {loginId === review.memberId && (
                                    <div className="d-flex gap-1" style={{ fontSize: '0.85rem' }}>
                                        <span className="text-muted" style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/restaurant/detail/${restaurantId}/review/edit/${review.reviewNo}`)}>
                                            수정
                                        </span>
                                        <span className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(review.reviewNo)} >
                                            삭제
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 2. 점수 및 날짜 */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="text-warning fw-bold">
                                    <FaStar className="me-1" />{review.reviewRating.toFixed(1)}
                                </div>
                                <small className="text-muted">{formattedCreatedAt}</small>
                            </div>

                            {/* 3. 리뷰 이미지 (본문 위) */}
                            {hasAttachment && (
                                <div className="mb-3">
                                    <img src={getUrl(review.reviewAttachmentNo)} className="rounded shadow-sm" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                                </div>
                            )}

                            {/* 4. 리뷰 텍스트 */}
                            <div style={{ whiteSpace: "pre-wrap" }}>
                                {displayContent}
                                {content.length > max_length && (
                                    <button className="btn btn-link btn-sm text-secondary p-0 ms-1 shadow-none" onClick={() => toggleExpand(review.reviewNo)}>
                                        {isExpanded ? <><MdExpandLess />접기</> : <><MdExpandMore />더보기</>}
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        )}
        {/* 로그인 상태일 때만 리뷰 작성하기 버튼 표시 */}
        {loginId && (
            <div className="text-end">
                <Link to={`/restaurant/detail/${restaurantId}/review/write`} className="btn btn-success mt-2">
                    리뷰 작성하기
                </Link>
            </div>
        )}
    </>)
}