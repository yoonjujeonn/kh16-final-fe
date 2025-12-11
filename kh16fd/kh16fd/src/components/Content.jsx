import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import AdminSetting from "./admin/AdminSetting";
import RestaurantAdd from "./restaurant/RestaurantAdd";
import RestaurantInfo from "./restaurant/RestaurantInfo";
import ReservationInfo from "./restaurant/ReservationInfo";
import ReservationMoreInfo from "./restaurant/ReservationMoreInfo";
import CategoryList from "./category/CategoryList";
import MemberLogin from "./member/MemberLogin";
import RestaurantAddFinish from "./restaurant/RestaurantAddFinish";
import MemberJoin from "./member/MemberJoin";
import CategoryAdd from "./category/categoryAdd";
import BannerAdd from "./banner/bannerAdd";
import ReviewList from "./review/ReviewList";
import ReservationAdd from "./reservation/ReservationAdd";
import RestaurantDetail from "./restaurant/RestaurantDetail";
import RestaurantList from "./restaurant/RestaurantList";
import ReviewWrite from "./review/ReviewWrite";
import ReviewEdit from "./review/ReviewEdit";
import MemberJoinFinish from "./member/MemberJoinFinish";
import BizMemberJoin from "./member/BizMemberJoin";
import BizMemberJoinFinish from "./member/BizMemberJoinFinish";
import MemberInfo from "./member/Memberinfo";
import MemberChange from "./member/MemberChange";
import BannerList from "./banner/bannerList";

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
                        <Route path="/member/joinFinish" element={<MemberJoinFinish />} />
                        <Route path="/member/bizJoin" element={<BizMemberJoin />} />
                        <Route path="/member/bizJoinFinish" element={<BizMemberJoinFinish />} />
                        
                        {/*일반회원 페이지 가드 예정 */}
                        {/* 회원 결제가 이루어지면 여기다가 주소를 넣으면 될거같아요 */}
                        <Route path="/member/info/" element={<MemberInfo />} />
                        <Route path="/member/info/Change" element={<MemberChange />} />

                        {/* 식당 등록 페이지 */}
                        <Route path="/restaurant/add" element={<RestaurantAdd />}>
                            <Route index element={<RestaurantInfo />} />
                            <Route path="info" element={<ReservationInfo />} />
                            <Route path="info/:restaurantId" element={<ReservationMoreInfo />} />
                        </Route>
                         <Route path="/restaurant/add/finish" element={<RestaurantAddFinish />}></Route>
                        
                        {/* 식당 페이지 */}
                         <Route path="/restaurant/list" element={<RestaurantList />}></Route>
                         <Route path="/restaurant/detail/:restaurantId" element={<RestaurantDetail />}></Route>
                        
                        {/* 예약 페이지 */}
                        <Route path="/reservation/add" element={<ReservationAdd />} />
                        
                        {/* 관리자 메뉴 */}
                        <Route path="/admin/setting" element={<AdminSetting />} />

                        {/* 카테고리 페이지 */}
                        <Route path="/category/add" element={<CategoryAdd />} />
                        <Route path="/category/list" element={<CategoryList />} />


                        {/* 배너 페이지 */}
                        <Route path="/banner/add" element={<BannerAdd />} />
                        <Route path="/banner/list" element={<BannerList />} />

                        {/* 리뷰 관련 */}
                        <Route path="/restaurant/:restaurantId/review" element={<ReviewList />} />
                        <Route path="/restaurant/:restaurantId/review/write" element={<ReviewWrite />} />
                        <Route path="/restaurant/:restaurantId/review/edit/:reviewNo" element={<ReviewEdit />} />

                    </Routes>

                </div>
            </div>
        </>
    );
}
