import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";


export default function NeedPermission() {

    return (<>
        <div className="title-wrapper p-4 mb-4 ms-3">
            <h1 className="text-danger">접근 금지</h1>
            <span>해당 기능을 이용하기 위해 필요한 권한이 부족합니다</span>
        </div>
        <div className="d-flex align-items-center justify-content-center p-4 mb-4">
            <div className="text-center row">
                <div className=" col-md-6">
                    <img src="https://i.gifer.com/DKke.gif" className="img-fluid" />
                </div>
                <div className=" col-md-6 mt-5">
                    <p className="fs-3"> <span className="text-danger me-2">ERROR!</span>403 FORBIDDEN</p>
                    <p className="lead">
                        권한이 필요한 페이지입니다
                    </p>
                    <Link to={"/"} className="btn btn-primary">홈으로</Link>
                </div>

            </div>
        </div>
    </>)
}