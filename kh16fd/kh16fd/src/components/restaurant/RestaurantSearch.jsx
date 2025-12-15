import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa6";
import { addDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import { Swiper, SwiperSlide } from "swiper/react";

import "./RestaurantList.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function RestaurantSearch() {

  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const queryKeyword = params.get("keyword");
  const stateKeyword = location.state?.keyword;

  const keyword = (queryKeyword ?? stateKeyword ?? "").trim();

  const [restaurantList, setRestaurantList] = useState([]);
  const [slotList, setSlotList] = useState([]);

  const today = format(new Date(), "eee", { locale: ko });
  const tomorrow = format(addDays(new Date(), 1), "eee", { locale: ko });

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

  const loadSlotList = useCallback(async () => {
    if (!restaurantList.length) return;

    try {
      const results = await Promise.all(
        restaurantList.map(r =>
          axios.get(`/slot/${r.restaurantId}`)
        )
      );

      const allSlots = results.flatMap(res => res.data);
      setSlotList(allSlots);
    } catch {
      toast.error("슬롯 정보를 불러오지 못했습니다");
    }
  }, [restaurantList]);

  useEffect(() => {
    loadSlotList();
  }, [restaurantList]);

  const restaurantSlot = useMemo(() => {
    if (!restaurantList.length) return {};

    const slotsByRestaurant = {};
    const todayDate = new Date();

    restaurantList.forEach(restaurant => {
      const openingDays = restaurant.restaurantOpeningDays?.split(",") ?? [];
      const holidayDates = restaurant.restaurantHolidayDate ?? [];

      const days = Array.from({ length: 14 }).map((_, i) => {
        const date = addDays(todayDate, i);
        const formattedDate = format(date, "yyyy-MM-dd");
        const dayName = format(date, "eee", { locale: ko });

        const slot = slotList.find(
          s =>
            s.restaurantId === restaurant.restaurantId &&
            s.reservationDate === formattedDate
        );

        let status = "예약 가능";
        if (!openingDays.includes(dayName) || holidayDates.includes(formattedDate)) {
          status = "휴무";
        } else if (slot && slot.reservedSeatCount >= slot.totalSeatCount) {
          status = "예약 마감";
        }

        return {
          date: formattedDate,
          dateStr: format(date, "MM.dd"),
          dayName,
          status
        };
      });

      slotsByRestaurant[restaurant.restaurantId] = days;
    });

    return slotsByRestaurant;
  }, [restaurantList, slotList]);

  const statusWithRestaurantList = useMemo(() => {
    return restaurantList.map(r => ({
      ...r,
      isOpenToday: r.restaurantOpeningDays?.split(",").includes(today)
    }));
  }, [restaurantList, today]);

  return (
    <>
      <h4 className="text-center mt-4">
        "{keyword || "전체"}" 검색 결과
      </h4>

      <div className="row mt-4">
        <div className="col">
          <div className="d-flex mb-4 flex-wrap justify-content-center">

            {statusWithRestaurantList.map(restaurant => (
              <div
                key={restaurant.restaurantId}
                className="mt-3 d-flex flex-column align-items-center w-100"
              >
                <ul className="list-group w-75">
                  <li className="list-group-item">

                    <img
                      className="rounded mt-2 w-100"
                      src={`http://localhost:8080/restaurant/image/${restaurant.restaurantId}`}
                      style={{ height: "250px", objectFit: "cover" }}
                    />

                    <h3 className="mt-2">
                      {restaurant.restaurantName}
                    </h3>

                    <div className="mt-2">
                      {restaurant.isOpenToday
                        ? `영업중 ${restaurant.restaurantOpen} ~ ${restaurant.restaurantClose}`
                        : `${today}요일 휴무`}
                    </div>

                    <div className="badge-wrapper mt-2">
                      <span className="badge bg-secondary me-2">
                        {restaurant.placeGroupName}
                      </span>
                      <span className="badge bg-primary">
                        {restaurant.categoryName}
                      </span>
                    </div>

                    <div className="review-info-wrapper mt-2 d-flex">
                      <FaStar className="text-warning me-1" />
                      <strong className="me-1">
                        {restaurant.restaurantAvgRating}.0
                      </strong>
                      ({restaurant.reviewCount})
                    </div>

                    <div className="row my-4">
                      <Swiper spaceBetween={10} slidesPerView={5}>
                        {restaurantSlot[restaurant.restaurantId]?.map(slot => (
                          <SwiperSlide key={slot.date}>
                            <div
                              className={`btn p-1 d-flex flex-column align-items-center w-100
                                ${slot.status === "휴무" ? "btn-light" : "btn-outline-primary"}
                                ${slot.status !== "예약 가능" ? "disabled" : ""}
                              `}
                            >
                              <span className="mt-1">
                                {slot.dayName === today
                                  ? `오늘 (${slot.dayName})`
                                  : slot.dayName === tomorrow
                                  ? `내일 (${slot.dayName})`
                                  : `${slot.dateStr} (${slot.dayName})`}
                              </span>
                              <small className="fw-bold mt-1">
                                {slot.status}
                              </small>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>

                  </li>
                </ul>
              </div>
            ))}

          </div>
        </div>
      </div>
    </>
  );
}
