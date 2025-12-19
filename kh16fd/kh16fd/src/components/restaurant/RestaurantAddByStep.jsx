import Jumbotron from "../templates/Jumbotron";
import RestaurantBasicInfo from "./RestaurantBasicInfo";
import RestaurantScheduleInfo from "./RestaurantScheduleInfo";
import { useCallback, useEffect, useState } from "react";
import RestaurantMoreInfo from "./RestaurantMoreInfo";
import { FaAsterisk } from "react-icons/fa";

const RestaurantAddByStep = () => {
    const [restaurantInfo, setRestaurantInfo] = useState({
        restaurantName: "",
        restaurantContact: "",
        restaurantAddress: "",
        restaurantAddressX: "",
        restaurantAddressY: "",
        address1: "",
        address2: "",
        restaurantOpen: "",
        restaurantClose: "",
        restaurantBreakStart: "",
        restaurantBreakEnd: "",
        reservationInterval: "",
        restaurantOpeningDays: "",
        restaurantLastOrder: "",
        restaurantReservationPrice: "",
        restaurantDescription: "",
        categoryIdList: [],
        preview: [],
        seatList: []
    });

    const [step, setStep] = useState(0);

    const steps = [
        (props) => <RestaurantBasicInfo {...props} />,
        (props) => <RestaurantScheduleInfo {...props} />,
        (props) => <RestaurantMoreInfo {...props} />
    ]

    const CurrentPage = steps[step];

    console.log(step);

    // 진행률 계산
    const percent = (step / steps.length) * 100;
    const isFirstStep = step === 0;
    const isLastStep = step === steps.length - 1;

    // 다음, 이전 버튼 핸들러
    const nextStep = () => {
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    return (
        <>
            <div className="title-wrapper mb-4">
                <h1>식당 신규 등록</h1>
                <div className="d-flex  justify-content-end align-items-center">
                    <FaAsterisk className="me-2 text-danger" />
                    <span className="text-muted">필수 항목을 모두 작성해주세요</span>
                </div>
            </div>
            <div className="progress my-4">
                <div className="progress-bar " role="progressbar" style={{ width: `${percent}%` }}>
                </div>
            </div>
            <div className="container border rounded p-4">
                <div className="row">
                    <div className="col">
                        <CurrentPage data={restaurantInfo} setData={setRestaurantInfo} onPrev={prevStep} onNext={nextStep} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default RestaurantAddByStep;
