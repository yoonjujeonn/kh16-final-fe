import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, Outlet, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import { FaAngleLeft, FaBookmark, FaPhone, FaPhoneAlt, FaPhoneSlash, FaRegBookmark, FaStar, FaUser } from "react-icons/fa";
import { IoIosArrowDown, IoIosCall } from "react-icons/io";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { result } from "lodash";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { addDays, addMinutes, format, isAfter, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { Swiper, SwiperSlide } from 'swiper/react';
import Swal from "sweetalert2";
import { DayPicker } from "react-day-picker";
import { buildRestaurantSlots, buildAvailableSlots } from "../../utils/custom-utils/slot";
import "react-day-picker/dist/style.css";
import "/src/custom-css/daypicker-custom.css";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";
import { FaCalendar, FaLocationDot, FaMoneyBill, FaWonSign } from "react-icons/fa6";

export default function RestaurantDetail() {
    const [restaurant, setRestaurant] = useState(null);
    const [moreInfo, setMoreInfo] = useState(null);
    const [fullInfo, setFullInfo] = useState(null);
    const { restaurantId } = useParams();
    const [slotList, setSlotList] = useState([]);
    const [slotDate, setSlotDate] = useState(null);
    const [peopleCount, setPeopleCount] = useState(null);
    const [message, setMessage] = useState("");
    const [availableSeatList, setAvailableSeatList] = useState([]);
    const [slotTime, setSlotTime] = useState(null);
    const [selectedSeat, setSelectedSeat] = useState(null);

    // wishlist 관련 state
    const [loginId] = useAtom(loginIdState);
    const [isWish, setIsWish] = useState(false);
    const [wishCount, setWishCount] = useState(0);

    //오늘 표시
    const index = new Date().getDay();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const today = days[index];

    const [distance, setDistance] = useState("");
    const [line, setline] = useState([]);

    const lineColors = {
        "1호선": "#0052A4",
        "2호선": "#00A84D",
        "3호선": "#EF7C1C",
        "4호선": "#00A5DE",
        "5호선": "#996CAC",
        "6호선": "#CD7C2F",
        "7호선": "#747F00",
        "8호선": "#E6186C",
        "9호선": "#BDB092",
        "신분당선": "#D4003B",
        "수인분당선": "#F5B800",
        "공항철도": "#3681b7",
        "경의중앙선": "#77C4A3",
        "우이신설선": "#B0CE18",
        "부산1호선": "#FF0000",
        "부산2호선": "#00A84D",
        "부산3호선": "#EF7C1C",
        "대구1호선": "#0052A4",
        "대구2호선": "#00A84D",
        "대구3호선": "#996CAC",
        "광주1호선": "#FF0000",
        "대전1호선": "#0052A4"
    };

    const checkWish = useCallback(async () => {
        try {
            const response = await axios.post("/rest/wishlist/check", {
                memberId: loginId,
                restaurantId: restaurantId
            });
            // 서버에서 받은 isWish와 count로 상태 업데이트
            setIsWish(response.data.isWish);
            setWishCount(response.data.count);
        } catch (error) {
            console.error("위시리스트 확인 실패", error);
        }
    }, [loginId, restaurantId]);


    // 2. 하트 클릭 시 토글 실행
    const toggleWish = async () => {
        // 비로그인 상태일 경우 경고
        if (!loginId) {
            toast.warning("로그인 후 이용 가능합니다.");
            return;
        }

        try {
            const response = await axios.post("/rest/wishlist/toggle", {
                memberId: loginId,
                restaurantId: restaurantId
            });

            // 서버에서 받은 최신 상태와 개수로 UI 업데이트
            setIsWish(response.data.isWish);
            setWishCount(response.data.count);

            if (response.data.isWish) {
                toast.success("저장되었습니다.");
            } else {
                toast.info("저장이 취소되었습니다.");
            }
        } catch (error) {
            toast.error("위시리스트 처리 중 오류가 발생했습니다.");
            console.error("위시리스트 토글 실패", error);
        }
    };

    useEffect(() => {
        loadData();
        loadSlotList();
        checkWish();
    }, [checkWish]);

    const mapRef = useRef(null);         // 지도 DOM
    const mapInstance = useRef(null);    // kakao map 객체
    const markersRef = useRef([]);       // 마커 히스토리

    //마커
    useEffect(() => {
        if (!fullInfo) return;
        if (!window.kakao || !mapRef.current) return;

        const position = new window.kakao.maps.LatLng(
            fullInfo.restaurantAddressY,
            fullInfo.restaurantAddressX
        );

        mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
            center: position,
            level: 2
        });

        // ✅ 마커 생성
        const marker = new window.kakao.maps.Marker({
            position
        });

        marker.setMap(mapInstance.current);

    }, [fullInfo]);

    //주소 표시
    useEffect(() => {
        if (!restaurant?.restaurantAddress) return;

        const placeService = new kakao.maps.services.Places();
        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.addressSearch(
            restaurant.restaurantAddress,
            function (result, gStatus) {
                if (gStatus !== kakao.maps.services.Status.OK) {
                    setDistance(restaurant.restaurantAddress);
                    setline([]);
                    return;
                }

                const addressY = result[0].y;
                const addressX = result[0].x;

                const option = {
                    location: new kakao.maps.LatLng(addressY, addressX),
                    radius: 1000,
                    sort: kakao.maps.services.SortBy.DISTANCE
                };

                placeService.keywordSearch("지하철역", (data, status) => {
                    if (status !== kakao.maps.services.Status.OK) {
                        setDistance(restaurant.restaurantAddress);
                        setline([]);
                        return;
                    }

                    const stationsMap = {};

                    data.forEach(place => {
                        if (!place.distance) return;

                        const tokens = place.place_name.split(" ");
                        const name = tokens[0];
                        const lineRaw = tokens[1] || "";

                        if (!name.endsWith("역")) return;

                        if (!stationsMap[name]) {
                            stationsMap[name] = {
                                name,
                                lines: [],
                                lineColorKeys: [],
                                distance: Number(place.distance)
                            };
                        }

                        // 호선 파싱
                        let lineName = "";
                        let lineColorKey = "";

                        const numberMatch = lineRaw.match(/\d+/);
                        if (numberMatch) {
                            lineName = numberMatch[0];
                            lineColorKey = lineRaw;
                        } else if (lineRaw.includes("공항철도")) {
                            lineName = "공항";
                            lineColorKey = lineRaw;
                        } else {
                            lineName = lineRaw.endsWith("선") ? lineRaw.slice(0, -1) : lineRaw;
                            lineColorKey = lineRaw;
                        }

                        if (!stationsMap[name].lines.includes(lineName)) {
                            stationsMap[name].lines.push(lineName);
                            stationsMap[name].lineColorKeys.push(lineColorKey);
                        }
                    });

                    const stations = Object.values(stationsMap)
                        .sort((a, b) => a.distance - b.distance);

                    const closestStation = stations[0];

                    if (!closestStation) {
                        setDistance(restaurant.restaurantAddress);
                        setline([]);
                        return;
                    }

                    const isFar = closestStation.distance > 1000;

                    setDistance(
                        isFar
                            ? restaurant.restaurantAddress
                            : `${closestStation.name}에서 ${closestStation.distance}m`
                    );

                    setline(
                        closestStation.lines.map((name, idx) => ({
                            name,
                            colorKey: closestStation.lineColorKeys[idx]
                        }))
                    );

                }, option);
            }
        );
    }, [restaurant]);

    //좌석 로드
    useEffect(() => {
        loadSeatList();
    }, [slotTime, peopleCount, fullInfo]);

    const loadData = useCallback(async () => {
        try {
            const { data } = await axios.get(`/restaurant/detail/${restaurantId}`);
            const { restaurantDto, ...rest } = data;

            console.log(data);
            setRestaurant(restaurantDto);
            setMoreInfo(rest);
            setFullInfo({ ...restaurantDto, ...rest });
        }
        catch (err) {
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
    }, []);

    //모달 관련
    const modal = useRef();

    const openModal = useCallback(() => {
        const instance = Modal.getOrCreateInstance(modal.current);
        instance.show();
    }, [modal]);

    const closeModal = useCallback(() => {
        const instance = Modal.getInstance(modal.current);
        instance.hide();
    }, [modal]);

    const clearData = useCallback(() => {
        setPeopleCount(0);
        setSelectedSeat("");
        setSlotTime(null);
        setSlotDate(null);
        setAvailableSeatList([]);
    }, []);

    const closeAndClearData = useCallback(() => {
        closeModal();
        clearData();
    }, []);

    //시간 계산
    const openHours = useMemo(() => {
        if (!fullInfo) return;

        const openingDays = fullInfo.restaurantOpeningDays;

        const isOpeningDay = openingDays.includes(today);

        if (isOpeningDay) {
            return `${fullInfo.restaurantOpen} ~ ${fullInfo.restaurantClose}`;
        }

        return "휴무일";
    }, [today, fullInfo]);

    const loadSlotList = useCallback(async () => {
        if (!fullInfo) return;

        try {
            const { data } = await axios.get(`/slot/${restaurantId}`);
            setSlotList(data);

        } catch (err) {
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
    }, [fullInfo]);

    //날짜 계산 후 반환
    const restaurantSlot = useMemo(() => {
        if (!fullInfo) return [];

        const now = new Date();
        const todayDateStr = now.toDateString();
        const tomorrowDateStr = addDays(now, 1).toDateString();

        const slots = buildRestaurantSlots({ restaurant: fullInfo, slotList });


        // 각 슬롯에 today/tomorrow 여부 추가
        return slots.map(slot => {
            const slotDateObj = new Date(slot.date);
            return {
                ...slot,
                isToday: slotDateObj.toDateString() === todayDateStr,
                isTomorrow: slotDateObj.toDateString() === tomorrowDateStr
            };
        });

    }, [fullInfo, slotList]);

    //예약 가능 인원 및 인원 수 리스트 계산
    const peopleCountList = useMemo(() => {
        if (!fullInfo) return [];

        const list = [];
        const maxPeople = fullInfo.restaurantMaxPeople;

        for (let i = 1; i <= 20; i++) {
            list.push({
                number: i,
                isDisabled: i > maxPeople
            });
        }
        return list;

    }, [fullInfo, peopleCount]);

    const disabledDays = useCallback(
        (date) => {
            if (!fullInfo) return true;

            const formattedDate = format(date, "yyyy-MM-dd");
            const dayName = format(date, "eee", { locale: ko });

            const openingDays = fullInfo.restaurantOpeningDays?.split(",") ?? [];
            const holidayDates = fullInfo.restaurantHolidayDate ?? [];

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
        [fullInfo, slotDate]
    );

    const selectSlot = useCallback((slot) => {
        const selectedDate = new Date(slot.date);
        setSlotDate(selectedDate);
        openModal();
    }, []);

    const formatDate = useMemo(() => {
        if (!slotDate) return;

        const now = new Date();
        const tomorrow = addDays(now, 1);
        const todayName = format(now, "eee", { locale: ko });
        const tomorrowName = format(tomorrow, "eee", { locale: ko });

        const isToday = format(slotDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
        const isTomorrow = format(slotDate, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd");

        if (isToday) {
            return `오늘 (${todayName})`;
        }
        if (isTomorrow) {
            return `내일 (${tomorrowName})`;
        }

        const str = format(slotDate, "MM.dd (eee)", { locale: ko });

        return str;

    }, [slotDate]);

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
        if (!fullInfo || !peopleCount || !slotDate) return [];

        const slots = buildAvailableSlots({ restaurant: fullInfo, slotDate: slotDate, peopleCount: peopleCount });

        return slots;

    }, [fullInfo, peopleCount, slotDate]);

    //좌석 정보 로드
    const loadSeatList = useCallback(async () => {
        if (!fullInfo || !slotTime || !peopleCount) return;

        try {
            const request = {
                restaurantId: restaurantId,
                slotTime: slotTime,
                peopleCount: peopleCount
            };
            const { data } = await axios.post("/slot/seat", request);
            console.log(slotTime, `"${slotTime}"`);
            console.log(slotTime);
            console.log(data);
            setAvailableSeatList(data);

        } catch (err) {
            console.error(err);
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
    }, [fullInfo, slotTime, peopleCount]);

    const changeSlotTime = useCallback(async (e) => {
        const text = e.target.textContent;
        const date = format(slotDate, "yyyy-MM-dd");
        const dateStr = `${date} ${text}`;


        setSlotTime(dateStr);

    }, [slotDate]);

    const navigate = useNavigate();

    const sendToLogin = useCallback(() => {
        if (loginId) return;
        closeAndClearData();
        navigate("/member/login");
    }, [loginId]);

    const goReview = useCallback(() => {
        navigate(`/restaurant/detail/${restaurantId}/review`);
    }, []);

    const selectSeatByType = useCallback((type) => {
        if (!availableSeatList) return;
        const seat = availableSeatList.find(s => s.seatType === type);

        if (seat) {
            setSelectedSeat(seat);

        }
    }, [availableSeatList]);

    const seatTypeList = useMemo(() => {
        if (!availableSeatList) return;
        const types = availableSeatList.map(s => s.seatType);
        const typeGroups = [...new Set(types)];
        return typeGroups;

    }, [availableSeatList]);

    const lockSlot = useCallback(async () => {
        if (!selectedSeat || !slotTime) return;

        const request = {
            seatId: selectedSeat.seatId,
            slotLockedBy: loginId,
            slotLockTime: slotTime
        };

        try {
            const response = await axios.post("/slot/lock", request);
            return response.data;
        }
        catch (error) {
            console.log(error);
        }

    }, [selectedSeat, slotTime, loginId]);

    const sendData = useCallback(async () => {

        if (!slotTime || !selectedSeat || !peopleCount || !fullInfo) return;

        const choice = await Swal.fire({
            title: "예약 정보를 확인해주세요",
            text: `${fullInfo.restaurantName} · ${slotTime} · ${selectedSeat.seatType} · ${peopleCount}명`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "예약 페이지로 이동",
            cancelButtonText: "정보 변경",
            confirmButtonColor: "#00b894",
            cancelButtonColor: "#ff7675",
        });

        if (!choice.isConfirmed) return;

        let lockId;

        try {
            lockId = await lockSlot();
            
        }
        catch (error) {
            console.error("에러 로그", error);

            toast.error("좌석을 잠글 수 없습니다");
            return;
        }

        if(!lockId) {
            toast.error("이미 예약된 좌석입니다");
            return;
        }

        const info = {
            reservationTarget: selectedSeat.seatRestaurantId,
            reservationSeat: selectedSeat.seatId,
            reservationPeopleCount: peopleCount,
            reservationTime: slotTime,
            selectedRestaurant: fullInfo.restaurantName,
            selectedSeat: selectedSeat.seatType,
            lockId: lockId
        };

        closeModal();
        navigate("/reservation/add", { state: info });

    }, [slotTime, selectedSeat, peopleCount, fullInfo]);

    const openModalAndChangeTimeValue = useCallback(() => {
        openModal();
        changeSlotTime();
    }, []);

    if (fullInfo === null) {
        return (
            <>
                <div className="row my-4">
                    <div className="col text-center">
                        <ScaleLoader size={100} color="#7eb6ac" />
                        <div className="my-2">loading...</div>
                    </div>
                </div>
            </>
        )
    }
    console.log(fullInfo.restaurantAvgRating);
    return (
        <>
            <div className="container">
                <Link to={`/restaurant/list`} className="text-decoration-none"><h3 className="mb-4"><FaAngleLeft className="me-2 fs-3" />목록으로</h3></Link>
                <div className="row border rounded mb-4 p-3">
                    <div className="col">
                        <div className="info-wrapper position-relative">
                            <div className="d-flex position-absolute top-0 end-0">
                                <span
                                    className="d-flex flex-column align-items-center"
                                    onClick={toggleWish}
                                    style={{ cursor: "pointer", userSelect: "none" }}
                                >
                                    {isWish ? (
                                        <FaBookmark className="fs-4 text-secondary" /> // 저장됨: 채워진 아이콘
                                    ) : (
                                        <FaRegBookmark className="fs-4 text-secondary" /> // 미저장: 빈 아이콘
                                    )}
                                    <span style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                                        {wishCount} {/* 실시간 저장 개수 */}
                                    </span>
                                </span>
                            </div>
                            <img src={`http://192.168.20.12:8080/restaurant/image/${restaurantId}`} className="w-100 mb-4" style={{ height: "450px" }} />
                        </div>
                        <span className="fs-1 me-2">{fullInfo.restaurantName}</span>
                        <div className="review-info-wrapper d-flex" style={{ cursor: "pointer" }} onClick={goReview}>
                            <span className="d-flex align-items-center"><FaStar className="text-warning me-2" />{(fullInfo.restaurantAvgRating ?? 0).toFixed(1)}</span>
                            <span className="ms-2">  ·  리뷰 <span>{fullInfo.reviewCount}</span>개 ＞</span>
                        </div>
                        <div className="mt-2">{fullInfo.restaurantDescription}</div>
                        <hr />

                        <div className="mt-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
                            {line.map((l, idx) => (
                                <span
                                    key={idx}
                                    className="badge rounded-pill me-1"
                                    style={{
                                        backgroundColor: lineColors[l.colorKey] || "#000000",
                                        fontSize: "0.7rem",
                                    }}>
                                    {l.name}
                                </span>
                            ))}
                            <span className="ms-1">{distance}</span>
                            <IoIosArrowDown className="text-info ms-2" />
                        </div>
                        {/* 예약금 */}
                        <div className="mt-2 d-flex align-items-center"><FaWonSign className="me-2" />
                            <span>{fullInfo.restaurantReservationPrice} (1인)</span>
                        </div>
                        <div className="mt-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
                            <FaCalendar className="me-2" />
                            <span>오늘 ({today})  ·  {openHours}</span><IoIosArrowDown className="text-info ms-2" />
                        </div>
                        <div className="tag-wrapper my-3">
                            <span className="badge bg-light">최대 {fullInfo.restaurantMaxPeople}명 예약</span>
                            <span className="ms-3 badge bg-primary">{fullInfo.placeGroupName}</span>
                            <span className="ms-3 badge bg-secondary">{fullInfo.categoryName}</span>
                        </div>
                    </div>
                </div>
                <div className="row p-2 bg-white border">
                    <div className="d-flex justify-content-between">
                        <Link to={`/restaurant/detail/${restaurantId}`} className="list-group-item text-primary">홈</Link>
                        <Link to={`/restaurant/detail/${restaurantId}/menu`} className="text-decoration-none">메뉴</Link>
                        <Link to={`/restaurant/detail/${restaurantId}/review`} className="text-decoration-none">리뷰</Link>
                        {/* <Link className="text-decoration-none">매장정보</Link> */}
                    </div>
                </div>
                <Outlet />
                <div className="row p-4 border">
                    <div className="col">
                        <div className="my-4 info p-3 text-center border rounded" style={{ cursor: "pointer" }} onClick={openModal}>
                            <span>
                                {slotDate || peopleCount ? (
                                    <div className="d-flex align-items-center justify-content-center">
                                        {formatDate}<span className="mx-3">·</span><FaUser className="fs-6 me-2" /> {peopleCount}명
                                    </div>
                                ) : (
                                    "날짜 · 인원 · 시간"
                                )}
                            </span>
                        </div>
                        {/* 슬롯 영역 */}
                        {(!peopleCount || !slotDate) &&
                            <div className="row my-2">
                                <div className="col">
                                    <div className="slot-wrapper d-flex">
                                        <Swiper
                                            className="w-100"
                                            spaceBetween={10}       // 슬라이드 사이 간격
                                            slidesPerView={4}       // 한 화면에 보여줄 슬라이드 수
                                            pagination={false} // 페이지 네비게이션
                                        >
                                            {restaurantSlot.map(slot => (
                                                <SwiperSlide key={slot.date}>
                                                    <button
                                                        className={`btn text-nowrap d-flex flex-column align-items-center ${slot.status === "휴무" || slot.status === "예약 마감" || slot.status === "영업 마감" ? "btn-light" : "btn-outline-primary"} w-100`}
                                                        disabled={slot.status === "예약 마감" || slot.status === "휴무" || slot.status === "영업 마감"}
                                                        onClick={() => selectSlot(slot)}
                                                    >
                                                        {slot.isToday && <small className={`text-${slot.status === "휴무" ? "dark" : ""} mt-1`}>오늘 ({slot.dayName})</small>}
                                                        {slot.isTomorrow && <small className={`text-${slot.status === "휴무" ? "dark" : ""} mt-1`}>내일 ({slot.dayName})</small>}
                                                        {!slot.isToday && !slot.isTomorrow && <small className={`text-${slot.status === "휴무" ? "dark" : ""} mt-1`}>{slot.dateStr} ({slot.dayName})</small>}
                                                        <small className={`text-${slot.status === "휴무" || slot.status === "예약 마감" || slot.status === "영업 마감" ? "dark" : ""} fw-bold mt-1`}>{slot.status}</small>
                                                    </button>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>}
                        {peopleCount &&
                            <div className="row my-2">
                                <div className="col-sm-12">
                                    {peopleCount <= fullInfo.restaurantMaxPeople ? (
                                        <div className="slot-wrapper d-flex">
                                            <Swiper
                                                className="w-100"
                                                key={peopleCount}
                                                spaceBetween={10}
                                                slidesPerView={10}
                                                breakpoints={{
                                                    768: {
                                                        slidesPerView: 10
                                                    }
                                                }}
                                                pagination={false}>
                                                {availableSlots.map(slot => (
                                                    <SwiperSlide key={slot.timeStr}>
                                                        <span className={`btn btn-outline-secondary`} onClick={openModalAndChangeTimeValue}>
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
                            </div>}
                    </div>
                </div>
                {/* 메뉴 */}
                <div className="row my-4">
                    <div className="col">
                        <div className="border ronded p-4">
                        <div className="title-wrapper">
                            <span className="fs-3">매장 정보</span>
                        </div>
                        <div className="mt-2">
                            <span><FaLocationDot className="me-2" />{fullInfo.restaurantAddress}</span>
                        </div>
                        <div className="row mt-2">
                            <div className="col">
                                <div
                                    className="kakao-map mt-3"
                                    ref={mapRef}
                                    style={{ width: "100%", height: "350px", border: "1px solid #ddd" }}
                                >
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 영역 */}
            <div className="modal fade" tabIndex={-1} data-bs-backdrop="static" ref={modal} data-bs-keyboard="false">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="btn-close" onClick={closeModal}></button>
                        </div>
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
                                            className="w-100"
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
                                    {peopleCount <= fullInfo.restaurantMaxPeople ? (
                                        <div className="slot-wrapper d-flex">
                                            <Swiper
                                                className="w-100"
                                                key={peopleCount}
                                                spaceBetween={10}
                                                slidesPerView={6}
                                                pagination={false}>
                                                {availableSlots.map(slot => (
                                                    <SwiperSlide key={slot.timeStr}>
                                                        <span className={`btn btn-outline-secondary`} onClick={changeSlotTime}>
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
                            {availableSeatList.length > 0 && (
                                <div className="row mt-4">
                                    <div className="col d-flex justify-content-center">
                                        {seatTypeList.map(type => (
                                            <button
                                                className="btn btn-light border py-4 w-25 mx-3"
                                                key={type}
                                                onClick={() => selectSeatByType(type)}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedSeat && (
                                <div className="row mt-4">
                                    <div className="col">
                                        <div className="btn-wrapper d-flex justify-content-center">
                                            {loginId ? <button className="btn btn-outline-primary w-100" onClick={sendData} disabled={!loginId}>예약하기</button> : <button className="btn btn-info" onClick={sendToLogin}>로그인 후 이용해주세요</button>}
                                        </div>
                                    </div>
                                </div>)}
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