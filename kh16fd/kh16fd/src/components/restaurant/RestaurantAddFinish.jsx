import { Link } from "react-router-dom"
import Jumbotron from "../templates/Jumbotron"

export default function RestaurantAddFinish(){
    
    return (
        <>
        <Jumbotron subject="식당 등록 완료!" detail="관리자 최종 검토 후 승인됩니다"/>
        <div className="row mt-4">
            <div className="col">
                <div className="d-flex flex-column align-items-center">
                <img src="https://i.gifer.com/7efs.gif" />
                <Link to="/" className="btn btn-primary">메인 페이지로</Link>
                </div>
            </div>
        </div>
        </>
    )
}