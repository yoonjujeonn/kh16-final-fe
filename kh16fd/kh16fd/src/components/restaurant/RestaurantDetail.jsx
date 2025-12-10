import { useState } from "react"

export default function RestaurantDetail () {
    const [restaurant, setRestaurant] = useState(null);



    return (
        <>
        <h1>식당 정보</h1>

        <div className="row mt-4 shadow p-4">
            <div className="col">
                <h1>예약</h1>
                <div className="my-4 info border p-3 w-50 rounded text-center" style={{cursor : "pointer"}}>
                    <span>날짜 시간 인원</span>
                </div>
                <span className="badge bg-info border p-3 rounded text-center" style={{cursor : "pointer"}}>오후 1: 30</span>
                <span className="badge ms-3 bg-info border p-3 rounded text-center" style={{cursor : "pointer"}}>오후 2: 30</span>
                 <span className="ms-3">...</span>
                <div className="btn-wrapper mt-4 d-flex justify-content-center">
                    <button className="btn btn-light">예약 가능 날짜 찾기</button>
                </div>
            </div>
        </div>

        <div className="row mt-4 shadow p-4">
            <div className="col">
                <h3>식당 정보 ...</h3>
            </div>
        </div>

        <div className="btn-wrapper mt-4">
            <button className="btn btn-primary w-100">예약하기</button>
        </div>
        </>
    )
}