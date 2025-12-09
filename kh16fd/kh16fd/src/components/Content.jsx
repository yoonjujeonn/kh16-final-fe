import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import AdminSetting from "./admin/AdminSetting";
import RestaurantAdd from "./restaurant/RestaurantAdd";
import RestaurantInfo from "./restaurant/RestaurantInfo";
import ReservationInfo from "./restaurant/ReservationInfo";
import ReservationMoreInfo from "./restaurant/ReservationMoreInfo";
import CategoryAdd from "./category/CategoryAdd";
import MemberLogin from "./member/MemberLogin";
import RestaurantAddFinish from "./restaurant/RestaurantAddFinish";


export default function Content () {

    return (
        <>
            <div className="row">
                <div className="col-md-10 offset-md-1 col-sm-12">

                    {/* path=주소, element=화면 */}
                    <Routes>

                        {/* 메인 페이지 */}

                        <Route path="/" element={<Home />}></Route>

                        {/* 회원 관련 메뉴 */}
                        <Route path="/member/login" element={<MemberLogin />}></Route>
                        
                        {/* 식당 관련 메뉴 */}
                        <Route path="/restaurant/add" element={<RestaurantAdd/>}>
                            <Route index element={<RestaurantInfo />}></Route>
                            <Route path="/restaurant/add/info" element={<ReservationInfo />}></Route>
                            <Route path="/restaurant/add/info/:restaurantId" element={<ReservationMoreInfo />}></Route>
                        </Route>
                         <Route path="/restaurant/add/finish" element={<RestaurantAddFinish />}></Route>

                        {/* 관리 메뉴 - 추후 guard 추가 */}
                        <Route path="/admin/setting" element={<AdminSetting />}>
                        
                        </Route>


                        {/* 카테고리 등록 페이지 */}
                        <Route path="/category/add" element={<CategoryAdd />} />

                    </Routes>

                </div>
            </div>
        </>
    )
}
