import { useAtom } from "jotai";
import { accessTokenState, loginIdState, loginLevelState } from "../../utils/jotai";
import Jumbotron from "../templates/Jumbotron";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaAsterisk, FaCheck, FaXmark } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

export default function MemberChange() {

    //state
    const [loginId, setloginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);

    //여기 수정해서 변경할 값들 다 정의해둘것 그러면 비어도 표시될듯?
    const [member, setMember] = useState(null);
    //얘도 마찬가지로
    const [backup, setBackup] = useState(null);

    const navigate = useNavigate();

    const [memberClass, setMemberClass] = useState({
        memberNickname: "",
        memberEmail: "", memberBirth: "", memberContact: "",
        memberPost: "", memberAddress1: "", memberAddress2: ""
    });

    const [editable, setEditable] = useState({
        memberNickname: false,
        memberEmail: false,
        memberBirth: false,
        memberContact: false,
        memberAddress: false
        // memberPost: false,
        // memberAddress1: false,
        // memberAddress2: false
    });


    //닉네임이 문제될 경우 출력하는 피드백
    const [memberNicknameFeedback, setMemberNicknameFeedback] = useState("");

    useEffect(() => {
        if (loginId?.length === 0) return;
        // 추후에 비회원이 멤버 페이지로 못들어오게 하려면 쓸것
        // if (loginId?.length === 0) navigate("/");

        axios({
            url: `/member/${loginId}`,
            method: "get"
        }).then(response => {
            setMember(response.data);
            setBackup(response.data);
            setloginId(loginId);
            // setToken()
        }).catch(err => {
            toast.error(`${loginId}회원은 존재하지 않습니다`);
            navigate("/");
        });
    }, [loginId]);


    //수정여부 표시용

    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setMember({ ...member, [name]: value });

        //이메일 입력 발생 시 관련 상태 초기화
        // if (name === "memberEmail") {
        //     //이메일 관련 상태 모두 초기화
        //     resetMemberEmail();
        // }
    }, [member]);

    const changeMemberNicknameEditable = useCallback(isEdit => {
        setEditable(prev => ({
            ...prev,
            memberNickname: isEdit
        }));
    }, [])

    const cancelMemberNickname = useCallback(() => {
        setMember({
            ...member,
            memberNickname: backup?.memberNickname
        });
        changeMemberNicknameEditable(false);
    }, [member, backup]);


    const saveMemberNickname = useCallback(async (e) => {
        e.preventDefault(); // 필수

        console.log("로그인 아이디는 " + loginId);
        console.log("토큰 값 확인: ", accessToken);

        // checkMemberNickname();
        console.log("axios.patch 실행 직전");
        setBackup({
            ...backup,
            memberNickname: member.memberNickname
        });
        try {

            console.log("테스트 PATCH 요청 시도");
            console.log(`/member/${loginId}`);
            const { member } = await axios.patch(`/member/${loginId}`, {
                memberNickname: member.memberNickname},
                { 
                headers: {
                    Authorization: accessToken 
                } 
            }
            
            );
            toast.success("변경사항이 적용되었습니다");
        }
        catch (err) {
            toast.error("변경과정에서 오류가 발생");
            setMember({
                ...member,
                memberNikcname: backup.memberNickname
            });
            changeMemberNicknameEditable(false);
        }


        changeMemberNicknameEditable(false);
    }, [member, backup, loginId, accessToken]);



    const checkMemberNickname = useCallback(async (e) => {
        //닉네임검사
        const regex = /^[가-힣0-9]{2,10}$/
        const valid = regex.test(member.memberNickname);
        if (valid === true) { //형식 통과
            //중복 검사
            //axios 사용예정 async await 씀
            //맨날 보는 구조분해할당(원하는것만 뽑아쓴다)
            const { data } = await axios.get(`/member/memberNickname/${member.memberNickname}`);
            if (data === true) { //사용 가능
                setMemberClass(prev => ({ ...prev, memberNickname: "is-valid" }));
            }
            else { //사용 불가(사용 중)
                setMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" }));
                setMemberNicknameFeedback("이미 사용중인 닉네임입니다");
            }
        }
        else { //형식 오류
            setMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" }));
            setMemberNicknameFeedback("닉네임은 한글과 숫자를 사용해 2~10자 내로 적어주세요");
        }

    }, [member, memberClass]);


    return (<>
        <Jumbotron subject={`안녕하세요 ${loginLevel}님`} detail={`${loginId}님의 정보 수정을 진행해 주세요`} />

        {/* 닉네임 */}
        {/* <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                닉네임 <FaAsterisk className="text-danger" />
            </label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberNickname}`}
                    name="memberNickname" value={member?.memberNickname} onChange={changeStrValue}
                    onBlur={checkMemberNickname} />
                <div className="valid-feedback">멋진 닉네임이네요!</div>
                <div className="invalid-feedback">{memberNicknameFeedback}</div>
            </div>
        </div> */}

        {/* <div className="row mt-4 fs-2">
            <div className="col-sm-3 text-primary">닉네임</div>
            <div className="col-sm-9">{member?.memberNickname}</div>
        </div> */}
        <div className="row mt-4 fs-2">
            <div className="col-sm-3 text-primary">닉네임</div>
            <div className="col-sm-9">
                {editable.memberNickname ? (<>
                    <div className="d-flex flex-row">
                        <div>
                            {/* 수정화면 */}
                            <input type="text" name="memberNickname" className={`form-control ${memberClass.memberNickname}`}
                                value={member.memberNickname} onChange={changeStrValue} />
                            {/* onBlur={checkMemberNickname} */}
                            <div className="valid-feedback fs-6">멋진 닉네임이네요!</div>
                            <div className="invalid-feedback fs-6">{memberNicknameFeedback}</div>
                        </div>
                        <div className="">
                            {/* 취소 버튼 */}
                            <FaXmark className="ms-4" onClick={cancelMemberNickname} />
                            {/* 수정 버튼 */}
                            <FaCheck className="ms-2" onClick={saveMemberNickname} />
                        </div>
                    </div>

                </>) : (<>
                    {/* 일반화면 */}
                    {member?.memberNickname}
                    <FaEdit className="ms-4" onClick={e => {
                        //setEditable({...editable, pokemonName: true});
                        changeMemberNicknameEditable(true);
                    }} />

                </>)}
            </div>
        </div>


    </>)
}