import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";


export default function MemberJoinFinish() {

    return(<>
        <div className="title-wrapper my-4 text-center">
            <h1>회원 가입이 완료되었습니다</h1>
            <span><Link to="/member/login">로그인</Link> 하고 나만의 맛집을 찾아볼까요?</span>
        </div>
        <hr/>
        <div className="row mt-4 ">
            <Link to="/member/login" className="text-decoration-none">
            <div className="col d-flex flex-column justify-content-center">
                <img src="https://i.gifer.com/7efs.gif" alt="완료" />
            </div>
            </Link>
        </div>

    </>)

}