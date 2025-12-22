import { Link } from "react-router-dom";

export default function ReservationConflict(){
    return (<>
            <div className="title-wrapper p-4 mb-4 ms-3">
                <h1 className="text-danger">중복 예약</h1>
                <span>해당 좌석에 이미 예약 정보가 있습니다</span>
            </div>
            <div className="d-flex align-items-center justify-content-center p-4 mb-4">
                <div className="text-center row">
                    <div className=" col-md-6">
                        <img src="https://i.gifer.com/DKke.gif" className="img-fluid" />
                    </div>
                    <div className=" col-md-6 mt-5">
                        <p className="fs-3"> <span className="text-danger me-2">ERROR!</span>409 CONFLICT</p>
                        <p className="lead">
                            이미 예약된 좌석입니다
                        </p>
                        <Link to={"/"} className="btn btn-primary">홈으로</Link>
                    </div>
    
                </div>
            </div>
        </>)
}