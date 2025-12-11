import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import { FaPhone, FaPhoneAlt, FaPhoneSlash, FaRegBookmark, FaStar } from "react-icons/fa";
import { IoIosArrowDown, IoIosCall } from "react-icons/io";

export default function RestaurantDetail() {
    const [restaurant, setRestaurant] = useState(null);

    const { restaurantId } = useParams();

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

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!restaurant) return;

        const placeService = new kakao.maps.services.Places();

        const option = {
            location: new kakao.maps.LatLng(restaurant.restaurantAddressY, restaurant.restaurantAddressX),
            radius: 1000,
            sort: kakao.maps.services.SortBy.DISTANCE
        };

        placeService.keywordSearch("지하철역", (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const stationsMap = {};

                data.forEach(place => {
                    const tokens = place.place_name.split(" ");
                    const name = tokens[0];
                    const lineRaw = tokens[1] || "";

                    // '역'으로 끝나지 않으면 skip
                    if (!name.endsWith("역")) return;

                    // 호선 처리
                    let lineName = "";
                    let lineColorKey = "";

                    const numberMatch = lineRaw.match(/\d+/);
                    if (numberMatch) {
                        lineName = numberMatch[0];
                        lineColorKey = lineRaw;
                    }
                    else if (lineRaw.includes("공항철도")) {
                        lineName = "공항";
                        lineColorKey = lineRaw;
                    }
                    else {
                        lineName = lineRaw.endsWith("선") ? lineRaw.slice(0, -1) : lineRaw;
                        lineColorKey = lineRaw;
                    }

                    // 역별 데이터 병합
                    if (!stationsMap[name]) {
                        stationsMap[name] = {
                            name, lines: [],
                            lineColorKeys: [],
                            distance: place.distance
                        };
                    }

                    if (!stationsMap[name].lines.includes(lineName)) {
                        stationsMap[name].lines.push(lineName);
                        stationsMap[name].lineColorKeys.push(lineColorKey); // 색상 저장
                    }
                });


                // 거리 기준 정렬
                const stations = Object.values(stationsMap).sort((a, b) => a.distance - b.distance);
                const closestStation = stations[0];

                if (!closestStation) {
                    setDistance(restaurant.restaurantAddress);
                    setline([]);
                    return;
                }

                // line 배열을 {name, colorKey} 객체로 저장
                const lineData = closestStation.lines.map((name, idx) => ({
                    name,
                    colorKey: closestStation.lineColorKeys[idx] // 미리 저장된 색상 키
                }));

                const isFar = closestStation.distance > 1000;

                // 거리 표시
                setDistance(isFar ? restaurant.restaurantAddress : `${closestStation.name}에서 ${closestStation.distance}m`);

                // 호선 배열 저장
                setline(lineData);

            } else {
                setDistance(restaurant.restaurantAddress);
                setline([]);
            }
        }, option);
    }, [restaurant]);




    const loadData = useCallback(async () => {
        try {
            const { data } = await axios.get(`/restaurant/${restaurantId}`);
            console.log(data);
            setRestaurant(data);
        }
        catch (err) {
            toast.error("요청이 정상적으로 처리되지 않았습니다");
        }
    }, []);

    const openHours = useMemo(() => {
        if (restaurant === null) return;

        const openingDays = restaurant.restaurantOpeningDays;

        const isOpeningDay = openingDays.includes(today);

        if (isOpeningDay) {
            return `${restaurant.restaurantOpen} ~ ${restaurant.restaurantClose}`;
        }

        return "휴무일";
    }, [today, restaurant]);


    if (restaurant === null) {
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

    return (
        <>  <div className="container">
            <div className="row border mb-4 p-3">
                <div className="col">
                    <img src="https://www.dummyimage.com/300X150/ddd/000&text=profile" className="w-100 mb-4" />
                    <h1>{restaurant.restaurantName}</h1>
                    <div className="review-info-wrapper d-flex">
                        <span className="d-flex align-items-center"><FaStar className="text-warning me-2" />{restaurant.restaurantAvgRating}</span>
                        <span className="ms-2">  ·  리뷰 0개 ＞</span>
                    </div>
                    <div className="mt-2">{restaurant.restaurantDescription}</div>
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

                    <div className="mt-2">점심 ? 원 · 저녁 ? 원 </div>
                    <div className="mt-2" style={{ cursor: "pointer" }}>오늘 ({today})  ·  {openHours}<IoIosArrowDown className="text-info ms-2" /></div>
                    <div className="tag-wrapper my-3">
                        <span className="badge bg-divght">최대 ?명 예약</span>
                        <span className="ms-2 badge bg-divght">주차</span>
                        <span className="ms-2 badge bg-divght">룸</span>
                    </div>
                </div>
            </div>
            <div className="row p-2 bg-white border">
                    <div className="d-flex justify-content-between">
                        <div className="divst-group-item">홈</div>
                        <div className="divst-group-item">소식</div> 
                        <div className="divst-group-item">메뉴</div> 
                        <div className="divst-group-item">사진</div> 
                        <div className="divst-group-item">리뷰</div>
                        <div className="divst-group-item">매장정보</div> 
                    </div>    
            </div>
            <div className="row p-4 border">
                <div className="col">
                    <h1>예약</h1>
                    <div className="my-4 info border p-2 w-50 rounded text-center" style={{ cursor: "pointer" }}>
                        <span>날짜 · 시간 · 인원</span>
                    </div>
                    <span className="badge bg-info border p-2 rounded text-center" style={{ cursor: "pointer" }}>오후 1: 30</span>
                    <span className="badge ms-3 bg-info border p-2 rounded text-center" style={{ cursor: "pointer" }}>오후 2: 30</span>
                    <span className="ms-3">...</span>
                    <div className="btn-wrapper mt-4 d-flex justify-content-center">
                        <button className="btn btn-divght">예약 가능 날짜 찾기</button>
                    </div>
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
                        <span className="d-flex flex-column align-items-center"><FaRegBookmark className="fs-4" />
                        0
                        </span>
                        <span className="ms-3 d-flex flex-column align-items-center"><FaPhoneAlt className="fs-4" />전화</span>
                    </div>
                        <button className="ms-4 btn btn-primary rounded-pill" style={{width : "80%"}}>예약하기</button>
                </div>
            </div>

        </div>
        </>
    )
}