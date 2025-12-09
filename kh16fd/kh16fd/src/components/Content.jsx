import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import AdminSetting from "./admin/AdminSetting";
import RestaurantAdd from "./restaurant/RestaurantAdd";
import RestaurantInfo from "./restaurant/RestaurantInfo";
import ReservationInfo from "./restaurant/ReservationInfo";
import ReservationMoreInfo from "./restaurant/ReservationMoreInfo";
import CategoryAdd from "./category/CategoryAdd";
import CategoryList from "./category/CategoryList";
import MemberLogin from "./member/MemberLogin";
import MemberJoin from "./member/MemberJoin";

export default function Content() {

    return (
        <>
            <div className="row">
                <div className="col-md-10 offset-md-1 col-sm-12">

                    <Routes>

                        {/* 메인 페이지 */}
                        <Route path="/" element={<Home />} />

                        {/* 회원 관련 메뉴 */}
                        <Route path="/member/login" element={<MemberLogin />} />
                        <Route path="/member/join" element={<MemberJoin />} />

                        {/* 식당 관련 메뉴 */}
                        <Route path="/restaurant/add" element={<RestaurantAdd />}>
                            <Route index element={<RestaurantInfo />} />
                            <Route path="info" element={<ReservationInfo />} />
                            <Route path="info/:restaurantId" element={<ReservationMoreInfo />} />
                        </Route>

                        {/* 관리 메뉴 */}
                        <Route path="/admin/setting" element={<AdminSetting />} />

                        {/* 카테고리 관련 페이지 */}
                        <Route path="/category/add" element={<CategoryAdd />} />
                        <Route path="/category/list" element={<CategoryList />} />

                    </Routes>

                </div>
            </div>
        </>
    );
}
