
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify";
import usePagingByScroll from "../../hooks/usePagingByScroll";
import { FaStar, FaUser } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { addDays, addMinutes, format, isAfter, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { Swiper, SwiperSlide } from 'swiper/react';
import './RestaurantList.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Modal } from "bootstrap";
import { DayPicker } from "react-day-picker";
import { buildRestaurantSlots, buildAvailableSlots } from "../../utils/custom-utils/slot";

import "react-day-picker/dist/style.css";
import "/src/custom-css/daypicker-custom.css";

export default function RestaurantList() {
    //hook 호출(스크롤 페이징)
    const { list: restaurantList, page, setPage, loadList } = usePagingByScroll("/restaurant");

    //state
    const [slotList, setSlotList] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [slotDate, setSlotDate] = useState(null);
    const [peopleCount, setPeopleCount] = useState(0);
    const [message, setMessage] = useState("");
    const [availableSeatList, setAvailableSeatList] = useState([]);
    const [slotTime, setSlotTime] = useState(null);

    //effect
    useEffect(() => {
        loadSlotList();
    }, []);

    useEffect(() => {
        if (!selectedRestaurant || !slotDate || !peopleCount) return;

        const load = async () => {
            try {
                const request = {
                    restaurantId: selectedRestaurant.restaurantId,
                    slotDate: format(slotDate, "yyyy-MM-dd"),
                    peopleCount: peopleCount
                };
                const { data } = await axios.post("/slot/seat", request);
                setAvailableSeatList(data);
            } catch (err) {
                console.error(err);
                toast.error("요청이 정상적으로 처리되지 않았습니다");
            }
        };

        load();
    }, [selectedRestaurant, slotDate, peopleCount]);

    //callback
    const loadSlotList = useCallback(async () => {
        if (!restaurantList?.length) return;

        try {
            const results = await Promise.all(
                restaurantList.map(r => axios.get(`/slot/${r.restaurantId}`))
            );

            const allSlots = results.flatMap(res => res.data);
            setSlotList(allSlots);

        } catch (err) {
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
    }, [restaurantList]);

    //memo
    //날짜 계산 후 반환
    const restaurantSlot = useMemo(() => {
        if (!restaurantList) return {};

        const now = new Date();
        const todayDateStr = now.toDateString();
        const tomorrowDateStr = addDays(now, 1).toDateString();

        const result = {};

        restaurantList.forEach(restaurant => {
            const slots = buildRestaurantSlots({
                restaurant,
                slotList
            });

            // 각 슬롯에 today/tomorrow 여부 추가
            const slotsWithTodayFlag = slots.map(slot => {
                const slotDateObj = new Date(slot.date);
                return {
                    ...slot,
                    isToday: slotDateObj.toDateString() === todayDateStr,
                    isTomorrow: slotDateObj.toDateString() === tomorrowDateStr
                };
            });

            result[restaurant.restaurantId] = slotsWithTodayFlag;
        });

        return result;
    }, [restaurantList, slotList]);


    // 오늘 기준 영업 여부 계산
    const statusWithRestaurantList = useMemo(() => {
        if (!restaurantList) return [];

        const now = new Date();
        const todayName = format(now, "eee", { locale: ko });
        const todayDateStr = format(now, "yyyy-MM-dd");

        return restaurantList.map(r => {
            const openingDays = r.restaurantOpeningDays?.split(",") ?? [];
            const holidayDates = r.holiday_dates ? r.holiday_dates.split(",") : [];

            const isOpenToday = openingDays.includes(todayName);

            // 오늘 휴무
            if (!isOpenToday || holidayDates.includes(todayDateStr)) {
                return { ...r, statusText: `${todayName}요일 휴무` };
            }

            const openTime = new Date(`${todayDateStr}T${r.restaurantOpen}`);
            const closeTime = new Date(`${todayDateStr}T${r.restaurantClose}`);

            let statusText;

            if (now < openTime) {
                statusText = `영업 전  ·  ${r.restaurantOpen} 영업 시작`;
            } else if (now > closeTime) {
                // 다음 날 체크
                let nextDate = addDays(now, 1);
                let nextDayName = format(nextDate, "eee", { locale: ko });
                const nextDateStr = format(nextDate, "yyyy-MM-dd");

                if (!openingDays.includes(nextDayName) || holidayDates.includes(nextDateStr)) {
                    statusText = `영업 종료  ·  내일 휴무`; // 내일 휴무
                } else {
                    statusText = `영업 종료  ·  내일 ${r.restaurantOpen} 영업 시작`; // 정상 다음 영업일
                }
            } else {
                statusText = `영업중 ${r.restaurantOpen} ~ ${r.restaurantClose}`;
            }

            return { ...r, isOpenToday, statusText };
        });
    }, [restaurantList]);



    //예약 가능 인원 및 인원 수 리스트 계산
    const peopleCountList = useMemo(() => {
        if (!selectedRestaurant) return [];

        const list = [];
        const maxPeople = selectedRestaurant.restaurantMaxPeople;

        console.log(maxPeople);
        for (let i = 1; i <= 20; i++) {
            list.push({
                number: i,
                isDisabled: i > maxPeople
            });
        }
        return list;

    }, [selectedRestaurant, peopleCount]);

    const disabledDays = useCallback(
        (date) => {
            if (!selectedRestaurant) return true;

            const formattedDate = format(date, "yyyy-MM-dd");
            const dayName = format(date, "eee", { locale: ko });

            const openingDays = selectedRestaurant.restaurantOpeningDays?.split(",") ?? [];
            const holidayDates = selectedRestaurant.restaurantHolidayDate ?? [];

            // slotDate는 항상 선택 가능
            if (slotDate && format(slotDate, "yyyy-MM-dd") === formattedDate) return false;

            // 오늘 이전 날짜 막기
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            if (date < todayDate) return true;

            // 휴무일
            if (holidayDates.includes(formattedDate)) return true;

            // 영업 요일 아님
            if (!openingDays.includes(dayName)) return true;

            return false;
        },
        [selectedRestaurant, slotDate]
    );

    const selectSlot = useCallback((restaurant, slot) => {
        setSelectedRestaurant(restaurant);
        const selectedDate = new Date(slot.date);
        setSlotDate(selectedDate);
        openModal();
    }, []);

    const selectAndSetMessage = useCallback((number, isDisabled) => {
        if (!isDisabled) {
            setPeopleCount(number);
            setMessage("");
        } else {
            setPeopleCount(number);
            setMessage(`${number}명 이상의 인원 예약은 가게로 연락주세요`);
        }
    }, []);

    //시작시간 - 라스트오더 기준으로 시간슬롯 계산
    const availableSlots = useMemo(() => {
        if (!selectedRestaurant || !peopleCount || !slotDate) return [];

        const slots = buildAvailableSlots({
            restaurant: selectedRestaurant,
            slotDate,        // slotList가 아니라 slotDate 기준으로
            peopleCount
        });

        return slots;

    }, [selectedRestaurant, peopleCount, slotDate]);

    const modal = useRef();

    const openModal = useCallback(() => {
        const instance = Modal.getOrCreateInstance(modal.current);
        instance.show();
    }, [modal]);

    const closeModal = useCallback(() => {
        const instance = Modal.getInstance(modal.current);
        instance.hide();
    }, [modal]);

    return (
        <>
            <div className="row mt-4">
                <div className="col">
                    {/* 영업중인 식당 목록 영역 */}
                    <div className="d-flex mb-4 flex-wrap justify-content-center">
                        {statusWithRestaurantList.map(restaurant =>
                            <div className="mt-3 d-flex flex-column align-items-center w-100" key={restaurant.restaurantId}>
                                <ul className="list-group w-75">
                                    <li className="list-group-item">
                                        <div className="row">
                                            <div className="col">
                                                <img className="d-flex rounded mt-2 clickable w-100" src={`http://localhost:8080/restaurant/image/${restaurant.restaurantId}`} style={{ height: "250px", objectFit: "cover" }} />
                                                <h3 className="mt-2">{restaurant.restaurantName}</h3>
                                                <div className="mt-2">{restaurant.statusText}  ·  <FaUser className="me-2" />최대 {restaurant.restaurantMaxPeople}명 예약 가능</div>
                                                <div className="badge-wrapper mt-2">
                                                    <span className="badge bg-secondary me-2">{restaurant.placeGroupName}</span>
                                                    <span className="badge bg-primary">{restaurant.categoryName}</span>
                                                </div>
                                                <div className="review-info-wrapper mt-2 d-flex">
                                                    <span className="d-flex align-items-center"><FaStar className="text-warning me-1" /><span className="fw-bold me-1">{restaurant.restaurantAvgRating}</span>({restaurant.reviewCount})</span>
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
                                                                <button
                                                                    className={`btn p-1 d-flex flex-column align-items-center ${slot.status === "휴무" || slot.status === "예약 마감" || slot.status === "영업 마감" ? "btn-light" : "btn-outline-primary"} w-100`}
                                                                    disabled={slot.status === "예약 마감" || slot.status === "휴무" || slot.status === "영업 마감"}
                                                                    onClick={() => selectSlot(restaurant, slot)}
                                                                >
                                                                    {slot.isToday && (<span className={`text-${slot.status === "휴무" ? "dark" : ""} mt-1`}>오늘 ({slot.dayName})</span>)}
                                                                    {slot.isTomorrow && (<span className={`text-${slot.status === "휴무" ? "dark" : ""} mt-1`}>내일 ({slot.dayName})</span>)}
                                                                    {!slot.isToday && !slot.isTomorrow && (<span className={`text-${slot.status === "휴무" ? "dark" : ""} mt-1`}>{slot.dateStr} ({slot.dayName})</span>)}
                                                                    <small className={`text-${slot.status === "휴무" || slot.status === "예약 마감" || slot.status === "영업 마감" ? "dark" : ""} fw-bold mt-1`}>{slot.status}</small>
                                                                </button>
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
            {/* 모달 영역 */}
            <div className="modal fade" tabIndex={-1} data-bs-backdrop="static" ref={modal} data-bs-keyboard="false">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="row">
                                <div className="col d-flex flex-column align-items-center">
                                    <DayPicker key={slotDate ? slotDate.toISOString() : "empty"} mode="single" locale={ko} disabled={disabledDays} selected={slotDate} onSelect={setSlotDate}></DayPicker>
                                </div>
                            </div>
                            <hr />
                            <div className="row mt-4">
                                <div className="col">
                                    <div className="slot-wrapper d-flex">
                                        <Swiper
                                            spaceBetween={1}
                                            slidesPerView={7}
                                            pagination={false}
                                        >
                                            {peopleCountList.map(p => (
                                                <SwiperSlide key={p.number}>
                                                    <span className={`circle ${peopleCount === p.number ? "selected" : ""}`} onClick={() => selectAndSetMessage(p.number, p.isDisabled)}>{p.number}명</span>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-4">
                                <div className="col">
                                    {/* 인원이 선택되었을 때만 슬롯 렌더링 */}
                                    {peopleCount <= selectedRestaurant.restaurantMaxPeople ? (
                                        <div className="slot-wrapper d-flex">
                                            <Swiper key={peopleCount} spaceBetween={5} slidesPerView={6} pagination={false}>
                                                {availableSlots.map(slot => (
                                                    <SwiperSlide key={slot.timeStr}>
                                                        <span className={`btn btn-outline-secondary`}>
                                                            {slot.timeStr}
                                                        </span>
                                                    </SwiperSlide>
                                                ))
                                                }
                                            </Swiper>
                                        </div>
                                    ) :
                                        (
                                            <div className="text-center p-3 border rounded bg-light">
                                                <span className="text-muted"><FaPhoneAlt className="me-3" />{message}</span>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className={`ms-2 btn btn-primary`} onClick={closeModal}>닫기</button>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}
