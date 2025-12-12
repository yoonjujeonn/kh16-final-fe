import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify";
import usePagingByScroll from "../../hooks/usePagingByScroll";
import { FaHeart, FaStar } from "react-icons/fa6";
import { addDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function RestaurantList() {
    //hook 호출(스크롤 페이징)
    const { list: restaurantList, page, setPage, loadList } = usePagingByScroll("/restaurant");

    //날짜 변수
    const index = new Date().getDay();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const today = days[index];
    const tomorrow = days[index + 1];
    
    //state
    const [slotList, setSlotList] = useState([]);
    const [restaurantSlot, setRestaurantSlot] = useState({});

    //effect
    useEffect(() => {
        if (restaurantList?.length > 0) {
            loadSlotList();
        }
    }, [restaurantList]);

    useEffect(() => {
        if (slotList.length > 0) weekSlots();
    }, [slotList]);

    //callback
    const loadSlotList = useCallback(async () => {
        if (!restaurantList) return;

        try {
            console.log("restaurantList", restaurantList);
            const requests = restaurantList.map(r => axios.get(`/slot/${r.restaurantId}`));

            // Promise.all로 모든 요청 병렬 실행
            const results = await Promise.all(requests);
            console.log("results", results);

            // for문으로 결과 순차 처리
            const allSlots = [];
            for (const res of results) {
                // res.data는 각 식당의 슬롯 배열
                for (const slot of res.data) {
                    allSlots.push(slot);
                }
            }
            console.log("allSlots", allSlots);

            setSlotList(allSlots);
        }
        catch (err) {
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
    }, [restaurantList]);

    //날짜 계산 후 반환
    const weekSlots = useCallback(() => {
        if (!restaurantList || slotList.length === 0) return;

        const slotsByRestaurant = {};

        restaurantList.forEach(restaurant => {
            const openingDays = restaurant.restaurantOpeningDays?.split(",");
            const weekDays = Array.from({ length: 14 }).map((_, i) => {
                const date = addDays(new Date(), i);
                return {
                    date: format(date, "yyyy-MM-dd"),
                    dateStr: format(date, "MM.dd"),
                    dayName: format(date, "eee", { locale: ko }),
                };
            });

            const validSlot = weekDays.map(day => {
                const isHoliday = restaurant.restaurantHolidayDate?.includes(day.date);
                const isOpenDay = openingDays.includes(day.dayName);

                const slot = slotList.find(
                    s => s.restaurantId === restaurant.restaurantId && s.reservationDate === day.date
                );

                let status;
                if (isHoliday || !isOpenDay) status = "휴무";
                else if (slot?.reservationStatus === "예약완료") status = "예약 마감";
                else status = "예약 가능";

                return { ...day, status };
            });

            slotsByRestaurant[restaurant.restaurantId] = validSlot;
        });

        setRestaurantSlot(slotsByRestaurant);
    }, [restaurantList, slotList]);

    //memo
    //오늘 기준 영업 유무 계산
    const statusWithRestaurantList = useMemo(() => {
        if (!restaurantList) return;

        return restaurantList.map(r => {
            const days = r.restaurantOpeningDays?.split(",");
            return {
                ...r,
                isOpenToday: days.includes(today)  // true/false 모두 포함됨
            };
        });
    }, [today, restaurantList]);

    return (
        <>
            <div className="row mt-4">
                <div className="col">
                    {/* 영업중인 식당 목록 영역 */}
                    <div className="d-flex mb-4 flex-wrap justify-content-center">
                        {statusWithRestaurantList.map(restaurant =>
                            <div className="mt-3 d-flex flex-column align-items-center w-100">
                                <ul className="list-group w-75" key={restaurant.restaurantId}>
                                    <li className="list-group-item">
                                        <div className="row">
                                            <div className="col">
                                                <img className="d-flex rounded mt-2 clickable w-100" src={`http://localhost:8080/restaurant/image/${restaurant.restaurantId}`} style={{ height: "250px", objectFit: "cover" }} />
                                                <h3 className="mt-2">{restaurant.restaurantName}</h3>
                                                <div className="mt-2">{restaurant.isOpenToday ? `영업중 ${restaurant.restaurantOpen} ~ ${restaurant.restaurantClose}` : `${today}요일 휴무`}</div>
                                                <div className="badge-wrapper mt-2">
                                                    <span className="badge bg-primary">{restaurant.categoryName}</span>
                                                    <span className="badge bg-secondary">{restaurant.placeGroupName}</span>
                                                </div>
                                                <div className="review-info-wrapper mt-2 d-flex">
                                                    <span className="d-flex align-items-center"><FaStar className="text-warning me-1" /><span className="fw-bold me-1">{restaurant.restaurantAvgRating}.0</span>({restaurant.reviewCount})</span>
                                                </div>
                                                <div className="price-wrapper mt-2">
                                                    <span>점심 ? 원</span>  ·  <span>저녁 ? 원 </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* 슬롯 영역 (추후 swiper 적용) */}
                                        <div className="row my-4">
                                            <div className="col">
                                                <div className="slot-wrapper d-flex">
                                                    <Swiper
                                                        spaceBetween={10}       // 슬라이드 사이 간격
                                                        slidesPerView={5}       // 한 화면에 보여줄 슬라이드 수
                                                        pagination={false} // 페이지 네비게이션
                                                    >
                                                        {restaurantSlot[restaurant.restaurantId]?.map(slot => (
                                                            <SwiperSlide key={slot.date}>
                                                                <div
                                                                    className={`btn p-1 d-flex flex-column align-items-center ${slot.status === "휴무" ? "btn-light" : "btn-outline-primary"} w-100 ${slot.status === "예약 마감" || slot.status === "휴무일" ? "disabled" : ""}`}
                                                                >
                                                                    {slot.dayName === today && (<span className={`text-${slot.status === "휴무" ? "dark" : ""} mt-1`}>오늘 ({slot.dayName})</span>)}
                                                                    {slot.dayName === tomorrow && (<span className={`text-${slot.status === "휴무" ? "dark" : ""} mt-1`}>내일 ({slot.dayName})</span>)}
                                                                    {slot.dayName !== today && slot.dayName !== tomorrow && (<span className={`text-${slot.status === "휴무" ? "dark" : ""} mt-1`}>{slot.dateStr} ({slot.dayName})</span>)}
                                                                    <small className={`text-${slot.status === "휴무" ? "dark" : ""} fw-bold mt-1`}>{slot.status}</small>
                                                                </div>
                                                            </SwiperSlide>
                                                        ))}
                                                    </Swiper>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </>
    )
}