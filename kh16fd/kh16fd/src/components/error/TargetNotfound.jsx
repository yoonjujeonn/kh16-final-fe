import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";


export default function TargetNoutfound() {

    return (<>
        <div className="title-wrapper p-4 mb-4 ms-3">
            <h1 className="text-danger">페이지가 존재하지 않습니다</h1>
            <span>주소가 맞는지 확인 후 다시 이용해주세요</span>
        </div>
        <div className="d-flex align-items-center justify-content-center mb-4">
            <div className="text-center row">
                <div className=" col-md-6">
                    <img src="https://i.gifer.com/DKke.gif" className="img-fluid" />
                </div>
                <div className=" col-md-6 mt-5">
                    <p className="fs-3"> <span className="text-danger me-2">ERROR!</span>404 NOT FOUND</p>
                    <p className="lead">
                        존재하지 않는 페이지입니다
                    </p>
                    <Link to={"/"} className="btn btn-primary">홈으로</Link>
                </div>

            </div>
        </div>
    </>)
}