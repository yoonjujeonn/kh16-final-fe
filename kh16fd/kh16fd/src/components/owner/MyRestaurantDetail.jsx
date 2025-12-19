import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { toast } from "react-toastify";
import { TbTilde } from "react-icons/tb";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

import { useDaumPostcodePopup } from "react-daum-postcode";


export default function MyRestaurantDetail() {

  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [accessToken] = useAtom(accessTokenState);

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  //지도 관련 
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  //카테고리
  const [parentList, setParentList] = useState([]);
  const [childList, setChildList] = useState([]);
  const [parentNo, setParentNo] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    axios.get(`/owner/${restaurantId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        setForm(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("식당 정보를 불러올 수 없습니다");
        navigate("/owner/my-restaurant");
      });
  }, [restaurantId, accessToken, navigate]);

  useEffect(() => {
    if (!form || !window.kakao) return;

    const centerLat = form.restaurantAddressY || 37.499002;
    const centerLng = form.restaurantAddressX || 127.032842;

    mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(centerLat, centerLng),
      level: 2
    });

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (form.restaurantAddressX && form.restaurantAddressY) {
      const position = new window.kakao.maps.LatLng(
        form.restaurantAddressY,
        form.restaurantAddressX
      );

      const marker = new window.kakao.maps.Marker({ position });
      marker.setMap(mapInstance.current);
      markersRef.current.push(marker);
    }
  }, [form]);

  const change = useCallback(e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  //시간 변경
  const changeTimeValue = useCallback(
    (key) => (value) => {
      setForm(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  //주소 검색
  const openPostcode = useDaumPostcodePopup(
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  );

  const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

  /* 요일 체크 여부 */
  const isCheckedDay = useCallback((day) => {
    const days = form.restaurantOpeningDays
      ? form.restaurantOpeningDays.split(",")
      : [];
    return days.includes(day);
  }, [form]);

  /* 요일 토글 */
  const toggleDay = useCallback((day) => {
    setForm(prev => {
      const current = prev.restaurantOpeningDays
        ? prev.restaurantOpeningDays.split(",")
        : [];

      const updated = current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day];

      return {
        ...prev,
        restaurantOpeningDays: updated.join(",")
      };
    });
  }, []);

  const searchAddress = useCallback(() => {
    openPostcode({
      onComplete: (data) => {
        const addr = data.jibunAddress || data.autoJibunAddress;

        setForm(prev => ({
          ...prev,
          restaurantAddress: addr
        }));

        if (!window.kakao) return;
        const geocoder = new window.kakao.maps.services.Geocoder();

        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        geocoder.addressSearch(addr, (result, status) => {
          if (status !== window.kakao.maps.services.Status.OK) return;

          const lat = result[0].y;
          const lng = result[0].x;

          setForm(prev => ({
            ...prev,
            restaurantAddressX: lng,
            restaurantAddressY: lat
          }));

          const location = new window.kakao.maps.LatLng(lat, lng);
          mapInstance.current.panTo(location);

          const marker = new window.kakao.maps.Marker({ position: location });
          marker.setMap(mapInstance.current);
          markersRef.current.push(marker);
        });
      }
    });
  }, [openPostcode]);

  const save = useCallback(() => {
    axios.patch(`/owner/edit/${restaurantId}`, form, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(() => {
        toast.success("수정 완료");
        navigate("/owner/my-restaurant");
      })
      .catch(() => toast.error("수정 실패"));
  }, [form, restaurantId, accessToken, navigate]);

  if (loading || !form) {
    return <div className="container mt-5">로딩중...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">식당 정보 수정</h2>

      <div className="card mb-4">
        <div className="card-body">

          {/* 식당명 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">식당명</label>
            <div className="col-sm-9">
              <input
                name="restaurantName"
                className="form-control"
                value={form.restaurantName || ""}
                onChange={change}
              />
            </div>
          </div>

          {/* 전화번호 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">전화번호</label>
            <div className="col-sm-9">
              <input
                name="restaurantContact"
                className="form-control"
                value={form.restaurantContact || ""}
                onChange={change}
              />
            </div>
          </div>

          {/* 주소 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">주소</label>
            <div className="col-sm-9">
              <div className="input-group mb-2">
                <input
                  className="form-control"
                  value={form.restaurantAddress || ""}
                  readOnly
                />
                <button className="btn btn-info" onClick={searchAddress}>
                  주소 수정
                </button>
              </div>

              <div
                ref={mapRef}
                style={{
                  width: "100%",
                  height: "300px",
                  border: "1px solid #ddd"
                }}
              />
            </div>
          </div>

          {/* 설명 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">설명</label>
            <div className="col-sm-9">
              <textarea
                name="restaurantDescription"
                className="form-control"
                rows="4"
                value={form.restaurantDescription || ""}
                onChange={change}
              />
            </div>
          </div>

          {/* 영업시간 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">오픈 시간</label>
            <div className="col-sm-9">
              <TimePicker
                value={form.restaurantOpen}
                onChange={changeTimeValue("restaurantOpen")}
                disableClock
                format="HH:mm"
                clearIcon={null}
              />
            </div>
          </div>

          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">마감 시간</label>
            <div className="col-sm-9">
              <TimePicker
                value={form.restaurantClose}
                onChange={changeTimeValue("restaurantClose")}
                disableClock
                format="HH:mm"
                clearIcon={null}
              />
            </div>
          </div>

          {/* 브레이크 타임 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">브레이크 타임</label>
            <div className="col-sm-9 d-flex align-items-center react-time-picker">
              <TimePicker
                value={form.restaurantBreakStart}
                onChange={changeTimeValue("restaurantBreakStart")}
                disableClock
                format="HH:mm"
                clearIcon={null}
              />
              <TbTilde className="mx-2" />
              <TimePicker
                value={form.restaurantBreakEnd}
                onChange={changeTimeValue("restaurantBreakEnd")}
                disableClock
                format="HH:mm"
                clearIcon={null}
              />
            </div>
          </div>

          {/* 라스트오더 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">라스트 오더</label>
            <div className="col-sm-9">
              <TimePicker
                value={form.restaurantLastOrder}
                onChange={changeTimeValue("restaurantLastOrder")}
                disableClock
                format="HH:mm"
                clearIcon={null}
              />
            </div>
          </div>

          {/* 영업 요일 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">영업 요일</label>
            <div className="col-sm-9 d-flex flex-wrap">
              {weekdays.map(day => (
                <label key={day} className="form-check me-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={isCheckedDay(day)}
                    onChange={() => toggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          {/* 예약금 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">예약금</label>
            <div className="col-sm-9">
              <input
                type="number"
                name="restaurantReservationPrice"
                className="form-control w-50"
                value={form.restaurantReservationPrice ?? ""}
                onChange={change}
              />
            </div>
          </div>

          {/* 예약 간격 */}
          <div className="row mt-4">
            <label className="col-sm-3 col-form-label">예약 시간 간격</label>
            <div className="col-sm-9">
              <input
                type="number"
                name="reservationInterval"
                className="form-control w-50"
                value={form.reservationInterval ?? ""}
                onChange={change}
              />
            </div>
          </div>

        </div>
      </div>

      {/* 버튼 */}
      <div className="d-flex justify-content-end">
        <button
          className="btn btn-secondary me-2"
          onClick={() => navigate("/owner/my-restaurant")}
        >
          취소
        </button>
        <button className="btn btn-primary me-2" onClick={save}>
          저장
        </button>
        <button className="btn btn-primary" onClick={() =>
            navigate(`/owner/my-restaurant/${restaurantId}/manage`)}
        >
          운영 정보 관리
        </button>
      </div>
    </div>
  );
}
