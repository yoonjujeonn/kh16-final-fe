import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import AdminSetting from "./admin/AdminSetting";
import RestaurantAdd from "./restaurant/RestaurantAdd";
import RestaurantInfo from "./restaurant/RestaurantInfo";
import ReservationInfo from "./restaurant/ReservationInfo";
import ReservationMoreInfo from "./restaurant/ReservationMoreInfo";

export default function Content () {

    return (
    <>
      {/* 전체 화면의 폭을 통제하기 위한 추가 코드*/}
            <div className="row">
                <div className="col-md-10 offset-md-1 col-sm-12">

                    {/* 분할된 화면의 주소를 지정하는 영역 (path=주소, element=화면) */}
                    <Routes>
                        <Route path="/" element={<Home />}></Route>
                        {/* 식당 관련 메뉴 */}
                        <Route path="/restaurant/add" element={<RestaurantAdd/>}>
                            <Route index element={<RestaurantInfo />}></Route>
                            <Route path="/restaurant/add/info" element={<ReservationInfo />}></Route>
                            <Route path="/restaurant/add/info/1" element={<ReservationMoreInfo />}></Route>
                        </Route>
                        {/* 관리 메뉴 - 추후 guard 추가 */}
                        <Route path="/admin/setting" element={<AdminSetting />}>
                        
                        </Route>
                    </Routes>

                </div>
                </div>

    </>
)
}