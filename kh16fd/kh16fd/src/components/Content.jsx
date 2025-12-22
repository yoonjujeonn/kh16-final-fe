import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import AdminSetting from "./admin/AdminSetting";
import CategoryList from "./admin/category/CategoryList";
import MemberLogin from "./member/MemberLogin";
import RestaurantAddFinish from "./restaurant/RestaurantAddFinish";
import MemberJoin from "./member/MemberJoin";
import CategoryAdd from "./admin/category/categoryAdd";
import BannerAdd from "./admin/banner/BannerAdd";
import ReviewList from "./review/ReviewList";
import ReservationAdd from "./reservation/ReservationAdd";
import RestaurantDetail from "./restaurant/RestaurantDetail";
import RestaurantList from "./restaurant/RestaurantList";
import ReviewWrite from "./review/ReviewWrite";
import ReviewEdit from "./review/ReviewEdit";
import MemberJoinFinish from "./member/MemberJoinFinish";
import BizMemberJoin from "./member/BizMemberJoin";
import BizMemberJoinFinish from "./member/BizMemberJoinFinish";
import MemberInfo from "./member/MemberInfo";
import MemberChange from "./member/MemberChange";
import BannerList from "./admin/banner/bannerList";
import Admin from "./guard/Admin";
import NeedPermission from "./error/NeedPermission";
import TargetNoutfound from "./error/TargetNotfound";
import MyReviewList from "./review/MyReviewList";

import RestaurantAddByStep from "./restaurant/RestaurantAddByStep";
// import RestaurantEdit from "./restaurant/RestaurantEdit";
import RestaurantSearch from "./restaurant/RestaurantSearch";
import CategoryImageAdd from "./admin/category/CategoryImageAdd";
import CategoryImageList from "./admin/category/CategoryImageList";
import ReservationDetail from "./reservation/ReservationDetail";
import MyWishList from "./wishlist/MyWishList";
import ReviewManager from "./admin/ReviewManager";
import MyReservationList from "./reservation/MyReservationList";
import PlaceImageAdd from "./admin/place/PlaceImageAdd";
import PlaceImageList from "./admin/place/PlaceImageList";
import RestaurantConfirm from "./admin/restaurant/RestaurantConfirm"
import RestaurantMenu from "./restaurant/RestaurantMenu";
import MyRestaurantDetail from "./owner/MyRestaurantDetail";
import MyRestaurantList from "./owner/MyRestaurantList";
import MyRestaurantManage from "./owner/MyRestaurantManage";
import RestaurantConfirmDetail from "./admin/restaurant/RestaurantConfirmDetail";
import Owner from "./guard/Owner";
import OwnerReservationList from "./owner/OwnerReservationList";
import AdminMemberInfo from "./admin/member/AdminMemberInfo";
import ReservationConflict from "./error/ReservationConflict";
// import AdminPartnerInfo from "./admin/member/AdminPartnerInfo";


