import { useNavigate, useParams } from "react-router-dom";
import Jumbotron from "../../templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function RestaurantConfirmDetail() {

    const { restaurantId } = useParams();

    const [restaurant, setRestaurant] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await axios.get(`/admin/restaurant/${restaurantId}`);
                setRestaurant(response.data);
            }
            catch (err) {
                console.error("데이터 로딩 실패", err);
                toast.warn("데이터를 불러올 수 없습니다");
                navigate("/admin/restaurant");
            }
        };

        if (restaurantId) {
            loadData();
        }



    }, [restaurantId]);

    const approved = useCallback(async () => {
        try {
            const response = await axios.patch(`/admin/restaurant/${restaurantId}`);
        
            if(response.data) {
                toast.success("승인이 완료되었습니다!");
                navigate("/admin/restaurant"); // 승인 후 목록으로 이동
            }
        
        }
        catch (err) {
            console.error("데이터 로딩 실패", err);
            toast.warn("승인이 안됩니다");
        }
    }, [restaurantId, navigate]);


    if (!restaurantId) {
        return <div className="p-5 text-center">로딩 중입니다...</div>
    }

    return (<>
        <Jumbotron detail="승인할 레스토랑입니다" subject="읽어보고 승인 버튼을 눌러주세요" />
        <div className="row mt-4">
            <div className="col">
                <div className="card shadow p-4">
                    <h3>식당명: {restaurant?.restaurantName}</h3>
                    <p>설명: {restaurant?.restaurantDescription}</p>
                    <p>등록일: {restaurant?.restaurantCreatedAt}</p>
                    {/* 여기에 승인 버튼 등을 추가하세요 */}
                    <button className="btn btn-success" onClick={approved}>
                        승인하기
                    </button>
                </div>
            </div>
        </div>
    </>)
}