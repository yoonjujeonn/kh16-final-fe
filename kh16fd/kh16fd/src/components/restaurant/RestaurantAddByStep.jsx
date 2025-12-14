import Jumbotron from "../templates/Jumbotron";
import RestaurantBasicInfo from "./RestaurantBasicInfo";
import RestaurantScheduleInfo from "./RestaurantScheduleInfo";
import { useCallback, useEffect, useState } from "react";
import RestaurantMoreInfo from "./RestaurantMoreInfo";

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
        seatList : []
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
            <Jumbotron subject="식당 신규 등록" detail="식당 등록을 위한 정보를 입력해주세요" />
            <div className="progress mt-4">
                <div className="progress-bar " role="progressbar" style={{ width: `${percent}%` }}>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <CurrentPage data={restaurantInfo} setData={setRestaurantInfo} onPrev={prevStep} onNext={nextStep} />
                </div>
            </div>
        </>
    );
};

export default RestaurantAddByStep;
