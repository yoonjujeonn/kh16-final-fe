import Jumbotron from "../templates/Jumbotron";

export default function ReservationAdd(){

    return(
        <>
        <Jumbotron subject="식당 이름" detail="예약 상세 페이지" />
        <div className="time-wraaper">
            <h1>타이머</h1>
        </div>
        <div className="row mt-4">
            <div className="col">
                <h1>예약 정보</h1>
                
            </div>
        </div>
        </>
    );
}