import { useCallback, useMemo, useRef, useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode"

import { useNavigate } from "react-router-dom"
import Jumbotron from "../templates/Jumbotron";
import { FaAsterisk, FaEye, FaEyeSlash, FaKey, FaMagnifyingGlass, FaPaperPlane, FaSpinner, FaUser, FaXmark } from "react-icons/fa6";
import Swal from "sweetalert2";
// import { format, subDays, addDays, subWeeks, addWeeks } from "date-fns";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.min.css";
//언어를 한국어로 변경
import { registerLocale } from "react-datepicker";
import { ko } from 'date-fns/locale/ko';
import axios from "axios";
registerLocale('ko', ko)

export default function MemberJoin() {
    // const
    const navigate = useNavigate();

    const [member, setMember] = useState({
        memberId: "", memberPw: "", memberNickname: "",
        memberEmail: "", memberBirth: "", memberContact: "",
        memberPost: "", memberAddress1: "", memberAddress2: "",
        memberPw2: ""
    });

    const [memberClass, setMemberClass] = useState({
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


    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setMember({ ...member, [name]: value });

        //이메일 입력 발생 시 관련 상태 초기화
        if (name === "memberEmail") {
            //이메일 관련 상태 모두 초기화
            resetMemberEmail();
        }

        //밑에 member 안 써도 prev같은거로 사용은 가능하다
    }, [member]);

    const changeDateValue = useCallback((date) => {
        const replacement = format(date, "yyyy-MM-dd");//date-fns에서 제공하는 변환 명령
        setMember(prev => ({ ...prev, memberBirth: replacement }));
        if(date === null) {
            setMemberClass(prev => ({...prev, memberBirth : "is-invalid"}))
        }
        else if(date !== null) {
            setMemberClass (prev => ({...prev, memberBirth : "is-valid"}))
        }
    }, [member, memberClass]);

    const checkMemberId = useCallback(async (e) => {
        //형식검사 -> 아이디 중복검사 -> 결과 설정
        //연관에서 불러올건 진짜 써야되는것만 그냥 변경하는걸로는 안가져와도 됨
        const regex = /^[a-z][a-z0-9]{4,19}$/
        const valid = regex.test(member.memberId);
        if (valid) { //형식 통과
            //중복 검사
            //axios 사용예정 async await 쓸거임 ㅅㄱ
            //const response = await axios.get(`/acount/acountId/${member.memberId}`);
            //맨날 보는 구조분해할당(원하는것만 뽑아쓴다)
            const { data } = await axios.get(`/member/memberId/${member.memberId}`);
            if (data === true) { //사용 가능
                setMemberClass(prev => ({ ...prev, memberId: "is-valid" }));
            }
            else { //사용 불가(사용 중)
                setMemberClass(prev => ({ ...prev, memberId: "is-invalid" }));
                setMemberIdFeedback("이미 사용중인 아이디입니다");
            }
        }
        else { //형식 오류
            setMemberClass(prev => ({ ...prev, memberId: "is-invalid" }));
            setMemberIdFeedback("아이디는 영문 소문자로 시작하며 숫자를 포함한 5~20자로 작성하세요");
        }

    }, [member, memberClass]);

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


    const checkMemberPw = useCallback((e) => {
        const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\!\@\#\$])[A-Za-z0-9\!\@\#\$]{8,16}$/;
        const valid = regex.test(member.memberPw);
        // if(valid === true) { //형식 일치
        //     setmemberClass(prev=> ({...prev, memberPw : "is-valid"}));
        // }
        // else { //불일치
        //     setmemberClass(prev=> ({...prev, memberPw : "is-invalid"}));
        // }
        setMemberClass(prev => ({ ...prev, memberPw: valid ? "is-valid" : "is-invalid" }));

        if (member.memberPw2.length === 0) {
            setMemberClass(prev => ({ ...prev, memberPw2: "is-invalid" }));
            setMemberPw2Feedback("비밀번호를 먼저 작성하세요");
        }
        else {
            const valid2 = member.memberPw === member.memberPw2;
            setMemberClass(prev => ({ ...prev, memberPw2: valid2 ? "is-valid" : "is-invalid" }));
            setMemberPw2Feedback("비밀번호가 일치하지 않습니다");
        }

    }, [member, memberClass]);

    //비밀번호 표시용 state
    const [showPassword, setShowPassword] = useState(false);

    //이메일
    //state를 한개 더 해도 됨
    const [sending, setSending] = useState(null);

    const sendCertEmail = useCallback(async () => {
        // if (member.memberEmail.length === 0) return;

        const regex = /^[A-Za-z0-9]+@[A-Za-z0-9.]+$/;
        const valid = regex.test(member.memberEmail);
        if (valid === false) {
            Swal.fire({
                title: "이메일 인증 오류",
                text: "입력한 이메일 형식이 부적합합니다",
                icon: "error",
                confirmButtonColor: "#0984e3",
                confirmButtonText: "확인",
                allowOutsideClick: false, //외부 클릭 금지
            });
            return;
        }

        setSending(true);
        //1. 서버에 이메일 전송을 요청 ajax axios
        const response = await axios.post("/cert/send", { certEmail: member.memberEmail });
        //2. 이메일이 성공적으로 전송되면 인증번호 입력창을 표시하도록 상태를 변경
        // if(response === true)
        setSending(false);

    }, [member])

    //인증번호
    const [certNumber, setCertNumber] = useState("");
    const [certNumberClass, setCertNumberClass] = useState("");
    const [certNumberFeedback, setCertNumberFeedback] = useState("");

    const changeCertNumber = useCallback(e => {
        const replacement = e.target.value.replace(/[^0-9]+/g, ""); //숫자가 아닌 항목 제거
        setCertNumber(e.target.value); //설정
    }, []);

    const [memberEmailFeedback, setMemberEmailFeedback] = useState("");

    const sendCertCheck = useCallback(async (e) => {
        resetMemberEmail();

        try {
            const { data } = await axios.post("/cert/check", {
                certEmail: member.memberEmail, certNumber: certNumber
            });
            if (data.result === true) { //인증 성공시
                setCertNumberClass("is-valid");
                setSending(null);
                setMemberClass(prev => ({ ...prev, memberEmail: "is-valid" }));
            }
            else { //인증 실패시
                setCertNumberClass("is-invalid");
                setCertNumberFeedback(data.message);
            }

        }
        catch (err) {
            setCertNumberClass("is-invalid");
            setCertNumberFeedback("인증번호 형식이 부적합합니다");
        }

        // console.log(data);
    }, [member.memberEmail, certNumber]);

    const resetMemberEmail = useCallback(() => {
        setMemberClass(prev => ({ ...prev, memberEmail: "" }));
        setCertNumber(""); //입력값 초기화
        setCertNumberClass(""); //입력창 클래스 초기화
        setCertNumberFeedback(""); //인증번호 입력창 피드백 초기화
        // setMemberEmailFeedback("");
    }, []);

    const checkMemberEmail = useCallback(e => {
        const regex = /^[A-Za-z0-9]+@[A-Za-z0-9.]+$/;
        const valid = regex.test(member.memberEmail);
        if (valid === true) { //유효한 상황
            if (certNumberClass !== "is-valid") { //인증 안됬을 때
                setMemberClass(prev => ({ ...prev, memberEmail: "is-invalid" }));
                setMemberEmailFeedback("이메일 인증이 필요합니다");
            }
        }
        else { //유효하지 않음
            setMemberClass(prev => ({ ...prev, memberEmail: "is-invalid" }));
            setMemberEmailFeedback("부적합한 이메일 형식입니다");
        }
    }, [member, memberClass, certNumber, certNumberClass]);

    const checkMemberContact = useCallback(e => {
        const regex = /^010[1-9][0-9]{7}$/;
        const valid = member.memberContact.length === 0 || regex.test(member.memberContact);
        // setmemberClass({...memberClass, memberContact: valid ? "is-valid" : "is-invalid"});
        setMemberClass(prev => ({ ...prev, memberContact: valid ? "is-valid" : "is-invalid" }));
    }, [member, memberClass]);

    //주소
    //-react-daum-postcode에서 제공하는 커스텀 훅을 써야됨
    //-open을 써서 주소 검색창을 원할때 호출
    const open = useDaumPostcodePopup("//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js");
    const searchAddress = useCallback(() => {
        open({
            onComplete: (data) => {
                //기존의 JS에서 사용하던 코드와 동일하게 주소를 생성
                // console.log(data);
                var addr = ''; // 주소 변수

                if (data.userSelectedType === 'R') {
                    addr = data.roadAddress;
                } else {
                    addr = data.jibunAddress;
                }
                setMember(prev => ({
                    ...prev,
                    memberPost: data.zonecode, //우편번호
                    memberAddress1: addr, //기본주소
                    memberAddress2: "", //상세주소 변경
                }));
                //상세주소 입력창으로 포커스 이동
                //과거 document.querySelector("...").focus();
                //현재 memberAddress2Ref.current.focus();
                memberAddress2Ref.current.focus();
            }
        });
    }, [])

    //상세주소 입력창 제어용 ref 생성
    const memberAddress2Ref = useRef();

    //지우기 버튼에 대한 함수
    const clearMemberAddress = useCallback(() => {

        setMember(prev => ({
            ...prev,
            memberPost: "",
            memberAddress1: "",
            memberAddress2: ""
        }));
        setMemberClass(prev => ({
            ...prev,
            memberPost: "",
            memberAddress1: "",
            memberAddress2: ""
        }));
    }, []);

    const hasAnyChar = useMemo(() => {

        // const length = member.memberPost.length + 
        //             member.memberAddress1.length + 
        //             member.memberAddress2.length;
        // return length > 0;

        if (member.memberPost.length > 0) return true;
        if (member.memberAddress1.length > 0) return true;
        if (member.memberAddress2.length > 0) return true;
        return false;


    }, [member]);


    //주소 검사
    const checkMemberAddress = useCallback((e) => {
        const { memberPost, memberAddress1, memberAddress2 } = member;
        const fill = memberPost.length > 0 && memberAddress1.length > 0 && memberAddress2.length > 0;
        const empty = memberPost.length === 0 && memberAddress1.length === 0 && memberAddress2.length === 0;
        const valid = fill || empty;
        setMemberClass(prev => ({
            ...prev,//기존 검사결과는 유지하고
            memberPost: valid ? "is-valid" : "is-invalid",
            memberAddress1: valid ? "is-valid" : "is-invalid",
            memberAddress2: valid ? "is-valid" : "is-invalid"
        }));
        // if(member.memberAddress1.length > 0) return true;
        // if(member.memberAddress2.length > 0) return true;
        // return false;
    }, [member, memberClass]);

    //모든 필수 항목이 유효한지 검사 (선택 항목은 is-invalid만 아니면 됨)
    const memberValid = useMemo(() => {
        //필수 항목
        if (memberClass.memberId !== "is-valid") return false;
        if (memberClass.memberPw !== "is-valid") return false;
        if (memberClass.memberPw2 !== "is-valid") return false;
        if (memberClass.memberNickname !== "is-valid") return false;
        if (memberClass.memberEmail !== "is-valid") return false;
        if (certNumberClass !== "is-valid") return false;
        if (memberClass.memberBirth !== "is-valid") return false;
        //선택 항목 (미입력은 괜찮지만 잘못된 입력은 문제가 됨)
        if (memberClass.memberContact === "is-invalid") return false;
        if (memberClass.memberPost === "is-invalid") return false;
        if (memberClass.memberAddress1 === "is-invalid") return false;
        if (memberClass.memberAddress2 === "is-invalid") return false;
        //모두 통과하면 성공
        return true;
    }, [memberClass, certNumberClass]);

    //최종 가입하기
    const sendData = useCallback(async () => {
        if (memberValid === false) return;

        const response = await axios.post("/member/", member);
        // toast.success("회원 가입이 완료되었습니다");
        //다른 페이지로 이동(완료페이지 or 메인페이지 or 로그인페이지)
        navigate("/member/joinFinish");//완료 페이지
        // navigate("/");
    }, [member, memberValid]);


    return (<>
        <Jumbotron subject="회원 가입" detail="별 표시는 모두 작성해 주세요"></Jumbotron>

        {/* 아이디 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                아이디 <FaAsterisk className="text-danger" />
            </label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberId}`}
                    name="memberId" value={member.memberId} onChange={changeStrValue}
                    onBlur={checkMemberId}/>
                <div className="valid-feedback">사용 가능한 아이디입니다!</div>
                <div className="invalid-feedback">{memberIdFeedback}</div>
            </div>
        </div>


        {/* 비밀번호 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                비밀번호
                <FaAsterisk className="text-danger" />
                {showPassword === true ? (
                    <FaEye className="ms-2 text-primary"
                        onClick={e => setShowPassword(false)} />
                ) : (
                    <FaEyeSlash className="ms-2 text-primary"
                        onClick={e => setShowPassword(true)} />
                )}
            </label>
            <div className="col-sm-9">
                <input type={showPassword === true ? "text" : "password"} className={`form-control ${memberClass.memberPw}`}
                    name="memberPw" value={member.memberPw} onChange={changeStrValue}
                    onBlur={checkMemberPw} autoComplete="off"/>
                <div className="valid-feedback">사용 가능한 비밀번호 형식입니다!</div>
                <div className="invalid-feedback">대문자, 소문자, 숫자, 특수문자를 반드시 한개 포함해 8~16자로 작성하세요</div>
            </div>
        </div>

        {/* 비밀번호 확인 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                비밀번호 확인
                <FaAsterisk className="text-danger" />
                {showPassword === true ? (
                    <FaEye className="ms-2 text-primary"
                        onClick={e => setShowPassword(false)} />
                ) : (
                    <FaEyeSlash className="ms-2 text-primary"
                        onClick={e => setShowPassword(true)} />
                )}
            </label>
            <div className="col-sm-9">
                <input type={showPassword === true ? "text" : "password"} className={`form-control ${memberClass.memberPw2}`}
                    name="memberPw2" value={member.memberPw2} onChange={changeStrValue}
                    onBlur={checkMemberPw} />
                <div className="valid-feedback">비밀번호가 일치합니다</div>
                <div className="invalid-feedback">{memberPw2Feedback}</div>
            </div>
        </div>

        {/* 닉네임 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                닉네임 <FaAsterisk className="text-danger" />
            </label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${memberClass.memberNickname}`}
                    name="memberNickname" value={member.memberNickname} onChange={changeStrValue}
                    onBlur={checkMemberNickname} />
                <div className="valid-feedback">멋진 닉네임이네요!</div>
                <div className="invalid-feedback">{memberNicknameFeedback}</div>
            </div>
        </div>

        {/* 이메일 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                이메일 <FaAsterisk className="text-danger" />
            </label>
            <div className="col-sm-9 d-flex text-nowrap flex-wrap">
                <input type="text" inputMode="email"
                    className={`form-control w-auto flex-grow-1 ${memberClass.memberEmail}`}
                    name="memberEmail" value={member.memberEmail}
                    onChange={changeStrValue} disabled={sending} onBlur={checkMemberEmail} />

                {/* sending의 여부에 따라 버튼의 상태를 변경 */}
                <button type="button" className="btn btn-primary ms-2" onClick={sendCertEmail}
                    disabled={sending === true}>
                    {sending === true ? <FaSpinner className="custom-spinner" /> : <FaPaperPlane />}
                    <span className="ms-2 d-none d-sm-inline">
                        {sending === true ? "인증번호 발송중" : "인증번호 보내기"}
                    </span>
                </button>
                <div className="valid-feedback">이메일 인증이 완료되었습니다</div>
                <div className="invalid-feedback">{memberEmailFeedback}</div>
            </div>

            {/* 인증번호 입력 화면 */}
            {/* sending만으로 모두 해결이 안됨 */}
            {sending === false && (
                <div className="col-sm-9 offset-sm-3 mt-2 d-flex flex-wrap text-nowrap">
                    <input type="text" inputMode="numeric"
                        className={`form-control w-auto ${certNumberClass}`}
                        placeholder="인증번호 입력"
                        value={certNumber} onChange={changeCertNumber} />
                    <button type="button" className="btn btn-success ms-2" onClick={sendCertCheck}>
                        <FaKey />
                        <span className="ms-2 d-none d-sm-inline">인증번호 확인</span>
                    </button>
                    <div className="invalid-feedback">
                        {certNumberFeedback}
                    </div>
                </div>
            )}

        </div>

        {/* 생년월일 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                생년월일 <FaAsterisk className="text-danger" />
            </label>
            <div className="col-sm-9">
                {/* <input type="text" className="form-control"
                    name="memberBirth" value={member.memberBirth} 
                    onChange={changeStrValue} /> */}
                <DatePicker className={`form-control ${memberClass.memberBirth}`}
                    selected={member.memberBirth}
                    onChange={changeDateValue}
                    dateFormat={"yyyy-MM-dd"}
                    locale={"ko"}
                    maxDate={new Date()}
                    monthsShown={1}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                />
                {/* <div className="invalid-feedback">올바른 날짜 형식이 아닙니다</div> */}
                {/* <div className="invalid-feedback">생년월일은 필수 항목입니다</div> */}
            </div>
        </div>


        {/* 연락처 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                연락처
            </label>
            <div className="col-sm-9">
                <input type="text" inputMode="tel"
                    className={`form-control ${memberClass.memberContact}`}
                    name="memberContact"
                    value={member.memberContact}
                    onChange={changeStrValue} onBlur={checkMemberContact} />
                {/* <div className="valid-feedback"></div> */}
                <div className="invalid-feedback">010으로 시작하는 11자리 휴대전화번호를 입력하세요 -사용 불가</div>
            </div>
        </div>


        {/* 주소 우편번호 기본주소 상세주소 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">주소</label>
            <div className="col-sm-9 d-flex align-items-center">
                <input type="text" name="memberPost" className={`form-control w-auto ${memberClass.memberPost}`}
                    placeholder="우편번호" value={member.memberPost} size={6}
                    onChange={changeStrValue}
                    readOnly onClick={searchAddress} />
                <button type="button" className="btn btn-secondary ms-2"
                    onClick={searchAddress}>
                    <FaMagnifyingGlass />
                    <span className="ms=2 d-none d-sm-inline">찾기</span>
                </button>
                {/* 지우기버튼 */}
                {hasAnyChar === true && (
                    <button type="button" className="btn btn-danger ms-2"
                        onClick={clearMemberAddress}>
                        <FaXmark />
                    </button>
                )}
            </div>
            <div className="col-sm-9 offset-sm-3 mt-2">
                <input type="text" name="memberAddress1" className={`form-control ${memberClass.memberAddress1}`}
                    placeholder="기본주소" value={member.memberAddress1}
                    onChange={changeStrValue}
                    readOnly onClick={searchAddress} />
            </div>
            <div className="col-sm-9 offset-sm-3 mt-2">
                <input type="text" name="memberAddress2" className={`form-control ${memberClass.memberAddress2}`}
                    placeholder="상세주소" value={member.memberAddress2}
                    onChange={changeStrValue} ref={memberAddress2Ref}
                    onBlur={checkMemberAddress} />
                <div className="invalid-feedback">주소는 모두 작성하셔야 합니다</div>
            </div>
        </div>

        {/* 가입버튼 */}
        <div className="row mt-5">
            <div className="col text-end">
                <button type="button" className="btn btn-lg btn-success"
                        disabled={memberValid === false} onClick={sendData}>
                    <FaUser className="me-2"/>
                    <span>{memberValid === true ? "회원 가입하기" : "필수 항목 작성 후 가입 가능"}</span>                    
                </button>
            </div>
        </div>

    </>)
}
