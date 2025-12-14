// import { useCallback, useRef, useState } from "react";
// import { FaAsterisk } from "react-icons/fa";
// import { TbTilde } from "react-icons/tb";
// import TimePicker from 'react-time-picker';
// import '/src/custom-css/timepicker-custom.css';
// import { DayPicker } from "react-day-picker";
// import "react-day-picker/dist/style.css";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useAtom } from "jotai";
// import { restaurantInfoState } from "../../utils/jotai";
// import axios from "axios";
// import { toast } from "react-toastify";

// export default function ReservationInfo() {

//     const [basicInfo, setBasicInfo] = useAtom(restaurantInfoState);

//     const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

//     // 체크박스 토글 시 바로 DB 저장용 문자열로 업데이트
//     const handleWeekdayToggle = useCallback((day) => {
//         const currentString = basicInfo.restaurantOpeningDays || "";
//         const current = currentString ? currentString.split(",") : [];

//         const updated = current.includes(day)
//             ? current.filter(d => d !== day)  // 해제
//             : [...current, day];             // 선택

//         const updatedString = updated.join(","); // "월,화,수" 형태

//         setBasicInfo(prev => ({
//             ...prev,
//             restaurantOpeningDays: updatedString
//         }));
//     }, [basicInfo]);

//     // 체크박스 체크 여부 확인
//     const isChecked = useCallback((day) => {
//         const currentString = basicInfo.restaurantOpeningDays || "";
//         const current = currentString ? currentString.split(",") : [];
//         return current.includes(day);
//     }, [basicInfo]);

//     const changeTimeValue = useCallback((field) => (value) => {
//         const time = value === null ? "" : value.toString();
//         console.log(time)
//         setBasicInfo(prev => ({
//             ...prev,
//             [field]: time
//         }));
//     }, []);

//     const changeStrValue = useCallback(e => {
//         const { name, value } = e.target;
//         setBasicInfo(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     }, []);

//     const navigate = useNavigate();

//     //식당 데이터 전송
//    const sendData = useCallback(async ()=>{
//        try {
//             const {data} = await axios.post("/restaurant/", basicInfo);
//             const id = data.restaurantId
//             navigate(`/restaurant/add/info/${id}`);
//         }
//         catch(err){
//             toast.error("요청이 정상적으로 처리되지 않았습니다");
//         }
//     },[basicInfo]);

//     const clearData = useCallback(() => {
//         setBasicInfo({
//             restaurantName: "",
//             restaurantContact: "",
//             restaurantAddress: "",
//             address1: "",
//             address2: "",
//             restaurantAddressX: "",
//             restaurantAddressY: "",
//             restaurantOpen: "",
//             restaurantClose: "",
//             restaurantBreakStart: "",
//             restaurantBreakEnd: "",
//             reservationInterval: "",
//             restaurantOpeningDays: "",
//             restaurantLastOrder: "",
//             restaurantReservationPrice: "",
//             restaurantDescription: "",
//             categoryList : []
//         });
//     }, []);

//     return (
//         <>
//             <div className="progress">
//                 <div className="progress-bar" role="progressbar" style={{ width: "60%" }}>
//                 </div>
//             </div>
            
//             <div className="row mt-4">
//                 <label className="col-sm-3 col-form-label">영업일</label>
//                 <div className="col-sm-9 d-flex flex-wrap">
//                     {weekdays.map(day => (
//                         <label key={day} className="form-check me-2">
//                             <input
//                                 type="checkbox" className="form-check-input"
//                                 checked={isChecked(day)}
//                                 onChange={() => handleWeekdayToggle(day)}
//                             />
//                             {day}
//                         </label>
//                     ))}
//                 </div>
//             </div>

//             <div className="row mt-4">
//                 <label className="col-sm-3 col-form-label">오픈 시간</label>
//                 <div className="col-sm-9 react-time-picker">
//                     <TimePicker onChange={changeTimeValue("restaurantOpen")} value={basicInfo.restaurantOpen} disableClock={true}
//                         format="HH:mm" clearIcon={null}
//                     />
//                 </div>
//             </div>
//             <div className="row mt-4">
//                 <label className="col-sm-3 col-form-label">마감 시간</label>
//                 <div className="col-sm-9 react-time-picker">
//                     <TimePicker onChange={changeTimeValue("restaurantClose")} value={basicInfo.restaurantClose} disableClock={true}
//                         format="HH:mm" clearIcon={null}
//                     />
//                 </div>
//             </div>

//             <div className="row mt-4">
//                 <label className="col-sm-3 col-form-label">브레이크 타임</label>
//                 <div className="col-sm-9 react-time-picker align-items-center">
//                     <TimePicker onChange={changeTimeValue("restaurantBreakStart")} value={basicInfo.restaurantBreakStart} disableClock={true}
//                         format="HH:mm" clearIcon={null}
//                     />
//                     <TbTilde className="mx-2" />
//                     <TimePicker onChange={changeTimeValue("restaurantBreakEnd")} value={basicInfo.restaurantBreakEnd} disableClock={true}
//                         format="HH:mm" clearIcon={null}
//                     />
//                 </div>
//             </div>
//             <div className="row mt-4">
//                 <label className="col-sm-3 col-form-label">라스트오더</label>
//                 <div className="col-sm-9 react-time-picker">
//                     <TimePicker onChange={changeTimeValue("restaurantLastOrder")} value={basicInfo.restaurantLastOrder} disableClock={true}
//                         format="HH:mm" clearIcon={null}
//                     />
//                 </div>
//             </div>
//             <div className="row mt-4">
//                 <label className="col-sm-3 col-form-label">예약 시간 간격</label>
//                 <div className="col-sm-9">
//                     <input type="text" name="reservationInterval" className="form-control w-50" value={basicInfo.reservationInterval} placeholder="미설정 시 30분" onChange={changeStrValue} />
//                 </div>
//             </div>
//             <div className="row mt-4">
//                 <label className="col-sm-3 col-form-label">예약금</label>
//                 <div className="col-sm-9">
//                     <input type="text" name="restaurantReservationPrice" className="form-control w-50" value={basicInfo.restaurantReservationPrice} placeholder="미설정 시 5000원 " onChange={changeStrValue} />
//                 </div>
//             </div>
//             <div className="row mt-4">
//                 <div className="col d-flex justify-content-between">
//                     <div className="btn-wrapper">
//                         <Link to="/restaurant/add/category" className="btn btn-secondary">이전으로</Link>
//                     </div>
//                     <div className="btn-wrapper">
//                         <button type="button" className="btn btn-success" onClick={sendData}>등록 완료</button>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }