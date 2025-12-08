import { Outlet } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron"
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { loginIdState, restaurantInfoState } from "../../utils/jotai";

export default function RestaurantAdd() {
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [basicInfo, setBasicInfo] = useAtom(restaurantInfoState);
    
    useEffect(() => {
        setBasicInfo({
        ownerId: loginId,
        restaurantName: "",
        restaurantContact: "",
        restaurantAddress: "",
        address1 : "",
        address2 : "",
        restaurantAddressX: "",
        restaurantAddressY: "",
        restaurantOpen: "",
        restaurantClose: "",
        restaurantBreakStart: "",
        restaurantBreakEnd: "",
        reservationInterval: "",
        restaurantOpeningDays: "",
        restaurantLastOrder: "",
        restaurantReservationPrice: "",
        restaurantDescription: ""
        });
    }, []);

    return (
        <>
            <Jumbotron subject="식당 신규 등록" detail="식당 등록을 위한 정보를 입력해주세요" />
            <div className="row mt-4">
                <div className="col">
                    <Outlet />
                </div>
            </div>
        </>
    )
}