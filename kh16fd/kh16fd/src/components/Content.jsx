import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import AdminSetting from "./admin/AdminSetting";
import RestaurantAdd from "./restaurant/RestaurantAdd";
import RestaurantInfo from "./restaurant/RestaurantInfo";
import ReservationInfo from "./restaurant/ReservationInfo";
import ReservationMoreInfo from "./restaurant/ReservationMoreInfo";
import CategoryAdd from "./category/CategoryAdd";
import CategoryList from "./category/CategoryList";;   


export default function Content() {

    return (
        <>
            <div className="row">
                <div className="col-md-10 offset-md-1 col-sm-12">

                    <Routes>

                        {/* 메인 페이지 */}
                        <Route path="/" element={<Home />} />

                        {/* 식당 관련 메뉴 */}
                        <Route path="/restaurant/add" element={<RestaurantAdd />}>
                            <Route index element={<RestaurantInfo />} />
                            <Route path="/restaurant/add/info" element={<ReservationInfo />} />
                            <Route path="/restaurant/add/info/1" element={<ReservationMoreInfo />} />
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
