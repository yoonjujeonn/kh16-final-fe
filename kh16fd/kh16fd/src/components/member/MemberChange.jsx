import { useAtom } from "jotai";
import { loginIdState, loginLevelState } from "../../utils/jotai";
import Jumbotron from "../templates/Jumbotron";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function MemberChange() {
    
    //state
    const[loginId, setloginId] = useAtom(loginIdState);
    const[loginLevel, setLoginLevel] = useAtom(loginLevelState);
    
    const [member, setMember] = useState(null);


    return (<>
        <Jumbotron subject={`안녕하세요 ${loginLevel}님`} detail={`${loginId}님의 정보 수정을 진행해 주세요`}/>
        
        <div className="row mt-4">
            <div className="col">


            </div>
        </div>

    </>)
}