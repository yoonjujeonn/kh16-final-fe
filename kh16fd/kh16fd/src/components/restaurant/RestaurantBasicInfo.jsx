import { usePreventRefresh } from "../../hooks/usePreventRefresh"
import { FaMagnifyingGlass, FaX, FaXmark } from "react-icons/fa6";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";
import axios from "axios";

//식당 기본정보 설정 페이지
export default function RestaurantBasicInfo({ data, setData, onNext }) {
    
    const mapRef = useRef(null);         // 지도 DOM
    const mapInstance = useRef(null);    // kakao map 객체
    const markersRef = useRef([]);       // 마커 히스토리
    const address2Ref = useRef(null);    // 상세주소 input

    const [basicInfo, setBasicInfo] = useState(data);
    
    // 상위 / 하위 카테고리 목록 상태
    const [parentList, setParentList] = useState([]);
    const [childList, setChildList] = useState([]);

    // 선택된 상위 카테고리 번호
    const [parentNo, setParentNo] = useState("");

    //effect
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

    // 상위 카테고리 목록 불러오기
    useEffect(() => {
        axios.get("http://localhost:8080/category/parent")
            .then(res => setParentList(res.data))
            .catch(err => console.log("상위 카테고리 불러오기 실패", err));
    }, []);

    // 하위 카테고리 불러오기
    const loadChild = useCallback(async (no) => {
        setParentNo(no);

        if (!no) {
            setChildList([]);
            return;
        }

        const res = await axios.get(`http://localhost:8080/category/child/${no}`)
        setChildList(res.data);

    }, [parentList]);

    const toggleCategory = useCallback((categoryId) => {
        const id = parseInt(categoryId);

        setBasicInfo(prev => {
            const currentList = prev.categoryIdList || [];
            const isSelected = currentList.includes(id);
            const currentPreview = prev.preview || [];

            let updated;
            let updatedPreview;

            if (isSelected) {
                updated = currentList.filter(item => item !== id);
                updatedPreview = currentPreview.filter(p => p.childId !== id);
            } else {
                updated = [...currentList, id];

                const child = childList.find(c => c.categoryNo === id);
                const parent = parentList.find(p => p.categoryNo === child?.parentCategoryNo);

                const newItems = {
                    childId: id,
                    childName: child?.categoryName || "",
                    parentId: parent?.categoryNo || null,
                    parentName: parent?.categoryName || ""
                };

                updatedPreview = [...currentPreview, newItems];
            }

            return {
                ...prev,
                categoryIdList: updated,
                preview: updatedPreview
            };
        });

    }, [basicInfo, childList, parentList]);

    // 체크 여부
    const isChecked = useCallback((id) => {
        return basicInfo.categoryIdList?.includes(id) || false;
    }, [basicInfo]);

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
            restaurantAddress: "",
            restaurantAddressX: "",
            restaurantAddressY: ""
        }));

        if (!window.kakao) return;
        mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
            center: new window.kakao.maps.LatLng(37.499002, 127.032842),
            level: 2
        });

    }, []);

    const nextStep = () => {
        setData(basicInfo); // 부모 state 업데이트
        onNext();           // 부모에서 정의한 다음 단계 이동 함수 호출
    };
    const entered = useMemo(() => {
        return JSON.stringify(basicInfo) !== JSON.stringify(data);
    }, [basicInfo, data]);

    const { } = usePreventRefresh(entered);

    // Daum 우편번호 팝업
    const openPostcode = useDaumPostcodePopup("https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js");

    const searchAddress = useCallback(() => {
        openPostcode({
            onComplete: (data) => {
                const addr = data.jibunAddress || data.autoJibunAddress;
                setBasicInfo(prev => ({ ...prev, address1: addr, address2: "", restaurantAddress: addr }));

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
            <div className="row">
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
                                    setBasicInfo(prev =>
                                    ({
                                        ...prev,
                                        address2: e.target.value,
                                        restaurantAddress: e.target.value ? `${basicInfo.address1} ${e.target.value}` : basicInfo.address1
                                    }))
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

                     {/* 카테고리 선택 */}
                    
                    {/* 상위 카테고리 */}
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">카테고리 선택</label>
                        <div className="col-sm-9">
                            <select
                                className="form-select"
                                value={parentNo}
                                onChange={(e) => loadChild(e.target.value)}
                            >
                                <option value="">상위 카테고리 선택</option>
                                {parentList.map(item => (
                                    <option key={item.categoryNo} value={item.categoryNo}>
                                        {item.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 하위 카테고리 */}
                    {childList.length > 0 && (
                        <div className="row mt-4">
                            <div className="d-flex flex-wrap">

                                {childList.map(child => (
                                    <label
                                        key={child.categoryNo}
                                        className="form-check me-3"
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={isChecked(child.categoryNo)}
                                            onChange={() => toggleCategory(child.categoryNo)}
                                        />
                                        {child.categoryName}
                                    </label>
                                ))}

                            </div>
                        </div>
                    )}

                    {/* 선택 항목 보여주기 */}
                    <div className="row-mt-4">
                        <div className="col">
                            {basicInfo.preview.length > 0 &&
                                (<ul className="list-group mt-4">
                                    <li className="list-group-item list-group-item-primary">선택한 카테고리</li>
                                    {basicInfo.preview.map(p => (
                                        <li className="list-group-item" key={p.childId}>
                                            {p.childName} ({p.parentName}) &nbsp;
                                        </li>
                                    ))}
                                </ul>
                                )
                            }
                        </div>
                    </div>

                    {/* 식당 소개 */}
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">식당 소개글</label>
                        <div className="col-sm-9 text-end">
                            <textarea type="text" name="restaurantDescription" className="form-control" value={basicInfo.restaurantDescription} onChange={changeStrValue} style={{ resize: "none" }} rows={10} />
                        </div>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="row mt-4">
                        <div className="col d-flex justify-content-end">
                            <div className="btn-wrapper">
                                <button className="btn btn-primary" onClick={nextStep}>다음</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}