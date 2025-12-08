import { Link } from "react-router-dom";
import { FaMagnifyingGlass, FaX, FaXmark } from "react-icons/fa6";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { useAtom } from "jotai";
import { restaurantInfoState } from "../../utils/jotai";

export default function RestaurantInfo() {
    const mapRef = useRef(null);         // 지도 DOM
    const mapInstance = useRef(null);    // kakao map 객체
    const markersRef = useRef([]);       // 마커 히스토리
    const address2Ref = useRef(null);    // 상세주소 input

    const [basicInfo, setBasicInfo] = useAtom(restaurantInfoState);
    
    // 페이지 이동 시에도 마커 복원
    useEffect(() => {
        if (!window.kakao) return;
        mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
            center: new window.kakao.maps.LatLng(37.499002, 127.032842),
            level: 2
        });

        // 기존 마커 제거
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        // 좌표가 있으면 마커 생성
        if (basicInfo.restaurantAddressX && basicInfo.restaurantAddressY) {
            const position = new window.kakao.maps.LatLng(
                basicInfo.restaurantAddressY,
                basicInfo.restaurantAddressX
            );

            const markerImage = new window.kakao.maps.MarkerImage(
                "http://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png",
                new window.kakao.maps.Size(40, 45)
            );

            const marker = new window.kakao.maps.Marker({
                position,
                image: markerImage,
                draggable: false,
                clickable: true
            });

            marker.setMap(mapInstance.current);
            markersRef.current.push(marker);

            // 지도 중심 이동
            mapInstance.current.setCenter(position);
        }
    }, []); 



    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;

        setBasicInfo(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const hasAnyCharacter = useMemo(() => {
        if (basicInfo.address1.length > 0) return true;
        if (basicInfo.address2.length > 0) return true;
        return false;
    }, [basicInfo]);

    const clearAddress = useCallback(() => {
        setBasicInfo(prev => ({
            ...prev,
            address1: "",
            address2: "",
            restaurantAddress : "",
            restaurantAddressX : "",
            restaurantAddressY : ""
        }));

        if (!window.kakao) return;
        mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
            center: new window.kakao.maps.LatLng(37.499002, 127.032842),
            level: 2
        });
        
    }, []);

    // Daum 우편번호 팝업
    const openPostcode = useDaumPostcodePopup("https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js");

    const searchAddress = useCallback(() => {
        openPostcode({
            onComplete: (data) => {
                const addr = data.jibunAddress || data.autoJibunAddress;
                console.log(data);
                setBasicInfo(prev => ({ ...prev, address1: addr, address2: "" }));

                if (address2Ref.current) address2Ref.current.focus();

                // --- 바로 지도에 마커 찍기 ---
                if (!window.kakao) return;
                const geocoder = new window.kakao.maps.services.Geocoder();

                // 기존 마커 제거
                markersRef.current.forEach(m => m.setMap(null));
                markersRef.current = [];

                geocoder.addressSearch(addr, (result, status) => {
                    if (status !== window.kakao.maps.services.Status.OK) return;

                    const lat = result[0].y;
                    const lng = result[0].x;

                    //state에 x,y 값 설정
                    setBasicInfo(prev => ({
                        ...prev,
                        restaurantAddressX: lng,
                        restaurantAddressY: lat
                    }));

                    const location = new window.kakao.maps.LatLng(lat, lng);

                    // 지도 이동
                    mapInstance.current.panTo(location);

                    // 마커 생성
                    const markerImage = new window.kakao.maps.MarkerImage(
                        "http://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png",
                        new window.kakao.maps.Size(40, 45)
                    );

                    const marker = new window.kakao.maps.Marker({
                        position: location,
                        image: markerImage,
                        draggable: false,
                        clickable: true
                    });

                    marker.setMap(mapInstance.current);
                    markersRef.current.push(marker);
                });
            }
        });
    }, []);

    return (
        <>
            <div className="progress">
                <div className="progress-bar" role="progressbar" style={{ width: "30%" }}></div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    {/* 식당명 */}
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">식당명</label>
                        <div className="col-sm-9">
                            <input type="text" className="form-control"
                                name="restaurantName"
                                value={basicInfo.restaurantName}
                                onChange={changeStrValue}
                                placeholder="식당명 입력" />
                        </div>
                    </div>

                    {/* 연락처 */}
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">식당 연락처</label>
                        <div className="col-sm-9">
                            <input type="text" name="restaurantContact" className="form-control"
                                value={basicInfo.restaurantContact}
                                onChange={changeStrValue}
                                placeholder="- 제외하고 작성" />
                        </div>
                    </div>

                    {/* 주소 검색 */}
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">식당 주소</label>
                        <div className="col-sm-9">
                            <div className="input-group mb-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="기본 주소 입력"
                                    value={basicInfo.address1}
                                    readOnly
                                    onClick={searchAddress}
                                />
                                {hasAnyCharacter ?
                                    (<button className="btn btn-danger" onClick={clearAddress}>
                                        <FaXmark />
                                    </button>)
                                    :
                                    (<button className="btn btn-info" onClick={searchAddress}>
                                        <FaMagnifyingGlass />
                                    </button>)
                                }
                            </div>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="상세 주소 입력"
                                name="restaurantAddress"
                                ref={address2Ref}
                                value={basicInfo.address2}
                                onChange={e => {
                                    setBasicInfo(prev => ({ ...prev, address2: e.target.value, restaurantAddress: `${basicInfo.address1} ${e.target.value}` }))
                                }}
                            />

                            {/* 지도 */}
                            <div
                                className="kakao-map mt-3"
                                ref={mapRef}
                                style={{ width: "100%", height: "350px", border: "1px solid #ddd" }}
                            ></div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-end">
                    <Link to="/restaurant/add/info" className="btn btn-success">
                        예약 정보 설정
                    </Link>
                </div>
            </div>
        </>
    );
}