export default function Content() {

    return ( 
        <>
            <div className="row">
                <div className="col-md-10 offset-md-1 col-sm-12">

                    <Routes>

                        {/* 메인 */}
                        <Route path="/" element={<Home />} />

                        {/* 회원 */}
                        <Route path="/member/login" element={<MemberLogin />} />
                        <Route path="/member/join" element={<MemberJoin />} />
                        <Route path="/member/joinFinish" element={<MemberJoinFinish />} />
                        <Route path="/member/bizJoin" element={<BizMemberJoin />} />
                        <Route path="/member/bizJoinFinish" element={<BizMemberJoinFinish />} />
                        <Route path="/member/info" element={<MemberInfo />} />
                        <Route path="/member/info/change" element={<MemberChange />} />
                        <Route path="/member/info/review" element={<MyReviewList />} />
                        <Route path="/member/info/wishlist" element={<MyWishList />} />
                        <Route path="/member/info/reservation" element={<MyReservationList />} />

                        {/* 식당 등록 */}
                        <Route path="/restaurant/add" element={<Owner><RestaurantAddByStep /></Owner>}></Route>
                        <Route path="/restaurant/add/finish/:restaurantId" element={<Owner><RestaurantAddFinish /></Owner>} />

                        {/* 사장님 */}
                        <Route path="/owner/my-restaurant" element={<Owner><MyRestaurantList /></Owner>} />
                        <Route path="/owner/my-restaurant/:restaurantId" element={<Owner><MyRestaurantDetail /></Owner>} />
                        <Route path="/owner/my-restaurant/:restaurantId/manage" element={<Owner><MyRestaurantManage /></Owner>} />

                        {/* 식당 페이지 */}
                        {/* <Route path="/restaurant/edit/:restaurantId" element={<Owner><RestaurantEdit /></Owner>}></Route> */}
                        <Route path="/restaurant/list" element={<RestaurantList />} />
                        <Route path="/restaurant/detail/:restaurantId" element={<RestaurantDetail />}>
                            <Route path="review" element={<ReviewList />} />
                            <Route path="review/write" element={<ReviewWrite />} />
                            <Route path="review/edit/:reviewNo" element={<ReviewEdit />} />
                            {/* 메뉴 */}
                            <Route path="menu" element={<RestaurantMenu />} />
                        </Route>

                        {/* 검색 */}
                        <Route path="/restaurant/search" element={<RestaurantSearch />} />

                        {/* 예약 */}
                        <Route path="/reservation/add" element={<ReservationAdd />} />
                        <Route path="/reservation/add/success" element={<ReservationDetail />} />

                        {/* 관리자 */}
                        <Route path="/admin/setting" element={<Admin><AdminSetting /></Admin>} />
                        <Route path="/admin/review/list" element={<Admin><ReviewManager /></Admin>} />
                        <Route path="/admin/restaurant" element={<Admin><RestaurantConfirm/></Admin>} />
                        <Route path="/admin/restaurant/:restaurantId" element={<Admin><RestaurantConfirmDetail/></Admin>} />
                        <Route path="/admin/setting/member/:memberId" element={<Admin><AdminMemberInfo /></Admin>} />
                        {/* <Route path="/admin/setting/partner/:partnerId" element={<Admin><AdminPartnerInfo /></Admin>} /> */}

                        {/* 자영업자 */}
                        <Route path="/owner/dashboard" element={<OwnerReservationList/>}/>
                        
                        {/* 카테고리 */}
                        <Route path="/category/add" element={<Admin><CategoryAdd /></Admin>} />
                        <Route path="/category/list" element={<Admin><CategoryList /></Admin>} />
                        <Route path="/category/image/add" element={<Admin><CategoryImageAdd /></Admin>} />
                        <Route path="/category/image/list" element={<Admin><CategoryImageList /></Admin>} />
                        {/* 지역 */}
                        <Route path="/place/image/add" element={<Admin><PlaceImageAdd /></Admin>} />
                        <Route path="/place/image/list" element={<Admin><PlaceImageList /></Admin>} />
                        {/* 배너 */}
                        <Route path="/banner/add" element={<Admin><BannerAdd /></Admin>} />
                        <Route path="/banner/list" element={<Admin><BannerList /></Admin>} />


                        {/* 에러 페이지들 */}
                        <Route path="/error/403" element={<NeedPermission />}></Route>
                        <Route path="/error/409" element={<ReservationConflict />}></Route>
                        {/* 페이지를 못찾은 경우 보여줄 에러페이지는 맨 마지막에 와일드카드를 사용 */}
                        <Route path="*" element={<TargetNoutfound />}></Route>

                        {/* 리뷰 */}
                        <Route path="/restaurant/:restaurantId/review" element={<ReviewList />} />
                        <Route path="/restaurant/:restaurantId/review/write" element={<ReviewWrite />} />
                        <Route path="/restaurant/:restaurantId/review/edit/:reviewNo" element={<ReviewEdit />} />

                    </Routes>

                </div>
            </div>
        </>
    );
}
