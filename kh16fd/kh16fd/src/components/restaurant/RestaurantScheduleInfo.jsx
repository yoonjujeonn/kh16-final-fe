import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaAsterisk } from "react-icons/fa";
import { TbTilde } from "react-icons/tb";
import TimePicker from 'react-time-picker';
import '/src/custom-css/timepicker-custom.css';
import "react-day-picker/dist/style.css";
import { usePreventRefresh } from "../../hooks/usePreventRefresh";

export default function RestaurantScheduleInfo({ data, setData, onPrev, onNext }) {
    //state
    const [scheduleInfo, setScheduleInfo] = useState(data);
    const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

    //callback
    // 체크박스 토글 시 바로 DB 저장용 문자열로 업데이트
    const handleWeekdayToggle = useCallback((day) => {
        const currentString = scheduleInfo.restaurantOpeningDays || "";
        const current = currentString ? currentString.split(",") : [];

        const updated = current.includes(day)
            ? current.filter(d => d !== day)  // 해제
            : [...current, day];             // 선택

        const updatedString = updated.join(","); // "월,화,수" 형태

        setScheduleInfo(prev => ({
            ...prev,
            restaurantOpeningDays: updatedString
        }));
    }, [scheduleInfo]);

    // 체크박스 체크 여부 확인
    const isChecked = useCallback((day) => {
        const currentString = scheduleInfo.restaurantOpeningDays || "";
        const current = currentString ? currentString.split(",") : [];
        return current.includes(day);
    }, [scheduleInfo]);

    const changeTimeValue = useCallback((field) => (value) => {
        const time = value === null ? "" : value.toString();
        setScheduleInfo(prev => ({
            ...prev,
            [field]: time
        }));
    }, []);

    const prevStep = () => {
        setData(scheduleInfo);
        onPrev();
    };

    const nextStep = () => {
        setData(scheduleInfo); // 부모 state 업데이트
        onNext();           // 부모에서 정의한 다음 단계 이동 함수 호출
    };

    const entered = useMemo(() => {
        return JSON.stringify(scheduleInfo) !== JSON.stringify(data);
    }, [scheduleInfo, data]);

    const { } = usePreventRefresh(entered);

    console.log(data);
    return (
        <>
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">영업일</label>
                <div className="col-sm-9 d-flex flex-wrap">
                    {weekdays.map(day => (
                        <label key={day} className="form-check me-2">
                            <input
                                type="checkbox" className="form-check-input"
                                checked={isChecked(day)}
                                onChange={() => handleWeekdayToggle(day)}
                            />
                            {day}
                        </label>
                    ))}
                </div>
            </div>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">오픈 시간</label>
                <div className="col-sm-9 react-time-picker">
                    <TimePicker onChange={changeTimeValue("restaurantOpen")} value={scheduleInfo.restaurantOpen} disableClock={true}
                        format="HH:mm" clearIcon={null}
                    />
                </div>
            </div>
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">마감 시간</label>
                <div className="col-sm-9 react-time-picker">
                    <TimePicker onChange={changeTimeValue("restaurantClose")} value={scheduleInfo.restaurantClose} disableClock={true}
                        format="HH:mm" clearIcon={null}
                    />
                </div>
            </div>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">브레이크 타임</label>
                <div className="col-sm-9 react-time-picker align-items-center">
                    <TimePicker onChange={changeTimeValue("restaurantBreakStart")} value={scheduleInfo.restaurantBreakStart} disableClock={true}
                        format="HH:mm" clearIcon={null}
                    />
                    <TbTilde className="mx-2" />
                    <TimePicker onChange={changeTimeValue("restaurantBreakEnd")} value={scheduleInfo.restaurantBreakEnd} disableClock={true}
                        format="HH:mm" clearIcon={null}
                    />
                </div>
            </div>
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">라스트오더</label>
                <div className="col-sm-9 react-time-picker">
                    <TimePicker onChange={changeTimeValue("restaurantLastOrder")} value={scheduleInfo.restaurantLastOrder} disableClock={true}
                        format="HH:mm" clearIcon={null}
                    />
                </div>
            </div>
            <div className="row mt-4">
                <div className="col d-flex justify-content-between">
                    <div className="btn-wrapper">
                        <button className="btn btn-secondary" onClick={prevStep} >이전으로</button>
                    </div>
                    <div className="btn-wrapper">
                        <button className="btn btn-primary" onClick={nextStep}>다음</button>
                    </div>
                </div>
            </div>
        </>
    )
}