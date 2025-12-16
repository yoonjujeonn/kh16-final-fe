import { useAtom } from "jotai"
import { loginIdState } from "../../utils/jotai"
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ScaleLoader } from "react-spinners";
import { FaRegBookmark, FaStar } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";


export default function MyWishList() {

    const [loginId] = useAtom(loginIdState);

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        if (!loginId) {
            setWishlist([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/rest/wishlist/myList`,
                {
                    params: {
                        memberId: loginId
                    }
                }
            );
            setWishlist(response.data);
        } catch (err) {
            console.error('위시리스트 로드 실패 : ', err);
            setError("위시리스트를 불러오는 데 실패했습니다");
            setWishlist([]);
        } finally {//(무조건 실행되는 구문) - 로딩 종료
            setLoading(false);
        }
    }, [loginId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="text-center my-5">
                <ScaleLoader color="#7eb6ac" />
                <div className="mt-3">loading...</div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="alert alert-danger text-center my-5" role="alert">
                {error}
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="text-center my-5 p-5 border rounded bg-light">
                <FaRegBookmark className="fs-1 text-secondary mb-3" />
                <h3>저장된 맛집이 없습니다.</h3>
                <p className="text-secondary">마음에 드는 식당을 저장해보세요</p>
            </div>
        );
    }

    // render
    return (<>
        <Jumbotron subject={`${loginId} 님의 위시리스트`} />
        <span className="my-4 fs-2">내 위시리스트</span>
        <span className="ms-2 fs-2 text-secondary mb-2">{wishlist.length}</span>
        <div className="row mt-2">
            {wishlist.map((restaurant) => (
                // 반복되는 각 식당 정보 카드
                <div key={restaurant.restaurantId} className="col-12 col-md-6 col-lg-4 mb-4">
                    <div className="card shadow-sm h-100">
                        {/* 상세 페이지로 이동 링크 */}
                        <Link to={`/restaurant/detail/${restaurant.restaurantId}`}>
                            <img
                                // 이미지 주소는 백엔드 파일 서버 경로를 사용합니다.
                                src={`http://localhost:8080/restaurant/image/${restaurant.restaurantId}`}
                                className="card-img-top"
                                alt={restaurant.restaurantName}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                        </Link>
                        <div className="card-body">
                            <h5 className="card-title">{restaurant.restaurantName}</h5>
                            <p className="card-text text-muted small mb-1">{restaurant.restaurantAddress}</p>
                            <p className="card-text text-warning">
                                <FaStar color="#ffc107" /> {restaurant.restaurantAvgRating ? restaurant.restaurantAvgRating.toFixed(1) : '평가 없음'}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </>
    );
}