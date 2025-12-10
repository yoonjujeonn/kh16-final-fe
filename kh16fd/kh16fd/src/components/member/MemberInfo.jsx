import { useAtom } from "jotai";
import Jumbotron from "../templates/Jumbotron";
import { Link, Outlet } from "react-router-dom";
import { loginIdState } from "../../utils/jotai";


export default function MemberInfo() {

    //state
    const [loginId, setLoginId] = useAtom(loginIdState);


    return (<>
        <Jumbotron subject={`${loginId} 님의 정보`}/>
        
        <div className="row mt-4">
            <div className="col">
                <Link className="btn btn-secondary me-2" to="/member/info/change">내정보</Link>
                {/* 이거는 조건 따져서 가리면 됨 */}
                <Link className="btn btn-secondary me-2" to="/member/info/pay/:paymentNo">결제내역</Link>
            </div>
        </div>

        {/* 중첩 라우팅은 당분간 중지 */}
        {/* <div className="row mt-4">
            <div className="col">
                <Outlet/>
            </div>
        </div> */}

    </>)
}