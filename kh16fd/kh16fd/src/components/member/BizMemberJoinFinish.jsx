import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";


export default function BizMemberJoinFinish() {

    return(<>
        <Jumbotron subject="회원가입 완료" detail="회원 가입이 정상적으로 완료되었습니다"></Jumbotron>
        
        <div className="row mt-4 ">
            <div className="col fs-2">
                <Link to="/member/login">여기</Link>를 눌러 로그인 페이지로 이동하세요
            </div>
        </div>

    </>)

}