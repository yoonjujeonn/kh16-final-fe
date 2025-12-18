import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import { FaBookmark, FaPhoneAlt, FaRegBookmark, FaStar } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";

export default function RestaurantDetail() {
    const [restaurant, setRestaurant] = useState(null);
    const [moreInfo, setMoreInfo] = useState(null);
    const { restaurantId } = useParams();

    // wishlist 관련 state
    const [loginId] = useAtom(loginIdState);
    const [isWish, setIsWish] = useState(false);
    const [wishCount, setWishCount] = useState(0);

    // 오늘 표시
    const index = new Date().getDay();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const today = days[index];

    const checkWish = useCallback(async () => {
        try {
            const response = await axios.post("/rest/wishlist/check", {
                memberId: loginId,
                restaurantId
            });
            setIsWish(response.data.isWish);
            setWishCount(response.data.count);
        } catch { }
    }, [loginId, restaurantId]);

    const toggleWish = async () => {
        if (!loginId) {
            toast.warning("로그인 후 이용 가능합니다.");
            return;
        }

        const response = await axios.post("/rest/wishlist/toggle", {
            memberId: loginId,
            restaurantId
        });

        setIsWish(response.data.isWish);
        setWishCount(response.data.count);
    };

    const loadData = useCallback(async () => {
        const { data } = await axios.get(`/restaurant/detail/${restaurantId}`);
        const { restaurantDto, ...rest } = data;
        setRestaurant(restaurantDto);
        setMoreInfo(rest);
    }, [restaurantId]);

    useEffect(() => {
        loadData();
        checkWish();
    }, [loadData, checkWish]);

    const openHours = useMemo(() => {
        if (!restaurant) return;
        return restaurant.restaurantOpeningDays.includes(today)
            ? `${restaurant.restaurantOpen} ~ ${restaurant.restaurantClose}`
            : "휴무일";
    }, [restaurant, today]);

    if (!restaurant) {
        return (
            <div className="row my-4">
                <div className="col text-center">
                    <ScaleLoader size={100} color="#7eb6ac" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container">

                <div className="row border mb-4 p-3">
                    <div className="col">
                        <img
                            src={`http://localhost:8080/restaurant/image/${restaurantId}`}
                            className="w-100 mb-4"
                        />
                        <h1>{restaurant.restaurantName}</h1>

                        <div className="d-flex align-items-center">
                            <FaStar className="text-warning me-2" />
                            {moreInfo.restaurantAvgRating.toFixed(1)}
                            <span className="ms-2">리뷰 {moreInfo.reviewCount}개</span>
                        </div>

                        <div className="mt-2">{restaurant.restaurantDescription}</div>

                        <div className="mt-2">
                            오늘 ({today}) · {openHours}
                            <IoIosArrowDown className="ms-2" />
                        </div>
                    </div>
                </div>

                <div className="row p-2 bg-white border">
                    <div className="d-flex justify-content-between">
                        <div className="divst-group-item">홈</div>
                        <div className="divst-group-item">소식</div>
                        <Link to={`/restaurant/detail/${restaurantId}/menu`}>메뉴</Link>
                        <div className="divst-group-item">사진</div>
                        <Link to={`/restaurant/detail/${restaurantId}/review`}>리뷰</Link>
                        <div className="divst-group-item">매장정보</div>
                    </div>
                </div>

                <Outlet />

                <div className="row p-4 border">
                    <div className="col">
                        <h1>예약</h1>
                        <div className="my-4 info border p-2 w-50 rounded text-center">
                            <span>날짜 · 시간 · 인원</span>
                        </div>
                        <span className="badge bg-info border p-2 rounded text-center" style={{ cursor: "pointer" }}>오후 1: 30</span>
                        <span className="badge ms-3 bg-info border p-2 rounded text-center" style={{ cursor: "pointer" }}>오후 2: 30</span>
                    </div>
                </div>

                <div className="row mt-4 border p-4">
                    <div className="col">
                        <h3>소식...</h3>
                    </div>
                </div>

                <div className="row mt-4 border p-4">
                    <div className="col">
                        <h3>편의시설...</h3>
                    </div>
                </div>

                <div className="row mt-4 border p-4">
                    <div className="col">
                        <h3>메뉴...</h3>
                    </div>
                </div>

                <div className="row mt-4 border p-4">
                    <div className="col">
                        <h3>사진 ...</h3>
                    </div>
                </div>

                <div className="row mt-4 p-2">
                    <div className="col d-flex">
                        <div className="more-info-wrapper d-flex mt-2">
                            <span
                                className="d-flex flex-column align-items-center"
                                onClick={toggleWish}
                                style={{ cursor: "pointer", userSelect: "none" }}
                            >
                                {isWish ? (
                                    <FaBookmark className="fs-4 text-danger" /> // 저장됨: 채워진 아이콘
                                ) : (
                                    <FaRegBookmark className="fs-4 text-secondary" /> // 미저장: 빈 아이콘
                                )}
                                <span style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                                    {wishCount} {/* 실시간 저장 개수 */}
                                </span>
                            </span>
                            <span className="ms-3 d-flex flex-column align-items-center"><FaPhoneAlt className="fs-4" />전화</span>
                        </div>
                        <button className="ms-4 btn btn-primary rounded-pill" style={{ width: "80%" }}>예약하기</button>
                    </div>
                </div>

            </div>
        </>
    );
}
