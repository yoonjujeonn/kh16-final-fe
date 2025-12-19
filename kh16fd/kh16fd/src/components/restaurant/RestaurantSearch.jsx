import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa6";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import "./RestaurantList.css";

export default function RestaurantSearch() {

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const queryKeyword = params.get("keyword");
  const stateKeyword = location.state?.keyword;

  const keyword = (queryKeyword ?? stateKeyword ?? "").trim();

  const [restaurantList, setRestaurantList] = useState([]);

  // 오늘 요일
  const today = useMemo(() => {
    return format(new Date(), "eee", { locale: ko });
  }, []);

  // 검색
  useEffect(() => {
    if (!keyword) return;

    axios
      .post("/restaurant/search", { keyword })
      .then(resp => {
        setRestaurantList(resp.data);
      })
      .catch(() => {
        toast.error("검색 실패");
      });
  }, [keyword]);

  useEffect(() => {
    console.log(restaurantList);
  }, [restaurantList]);
  return (
    <>
      <h4 className="text-center mt-4">
        "{keyword || "전체"}" 검색 결과
      </h4>

      <div className="row mt-4">
        <div className="col d-flex flex-column align-items-center">

          {restaurantList.map(restaurant => (
            <div
              key={restaurant.restaurantId}
              className="border rounded p-4 mb-4 w-75"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/restaurant/detail/${restaurant.restaurantId}`)
              }
            >
              {/* 이미지 */}
              <img
                src={`http://localhost:8080/restaurant/image/${restaurant.restaurantId}`}
                className="w-100 rounded mb-3"
                style={{ height: "350px", objectFit: "cover" }}
              />

              {/* 식당명 */}
              <div className="fs-3 fw-bold">
                {restaurant.restaurantName}
              </div>

              {/* 별점 */}
              <div className="d-flex align-items-center mt-1">
                <FaStar className="text-warning me-1" />
                <span className="fw-bold">
                  {restaurant.restaurantAvgRating?.toFixed(1) ?? "0.0"}
                </span>
                <span className="ms-2 text-muted">
                  · 리뷰 {restaurant.reviewCount ?? 0}개
                </span>
              </div>

              {/* 설명 */}
              <div className="mt-2 text-muted">
                {restaurant.restaurantDescription}
              </div>

              <hr />

              {/* 영업시간 */}
              <div className="mt-2">
                {restaurant.restaurantOpeningDays?.includes(today)
                  ? `오늘 (${today}) · ${restaurant.restaurantOpen} ~ ${restaurant.restaurantClose}`
                  : `오늘 (${today}) · 휴무`}
              </div>

              {/* 태그 */}
              <div className="tag-wrapper my-3">
                <span className="badge bg-light text-dark">
                  최대 {restaurant.restaurantMaxPeople}명 예약
                </span>
                <span className="ms-2 badge bg-primary">
                  {restaurant.placeGroupName}
                </span>
                <span className="ms-2 badge bg-secondary">
                  {restaurant.categoryName}
                </span>
              </div>
            </div>
          ))}

          {restaurantList.length === 0 && (
            <div className="text-center text-muted mt-5">
              검색 결과가 없습니다.
            </div>
          )}

        </div>
      </div>
    </>
  );
}
