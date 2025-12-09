import { useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode"

import { useNavigate } from "react-router-dom"
import Jumbotron from "../templates/Jumbotron";

export default function MemberJoin() {
    // const
    const navigate = useNavigate();

    const [member, setMember] = useState ({
        memberId: "", memberPw: "", memberNickname: "",
        memberEmail: "", memberBirth: "", memberContact: "",
        memberPost: "", memberAddress: "", memberAddress2: "",
        memberPw2: ""
    });

        const [memberClass, setmemberClass] = useState({
        memberId: "", memberPw: "", memberNickname: "",
        memberEmail: "", memberBirth: "", memberContact: "",
        memberPost: "", memberAddress1: "", memberAddress2: "",
        memberPw2: ""
    });

    //아이디가 문제될 경우 출력할 피드백
    const [memberIdFeedback, setMemberIdFeedback] = useState("");
    //닉네임이 문제될 경우 출력하는 피드백
    const [memberNicknameFeedback, setMemberNicknameFeedback] = useState("");
    //비밀번호 확인이 문제될 경우 출력하는 피드백
    const [memberPw2Feedback, setMemberPw2Feedback] = useState("");


    return(<>
        <Jumbotron subject="회원 가입" detail="별 표시는 모두 작성해 주세요"></Jumbotron>
    
    </>)
}
