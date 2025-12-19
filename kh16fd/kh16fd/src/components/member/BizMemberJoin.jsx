import { useCallback, useMemo, useRef, useState } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";

import { useNavigate } from "react-router-dom";
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
registerLocale('ko', ko);

export default function BizMemberJoin() { // MemberJoin -> BizMemberJoin
    // const
    const navigate = useNavigate();

    const [bizMember, setBizMember] = useState({ // member -> bizMember
        memberId: "", memberPw: "", memberNickname: "",
        memberEmail: "", memberBirth: "", memberContact: "",
        memberPost: "", memberAddress1: "", memberAddress2: "",
        memberPw2: ""
    });

    const [bizMemberClass, setBizMemberClass] = useState({ // memberClass -> bizMemberClass
        memberId: "", memberPw: "", memberNickname: "",
        memberEmail: "", memberBirth: "", memberContact: "",
        memberPost: "", memberAddress1: "", memberAddress2: "",
        memberPw2: ""
    });

    //아이디가 문제될 경우 출력할 피드백
    const [bizMemberIdFeedback, setBizMemberIdFeedback] = useState(""); // memberIdFeedback -> bizMemberIdFeedback
    //닉네임이 문제될 경우 출력하는 피드백
    const [bizMemberNicknameFeedback, setBizMemberNicknameFeedback] = useState(""); // memberNicknameFeedback -> bizMemberNicknameFeedback
    //비밀번호 확인이 문제될 경우 출력하는 피드백
    const [bizMemberPw2Feedback, setBizMemberPw2Feedback] = useState(""); // memberPw2Feedback -> bizMemberPw2Feedback


    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setBizMember({ ...bizMember, [name]: value }); // setMember -> setBizMember, member -> bizMember

        //이메일 입력 발생 시 관련 상태 초기화
        if (name === "memberEmail") {
            //이메일 관련 상태 모두 초기화
            resetBizMemberEmail(); // resetMemberEmail -> resetBizMemberEmail
        }

        //밑에 member 안 써도 prev같은거로 사용은 가능하다
    }, [bizMember]); // member -> bizMember

    const changeDateValue = useCallback((date) => {
        const replacement = format(date, "yyyy-MM-dd");//date-fns에서 제공하는 변환 명령
        setBizMember(prev => ({ ...prev, memberBirth: replacement })); // setMember -> setBizMember
        if(date === null) {
            setBizMemberClass(prev => ({...prev, memberBirth : "is-invalid"})) // setMemberClass -> setBizMemberClass
        }
        else if(date !== null) {
            setBizMemberClass (prev => ({...prev, memberBirth : "is-valid"})) // setMemberClass -> setBizMemberClass
        }
    }, [bizMember, bizMemberClass]); // member, memberClass -> bizMember, bizMemberClass

    const checkBizMemberId = useCallback(async (e) => { // checkMemberId -> checkBizMemberId
        //형식검사 -> 아이디 중복검사 -> 결과 설정
        //연관에서 불러올건 진짜 써야되는것만 그냥 변경하는걸로는 안가져와도 됨
        const regex = /^[a-z][a-z0-9]{4,19}$/
        const valid = regex.test(bizMember.memberId); // member -> bizMember
        if (valid) { //형식 통과
            //중복 검사
            //axios 사용예정 async await 쓸거임 ㅅㄱ
            //const response = await axios.get(`/acount/acountId/${member.memberId}`);
            //맨날 보는 구조분해할당(원하는것만 뽑아쓴다)
            const { data } = await axios.get(`/member/memberId/${bizMember.memberId}`); // member -> bizMember (URL 경로는 유지)
            if (data === true) { //사용 가능
                setBizMemberClass(prev => ({ ...prev, memberId: "is-valid" })); // setMemberClass -> setBizMemberClass
            }
            else { //사용 불가(사용 중)
                setBizMemberClass(prev => ({ ...prev, memberId: "is-invalid" })); // setMemberClass -> setBizMemberClass
                setBizMemberIdFeedback("이미 사용중인 아이디입니다"); // setMemberIdFeedback -> setBizMemberIdFeedback
            }
        }
        else { //형식 오류
            setBizMemberClass(prev => ({ ...prev, memberId: "is-invalid" })); // setMemberClass -> setBizMemberClass
            setBizMemberIdFeedback("아이디는 영문 소문자로 시작하며 숫자를 포함한 5~20자로 작성하세요"); // setMemberIdFeedback -> setBizMemberIdFeedback
        }

    }, [bizMember, bizMemberClass]); // member, memberClass -> bizMember, bizMemberClass

    const checkBizMemberNickname = useCallback(async (e) => { // checkMemberNickname -> checkBizMemberNickname
        //닉네임검사
        const regex = /^[가-힣0-9]{2,10}$/
        const valid = regex.test(bizMember.memberNickname); // member -> bizMember
        if (valid === true) { //형식 통과
            //중복 검사
            //axios 사용예정 async await 씀
            //맨날 보는 구조분해할당(원하는것만 뽑아쓴다)
            const { data } = await axios.get(`/member/memberNickname/${bizMember.memberNickname}`); // member -> bizMember (URL 경로는 유지)
            if (data === true) { //사용 가능
                setBizMemberClass(prev => ({ ...prev, memberNickname: "is-valid" })); // setMemberClass -> setBizMemberClass
            }
            else { //사용 불가(사용 중)
                setBizMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" })); // setMemberClass -> setBizMemberClass
                setBizMemberNicknameFeedback("이미 사용중인 닉네임입니다"); // setMemberNicknameFeedback -> setBizMemberNicknameFeedback
            }
        }
        else { //형식 오류
            setBizMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" })); // setMemberClass -> setBizMemberClass
            setBizMemberNicknameFeedback("닉네임은 한글과 숫자를 사용해 2~10자 내로 적어주세요"); // setMemberNicknameFeedback -> setBizMemberNicknameFeedback
        }

    }, [bizMember, bizMemberClass]); // member, memberClass -> bizMember, bizMemberClass


    const checkBizMemberPw = useCallback((e) => { // checkMemberPw -> checkBizMemberPw
        const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\!\@\#\$])[A-Za-z0-9\!\@\#\$]{8,16}$/;
        const valid = regex.test(bizMember.memberPw); // member -> bizMember
        // if(valid === true) { //형식 일치
        //      setmemberClass(prev=> ({...prev, memberPw : "is-valid"}));
        // }
        // else { //불일치
        //      setmemberClass(prev=> ({...prev, memberPw : "is-invalid"}));
        // }
        setBizMemberClass(prev => ({ ...prev, memberPw: valid ? "is-valid" : "is-invalid" })); // setMemberClass -> setBizMemberClass

        if (bizMember.memberPw2.length === 0) { // member -> bizMember
            setBizMemberClass(prev => ({ ...prev, memberPw2: "is-invalid" })); // setMemberClass -> setBizMemberClass
            setBizMemberPw2Feedback("비밀번호를 먼저 작성하세요"); // setMemberPw2Feedback -> setBizMemberPw2Feedback
        }
        else {
            const valid2 = bizMember.memberPw === bizMember.memberPw2; // member -> bizMember
            setBizMemberClass(prev => ({ ...prev, memberPw2: valid2 ? "is-valid" : "is-invalid" })); // setMemberClass -> setBizMemberClass
            setBizMemberPw2Feedback("비밀번호가 일치하지 않습니다"); // setMemberPw2Feedback -> setBizMemberPw2Feedback
        }

    }, [bizMember, bizMemberClass]); // member, memberClass -> bizMember, bizMemberClass

    //비밀번호 표시용 state
    const [showPassword, setShowPassword] = useState(false);

    //이메일
    //state를 한개 더 해도 됨
    const [sending, setSending] = useState(null);

    const sendCertEmail = useCallback(async () => {
        // if (bizMember.memberEmail.length === 0) return;

        const regex = /^[A-Za-z0-9]+@[A-Za-z0-9.]+$/;
        const valid = regex.test(bizMember.memberEmail); // member -> bizMember
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
        const response = await axios.post("/cert/send", { certEmail: bizMember.memberEmail }); // member -> bizMember (URL 경로는 유지)
        //2. 이메일이 성공적으로 전송되면 인증번호 입력창을 표시하도록 상태를 변경
        // if(response === true)
        setSending(false);

    }, [bizMember]) // member -> bizMember

    //인증번호
    const [certNumber, setCertNumber] = useState("");
    const [certNumberClass, setCertNumberClass] = useState("");
    const [certNumberFeedback, setCertNumberFeedback] = useState("");

    const changeCertNumber = useCallback(e => {
        const replacement = e.target.value.replace(/[^0-9]+/g, ""); //숫자가 아닌 항목 제거
        setCertNumber(e.target.value); //설정
    }, []);

    const [bizMemberEmailFeedback, setBizMemberEmailFeedback] = useState(""); // memberEmailFeedback -> bizMemberEmailFeedback

    const sendCertCheck = useCallback(async (e) => {
        resetBizMemberEmail(); // resetMemberEmail -> resetBizMemberEmail

        try {
            const { data } = await axios.post("/cert/check", {
                certEmail: bizMember.memberEmail, certNumber: certNumber // member -> bizMember
            });
            if (data.result === true) { //인증 성공시
                setCertNumberClass("is-valid");
                setSending(null);
                setBizMemberClass(prev => ({ ...prev, memberEmail: "is-valid" })); // setMemberClass -> setBizMemberClass
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
    }, [bizMember.memberEmail, certNumber]); // member.memberEmail -> bizMember.memberEmail

    const resetBizMemberEmail = useCallback(() => { // resetMemberEmail -> resetBizMemberEmail
        setBizMemberClass(prev => ({ ...prev, memberEmail: "" })); // setMemberClass -> setBizMemberClass
        setCertNumber(""); //입력값 초기화
        setCertNumberClass(""); //입력창 클래스 초기화
        setCertNumberFeedback(""); //인증번호 입력창 피드백 초기화
        // setMemberEmailFeedback("");
    }, []);

    const checkBizMemberEmail = useCallback(e => { // checkMemberEmail -> checkBizMemberEmail
        const regex = /^[A-Za-z0-9]+@[A-Za-z0-9.]+$/;
        const valid = regex.test(bizMember.memberEmail); // member -> bizMember
        if (valid === true) { //유효한 상황
            if (certNumberClass !== "is-valid") { //인증 안됬을 때
                setBizMemberClass(prev => ({ ...prev, memberEmail: "is-invalid" })); // setMemberClass -> setBizMemberClass
                setBizMemberEmailFeedback("이메일 인증이 필요합니다"); // setMemberEmailFeedback -> setBizMemberEmailFeedback
            }
        }
        else { //유효하지 않음
            setBizMemberClass(prev => ({ ...prev, memberEmail: "is-invalid" })); // setMemberClass -> setBizMemberClass
            setBizMemberEmailFeedback("부적합한 이메일 형식입니다"); // setMemberEmailFeedback -> setBizMemberEmailFeedback
        }
    }, [bizMember, bizMemberClass, certNumber, certNumberClass]); // member, memberClass -> bizMember, bizMemberClass

    const checkBizMemberContact = useCallback(e => { // checkMemberContact -> checkBizMemberContact
        const regex = /^010[1-9][0-9]{7}$/;
        const valid = bizMember.memberContact.length === 0 || regex.test(bizMember.memberContact); // member -> bizMember
        // setmemberClass({...memberClass, memberContact: valid ? "is-valid" : "is-invalid"});
        setBizMemberClass(prev => ({ ...prev, memberContact: valid ? "is-valid" : "is-invalid" })); // setMemberClass -> setBizMemberClass
    }, [bizMember, bizMemberClass]); // member, memberClass -> bizMember, bizMemberClass

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
                setBizMember(prev => ({ // setMember -> setBizMember
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
    const clearBizMemberAddress = useCallback(() => { // clearMemberAddress -> clearBizMemberAddress

        setBizMember(prev => ({ // setMember -> setBizMember
            ...prev,
            memberPost: "",
            memberAddress1: "",
            memberAddress2: ""
        }));
        setBizMemberClass(prev => ({ // setMemberClass -> setBizMemberClass
            ...prev,
            memberPost: "",
            memberAddress1: "",
            memberAddress2: ""
        }));
    }, []);

    const hasAnyChar = useMemo(() => {

        // const length = bizMember.memberPost.length + // member -> bizMember
        //          bizMember.memberAddress1.length + // member -> bizMember
        //          bizMember.memberAddress2.length; // member -> bizMember
        // return length > 0;

        if (bizMember.memberPost.length > 0) return true; // member -> bizMember
        if (bizMember.memberAddress1.length > 0) return true; // member -> bizMember
        if (bizMember.memberAddress2.length > 0) return true; // member -> bizMember
        return false;


    }, [bizMember]); // member -> bizMember


    //주소 검사
    const checkBizMemberAddress = useCallback((e) => { // checkMemberAddress -> checkBizMemberAddress
        const { memberPost, memberAddress1, memberAddress2 } = bizMember; // member -> bizMember
        const fill = memberPost.length > 0 && memberAddress1.length > 0 && memberAddress2.length > 0;
        const empty = memberPost.length === 0 && memberAddress1.length === 0 && memberAddress2.length === 0;
        const valid = fill || empty;
        setBizMemberClass(prev => ({ // setMemberClass -> setBizMemberClass
            ...prev,//기존 검사결과는 유지하고
            memberPost: valid ? "is-valid" : "is-invalid",
            memberAddress1: valid ? "is-valid" : "is-invalid",
            memberAddress2: valid ? "is-valid" : "is-invalid"
        }));
        // if(bizMember.memberAddress1.length > 0) return true;
        // if(bizMember.memberAddress2.length > 0) return true;
        // return false;
    }, [bizMember, bizMemberClass]); // member, memberClass -> bizMember, bizMemberClass

    //모든 필수 항목이 유효한지 검사 (선택 항목은 is-invalid만 아니면 됨)
    const bizMemberValid = useMemo(() => { // memberValid -> bizMemberValid
        //필수 항목
        if (bizMemberClass.memberId !== "is-valid") return false; // memberClass -> bizMemberClass
        if (bizMemberClass.memberPw !== "is-valid") return false; // memberClass -> bizMemberClass
        if (bizMemberClass.memberPw2 !== "is-valid") return false; // memberClass -> bizMemberClass
        if (bizMemberClass.memberNickname !== "is-valid") return false; // memberClass -> bizMemberClass
        if (bizMemberClass.memberEmail !== "is-valid") return false; // memberClass -> bizMemberClass
        if (certNumberClass !== "is-valid") return false;
        if (bizMemberClass.memberBirth !== "is-valid") return false; // memberClass -> bizMemberClass
        //선택 항목 (미입력은 괜찮지만 잘못된 입력은 문제가 됨)
        if (bizMemberClass.memberContact === "is-invalid") return false; // memberClass -> bizMemberClass
        if (bizMemberClass.memberPost === "is-invalid") return false; // memberClass -> bizMemberClass
        if (bizMemberClass.memberAddress1 === "is-invalid") return false; // memberClass -> bizMemberClass
        if (bizMemberClass.memberAddress2 === "is-invalid") return false; // memberClass -> bizMemberClass
        //모두 통과하면 성공
        return true;
    }, [bizMemberClass, certNumberClass]); // memberClass -> bizMemberClass

    //최종 가입하기
    const sendData = useCallback(async () => {
        if (bizMemberValid === false) return; // memberValid -> bizMemberValid

        const response = await axios.post("/member/business", bizMember); // member -> bizMember (URL 경로는 유지)
        // toast.success("회원 가입이 완료되었습니다");
        //다른 페이지로 이동(완료페이지 or 메인페이지 or 로그인페이지)
        navigate("/member/bizJoinFinish");//완료 페이지 (URL 경로는 유지)
        // navigate("/");
    }, [bizMember, bizMemberValid]); // member, memberValid -> bizMember, bizMemberValid


    return (<>
        <div className="title-wrapper my-4">
        <h1 className="ms-3">비즈회원 회원가입</h1>
        <div className="d-flex  justify-content-end align-items-center">
        <FaAsterisk className="me-2 text-danger" />
        <span className="text-muted">필수 항목을 모두 작성해주세요</span>
        </div>
        </div>
        <div className="container border rounded p-4">
        {/* 아이디 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                아이디 <FaAsterisk className="text-danger" />
            </label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${bizMemberClass.memberId}`} // memberClass -> bizMemberClass
                    name="memberId" value={bizMember.memberId} onChange={changeStrValue} // member -> bizMember
                    onBlur={checkBizMemberId}/> {/* checkMemberId -> checkBizMemberId */}
                <div className="valid-feedback">사용 가능한 아이디입니다!</div>
                <div className="invalid-feedback">{bizMemberIdFeedback}</div> {/* memberIdFeedback -> bizMemberIdFeedback */}
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
                <input type={showPassword === true ? "text" : "password"} className={`form-control ${bizMemberClass.memberPw}`} // memberClass -> bizMemberClass
                    name="memberPw" value={bizMember.memberPw} onChange={changeStrValue} // member -> bizMember
                    onBlur={checkBizMemberPw} autoComplete="off"/> {/* checkMemberPw -> checkBizMemberPw */}
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
                <input type={showPassword === true ? "text" : "password"} className={`form-control ${bizMemberClass.memberPw2}`} // memberClass -> bizMemberClass
                    name="memberPw2" value={bizMember.memberPw2} onChange={changeStrValue} // member -> bizMember
                    onBlur={checkBizMemberPw} /> {/* checkMemberPw -> checkBizMemberPw */}
                <div className="valid-feedback">비밀번호가 일치합니다</div>
                <div className="invalid-feedback">{bizMemberPw2Feedback}</div> {/* memberPw2Feedback -> bizMemberPw2Feedback */}
            </div>
        </div>

        {/* 닉네임 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                닉네임 <FaAsterisk className="text-danger" />
            </label>
            <div className="col-sm-9">
                <input type="text" className={`form-control ${bizMemberClass.memberNickname}`} // memberClass -> bizMemberClass
                    name="memberNickname" value={bizMember.memberNickname} onChange={changeStrValue} // member -> bizMember
                    onBlur={checkBizMemberNickname} /> {/* checkMemberNickname -> checkBizMemberNickname */}
                <div className="valid-feedback">멋진 닉네임이네요!</div>
                <div className="invalid-feedback">{bizMemberNicknameFeedback}</div> {/* memberNicknameFeedback -> bizMemberNicknameFeedback */}
            </div>
        </div>

        {/* 이메일 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">
                이메일 <FaAsterisk className="text-danger" />
            </label>
            <div className="col-sm-9 d-flex text-nowrap flex-wrap">
                <input type="text" inputMode="email"
                    className={`form-control w-auto flex-grow-1 ${bizMemberClass.memberEmail}`} // memberClass -> bizMemberClass
                    name="memberEmail" value={bizMember.memberEmail} // member -> bizMember
                    onChange={changeStrValue} disabled={sending} onBlur={checkBizMemberEmail} /> {/* checkMemberEmail -> checkBizMemberEmail */}

                {/* sending의 여부에 따라 버튼의 상태를 변경 */}
                <button type="button" className="btn btn-primary ms-2" onClick={sendCertEmail}
                    disabled={sending === true}>
                    {sending === true ? <FaSpinner className="custom-spinner" /> : <FaPaperPlane />}
                    <span className="ms-2 d-none d-sm-inline">
                        {sending === true ? "인증번호 발송중" : "인증번호 보내기"}
                    </span>
                </button>
                <div className="valid-feedback">이메일 인증이 완료되었습니다</div>
                <div className="invalid-feedback">{bizMemberEmailFeedback}</div> {/* memberEmailFeedback -> bizMemberEmailFeedback */}
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
                    name="memberBirth" value={bizMember.memberBirth} 
                    onChange={changeStrValue} /> */}
                <DatePicker className={`form-control ${bizMemberClass.memberBirth}`} // memberClass -> bizMemberClass
                    selected={bizMember.memberBirth} // member -> bizMember
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
                    className={`form-control ${bizMemberClass.memberContact}`} // memberClass -> bizMemberClass
                    name="memberContact"
                    value={bizMember.memberContact} // member -> bizMember
                    onChange={changeStrValue} onBlur={checkBizMemberContact} /> {/* checkMemberContact -> checkBizMemberContact */}
                {/* <div className="valid-feedback"></div> */}
                <div className="invalid-feedback">010으로 시작하는 11자리 휴대전화번호를 입력하세요 -사용 불가</div>
            </div>
        </div>


        {/* 주소 우편번호 기본주소 상세주소 */}
        <div className="row mt-4">
            <label className="col-sm-3 col-form-label">주소</label>
            <div className="col-sm-9 d-flex align-items-center">
                <input type="text" name="memberPost" className={`form-control w-auto ${bizMemberClass.memberPost}`} // memberClass -> bizMemberClass
                    placeholder="우편번호" value={bizMember.memberPost} size={6} // member -> bizMember
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
                        onClick={clearBizMemberAddress}> {/* clearMemberAddress -> clearBizMemberAddress */}
                        <FaXmark />
                    </button>
                )}
            </div>
            <div className="col-sm-9 offset-sm-3 mt-2">
                <input type="text" name="memberAddress1" className={`form-control ${bizMemberClass.memberAddress1}`} // memberClass -> bizMemberClass
                    placeholder="기본주소" value={bizMember.memberAddress1} // member -> bizMember
                    onChange={changeStrValue}
                    readOnly onClick={searchAddress} />
            </div>
            <div className="col-sm-9 offset-sm-3 mt-2">
                <input type="text" name="memberAddress2" className={`form-control ${bizMemberClass.memberAddress2}`} // memberClass -> bizMemberClass
                    placeholder="상세주소" value={bizMember.memberAddress2} // member -> bizMember
                    onChange={changeStrValue} ref={memberAddress2Ref}
                    onBlur={checkBizMemberAddress} /> {/* checkMemberAddress -> checkBizMemberAddress */}
                <div className="invalid-feedback">주소는 모두 작성하셔야 합니다</div>
            </div>
        </div>
        </div>
        {/* 가입버튼 */}
        <div className="row mt-5">
            <div className="col text-end">
                <button type="button" className="btn btn-lg btn-success"
                        disabled={bizMemberValid === false} onClick={sendData}> {/* memberValid -> bizMemberValid */}
                    <FaUser className="me-2"/>
                    <span>{bizMemberValid === true ? "회원 가입하기" : "필수 항목 작성 후 가입 가능"}</span>                    {/* memberValid -> bizMemberValid */}
                </button>
            </div>
        </div>

    </>)
}