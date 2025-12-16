import { useAtom, useSetAtom } from "jotai";
import { accessTokenState, loginIdState, loginLevelState, refreshTokenState } from "../../utils/jotai";
import Jumbotron from "../templates/Jumbotron";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaAsterisk, FaCheck, FaKey, FaMagnifyingGlass, FaPaperPlane, FaSpinner, FaXmark } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { useDaumPostcodePopup } from "react-daum-postcode";
import Swal from "sweetalert2";
import { useLogout } from "../../hooks/useLogout";

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
        memberAddress: false,
        memberPost: false,
        memberAddress1: false,
        memberAddress2: false
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
        if (name === "memberEmail") {
            //이메일 관련 상태 모두 초기화
            resetMemberEmail();
        }
    }, [member]);

    const changeDateValue = useCallback((date) => {
        const replacement = format(date, "yyyy-MM-dd");//date-fns에서 제공하는 변환 명령
        setMember(prev => ({ ...prev, memberBirth: replacement }));
        if (date === null) {
            setMemberClass(prev => ({ ...prev, memberBirth: "is-invalid" }))
        }
        else if (date !== null) {
            setMemberClass(prev => ({ ...prev, memberBirth: "is-valid" }))
        }
    }, [member, memberClass]);

    const changeMemberNicknameEditable = useCallback(isEdit => {
        setEditable(prev => ({
            ...prev,
            memberNickname: isEdit
        }));
    }, []);
    const changeMemberContactEditable = useCallback(isEdit => {
        setEditable(prev => ({
            ...prev,
            memberContact: isEdit
        }));
    }, []);
    const changeMemberBirthEditable = useCallback(isEdit => {
        setEditable(prev => ({
            ...prev,
            memberBirth: isEdit
        }));
    }, []);
    const changeMemberEmailEditable = useCallback(isEdit => {
        setEditable(prev => ({
            ...prev,
            memberEmail: isEdit
        }));
    }, []);
    const changeMemberPostEditable = useCallback(isEdit => {
        setEditable(prev => ({
            ...prev,
            memberPost: isEdit,
            memberAddress1: isEdit,
            memberAddress2: isEdit
        }));
    }, []);




    // const changeMemberBirthEditable = useCallback(isEdit => {
    //     setEditable(prev => ({
    //         ...prev,
    //         memberContact: isEdit
    //     }));
    // }, [])

    const cancelMemberNickname = useCallback(() => {
        setMember({
            ...member,
            memberNickname: backup?.memberNickname
        });
        changeMemberNicknameEditable(false);
    }, [member, backup]);

    const cancelMemberBirth = useCallback(() => {
        setMember({
            ...member,
            memberBirth: backup?.memberBirth
        });
        changeMemberBirthEditable(false);
    }, [member, backup]);

    const cancelMemberContact = useCallback(() => {
        setMember({
            ...member,
            memberContact: backup?.memberContact
        });
        changeMemberContactEditable(false);
    }, [member, backup]);

    const cancelMemberEmail = useCallback(() => {
        setMember({
            ...member,
            memberEmail: backup?.memberEmail
        });
        changeMemberEmailEditable(false);
    }, [member, backup]);

    const cancelMemberPost = useCallback(() => {
        setMember({
            ...member,
            memberPost: backup?.memberPost,
            memberAddress1: backup?.memberAddress1,
            memberAddress2: backup?.memberAddress2
        });
        changeMemberPostEditable(false);
    }, [member, backup]);


    // const saveMemberNickname = useCallback(async (e) => {
    //     e.preventDefault(); // 필수

    //     console.log("로그인 아이디는 " + loginId);
    //     console.log("토큰 값 확인: ", accessToken);

    //     // checkMemberNickname();
    //     console.log("axios.patch 실행 직전");
    //     setBackup({
    //         ...backup,
    //         memberNickname: member.memberNickname
    //     });
    //     try {

    //         console.log("테스트 PATCH 요청 시도");
    //         console.log(`/member/${loginId}`);
    //         const { member } = await axios.patch(`/member/${loginId}`, {
    //             memberNickname: member.memberNickname},
    //             { 
    //             headers: {
    //                 Authorization: accessToken 
    //             } 
    //         }

    //         );
    //         toast.success("변경사항이 적용되었습니다");
    //     }
    //     catch (err) {
    //         toast.error("변경과정에서 오류가 발생");
    //         setMember({
    //             ...member,
    //             memberNikcname: backup.memberNickname
    //         });
    //         changeMemberNicknameEditable(false);
    //     }


    //     changeMemberNicknameEditable(false);
    // }, [member, backup, loginId, accessToken]);

    const saveMemberNickname = useCallback(() => {
        // e.preventDefault(); // 필수

        console.log("로그인 아이디는 " + loginId);
        console.log("토큰 값 확인: ", accessToken);

        // checkMemberNickname();
        console.log("아이디 형식: ", editable.memberNickname);
        if (editable.memberNickname === false) {
            toast.error("올바르지 않은 아이디 형식");
            cancelMemberNickname();
            return;
        }
        console.log("axios.patch 실행 직전");

        axios({
            url: `/member/${loginId}`,
            method: "patch",
            data: { memberNickname: member.memberNickname }
        }).then(response => {
            toast.success("변경사항이 적용되었습니다");
            setBackup({
                ...backup,
                memberNickname: member.memberNickname
            });
            changeMemberNicknameEditable(false);
        }).catch(err => {
            toast.error("변경과정에서 오류가 발생");
            setMember({
                ...member,
                memberNikcname: backup.memberNickname
            });
            changeMemberNicknameEditable(false);
        });

    }, [member, backup, loginId, editable]);

    const saveMemberContact = useCallback(() => {
        // checkMemberNickname();
        console.log("전화번호: ", editable.memberContact);
        if (editable.memberContact === false) {
            toast.error("올바르지 않은 전화번호 형식");
            cancelMemberContact();
        }
        console.log("axios.patch 실행 직전");

        axios({
            url: `/member/${loginId}`,
            method: "patch",
            data: { memberContact: member.memberContact }
        }).then(response => {
            toast.success("변경사항이 적용되었습니다");
            setBackup({
                ...backup,
                memberContact: member.memberContact
            });
            changeMemberContactEditable(false);
        }).catch(err => {
            toast.error("변경과정에서 오류가 발생");
            setMember({
                ...member,
                memberContact: backup.memberContact
            });
            changeMemberContactEditable(false);
        });

    }, [member, backup, loginId, editable]);

    const saveMemberBirth = useCallback(() => {
        // checkMemberNickname();
        console.log("전화번호: ", editable.memberBirth);
        if (editable.memberBirth === false) {
            toast.error("올바르지 않은 전화번호 형식");
            cancelMemberBirth();
        }
        console.log("axios.patch 실행 직전");

        axios({
            url: `/member/${loginId}`,
            method: "patch",
            data: { memberBirth: member.memberBirth }
        }).then(response => {
            toast.success("변경사항이 적용되었습니다");
            setBackup({
                ...backup,
                memberBirth: member.memberBirth
            });
            changeMemberBirthEditable(false);
        }).catch(err => {
            toast.error("변경과정에서 오류가 발생");
            setMember({
                ...member,
                memberBirth: backup.memberBirth
            });
            changeMemberContactEditable(false);
        });

    }, [member, backup, loginId, editable]);

    const saveMemberEmail = useCallback(() => {
        // checkMemberNickname();
        // console.log("전화번호: ", editable.memberEmail);
        if (editable.memberEmail === false) {
            // toast.error("올바르지 않은 전화번호 형식");
            cancelMemberEmail();
        }
        console.log("axios.patch 실행 직전");

        axios({
            url: `/member/${loginId}`,
            method: "patch",
            data: { memberEmail: member.memberEmail }
        }).then(response => {
            toast.success("변경사항이 적용되었습니다");
            setBackup({
                ...backup,
                memberEmail: member.memberEmail
            });
            changeMemberEmailEditable(false);
        }).catch(err => {
            toast.error("변경과정에서 오류가 발생");
            setMember({
                ...member,
                memberEmail: backup.memberEmail
            });
            changeMemberEmailEditable(false);
        });

    }, [member, backup, loginId, editable]);

    const saveMemberPost = useCallback(() => {
        // checkMemberNickname();
        // console.log("전화번호: ", editable.memberEmail);
        if (editable.memberPost === false) {
            // toast.error("올바르지 않은 전화번호 형식");
            cancelMemberPost();
        }
        if (editable.memberAddress1 === false) {
            // toast.error("올바르지 않은 전화번호 형식");
            cancelMemberPost();
        }
        if (editable.memberAddress2 === false) {
            // toast.error("올바르지 않은 전화번호 형식");
            cancelMemberPost();
        }
        console.log("axios.patch 실행 직전");

        axios({
            url: `/member/${loginId}`,
            method: "patch",
            data: {
                memberPost: member.memberPost,
                memberAddress1: member.memberAddress1,
                memberAddress2: member.memberAddress2
            }
        }).then(response => {
            toast.success("변경사항이 적용되었습니다");
            setBackup({
                ...backup,
                memberPost: member.memberPost
            });
            changeMemberPostEditable(false);
        }).catch(err => {
            toast.error("변경과정에서 오류가 발생");
            setMember({
                ...member,
                memberPost: backup.memberPost
            });
            changeMemberPostEditable(false);
        });

    }, [member, backup, loginId, editable]);



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
                setEditable(prev => ({ ...prev, memberNickname: true }))
            }
            else { //사용 불가(사용 중)
                setMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" }));
                setMemberNicknameFeedback("이미 사용중인 닉네임입니다");
                setEditable(prev => ({ ...prev, memberNickname: false }))
            }
        }
        else { //형식 오류
            setMemberClass(prev => ({ ...prev, memberNickname: "is-invalid" }));
            setMemberNicknameFeedback("닉네임은 한글과 숫자를 사용해 2~10자 내로 적어주세요");
            setEditable(prev => ({ ...prev, memberNickname: false }))
        }

    }, [member, memberClass, editable]);

    const checkMemberContact = useCallback(e => {
        const regex = /^010[1-9][0-9]{7}$/;
        const valid = member.memberContact.length === 0 || regex.test(member.memberContact);
        // setmemberClass({...memberClass, memberContact: valid ? "is-valid" : "is-invalid"});
        setMemberClass(prev => ({ ...prev, memberContact: valid ? "is-valid" : "is-invalid" }));
        setEditable(prev => ({ ...prev, memberContact: valid }));
    }, [member, memberClass]);


    const [sending, setSending] = useState(null);

    const sendCertEmail = useCallback(async () => {
        if (member.memberEmail.length === 0) return;

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

    }, [member]);


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
        console.log("유효? :", setMemberClass.memberEmail);
        try {
            const { data } = await axios.post("/cert/check", {
                certEmail: member?.memberEmail, certNumber: certNumber
            });
            if (data.result === true) { //인증 성공시
                setCertNumberClass("is-valid");
                setSending(null);
                setMemberClass(prev => ({ ...prev, memberEmail: "is-valid" }));
                console.log("유효? :", setMemberClass.memberEmail);
            }
            else { //인증 실패시
                setCertNumberClass("is-invalid");
                console.log("유효? :", setMemberClass.memberEmail);
                setCertNumberFeedback(data.message);
            }

        }
        catch (err) {
            setCertNumberClass("is-invalid");
            setCertNumberFeedback("인증번호 형식이 부적합합니다");
        }

        // console.log(data);
    }, [member?.memberEmail, memberClass, certNumber]);

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
        if (!member) return false;

        const postFilled = String(member.memberPost || "").trim().length > 0;
        if (postFilled > 0) return true;
        const addr1Filled = String(member.memberAddress1 || "").trim().length > 0;
        if (addr1Filled > 0) return true;
        const addr2Filled = String(member.memberAddress2 || "").trim().length > 0;
        if (addr2Filled > 0) return true;

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


    //jotai state (전체 화면에 영향을 미치는 데이터)
    //커스텀 훅
    const logout = useLogout();

    // 회원탈퇴
    const memberWithdraw = useCallback(async () => {

        const result = await Swal.fire({
            title: "탈퇴하시나요?",
            text: "이 작업은 되돌릴 수 없습니다",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "탈퇴하기",
            cancelButtonText: "취소하기",
            allowOutsideClick: false
        });

        if (!result.isConfirmed) {
            return;
        }



        try {
            const response = await axios.patch(`/member/${loginId}/deactivate`);
            console.log(response.data);
            if (response.data === true) {
                await logout();
                await Swal.fire({
                    title: "탈퇴완료",
                    text: "성공적으로 탈퇴하셨습니다",
                    icon: "success"
                });
            }
            else {
                toast.error("탈퇴 처리 중 문제가 발생했습니다");
            }
        }
        catch (err) {
            await Swal.fire({
                title: "오류 발생",
                text: "탈퇴 처리 중 문제가 발생했습니다.",
                icon: "error"
            });
            toast.error("유효하지 않은 요청입니다");
        }
    }, [loginId, logout]);

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

        {/* 닉네임 */}
        <div className="row mt-4 fs-2">
            <div className="col-sm-3 text-primary">닉네임</div>
            <div className="col-sm-9">
                {editable.memberNickname ? (<>
                    <div className="d-flex flex-row">
                        <div>
                            {/* 수정화면 */}
                            <input type="text" name="memberNickname" className={`form-control ${memberClass.memberNickname}`}
                                value={member.memberNickname} onChange={changeStrValue}
                                onBlur={checkMemberNickname}
                            />
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
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column">
                            <div className={`${memberClass.memberNickname}`}>
                                {member?.memberNickname}
                            </div>
                            <div className="valid-feedback fs-6">멋진 닉네임이네요!</div>
                            {/* <div className="invalid-feedback">010으로 시작하는 11자리 휴대전화번호를 입력하세요 -사용 불가</div> */}
                        </div>
                        <div className="">
                            <FaEdit className="ms-4" onClick={e => {
                                //setEditable({...editable, pokemonName: true});
                                changeMemberNicknameEditable(true);
                            }} />
                        </div>
                    </div>

                </>)}
            </div>
        </div>
        {/* 생년월일 */}
        <div className="row mt-4 fs-2">
            <div className="col-sm-3 text-primary">생년월일</div>


            <div className="col-sm-9">
                {editable.memberBirth ? (<>
                    <div className="d-flex flex-row">
                        <div>
                            {/* 수정화면 */}
                            {/* <input type="text" className="form-control"
                            name="memberBirth" value={member.memberBirth} 
                            onChange={changeStrValue} /> */}
                            <DatePicker className={`form-control`}
                                selected={member?.memberBirth}
                                onChange={changeDateValue}
                                dateFormat={"yyyy-MM-dd"}
                                locale={"ko"}
                                maxDate={new Date()}
                                monthsShown={1}
                                showYearDropdown
                                showMonthDropdown
                                dropdownMode="select"
                            />
                        </div>
                        <div className="">
                            {/* 취소 버튼 */}
                            <FaXmark className="ms-4" onClick={cancelMemberBirth} />
                            {/* 수정 버튼 */}
                            <FaCheck className="ms-2" onClick={saveMemberBirth} />
                        </div>
                    </div>

                </>) : (<>
                    {/* 일반화면 */}
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column">
                            <div className={`${memberClass.memberBirth}`}>
                                {member?.memberBirth}
                            </div>


                            {/* <div className="valid-feedback fs-6">멋진 닉네임이네요!</div> */}
                            {/* <div className="invalid-feedback">010으로 시작하는 11자리 휴대전화번호를 입력하세요 -사용 불가</div> */}
                        </div>
                        <div className="">
                            <FaEdit className="ms-4" onClick={e => {
                                //setEditable({...editable, pokemonName: true});
                                changeMemberBirthEditable(true);
                            }} />
                        </div>
                    </div>

                </>)}
            </div>
            <div className="col-sm-9">

                {/* <div className="invalid-feedback">올바른 날짜 형식이 아닙니다</div> */}
                {/* <div className="invalid-feedback">생년월일은 필수 항목입니다</div> */}
            </div>
        </div>


        {/* 전화번호 */}
        <div className="row mt-4 fs-2">
            <div className="col-sm-3 text-primary">전화번호</div>
            <div className="col-sm-9">
                {editable.memberContact ? (<>
                    <div className="d-flex flex-row">
                        <div>
                            {/* 수정화면 */}

                            <input type="text" inputMode="tel" name="memberContact" className={`form-control ${memberClass.memberContact}`}
                                value={member.memberContact} onChange={changeStrValue}
                                onBlur={checkMemberContact}
                            />
                            <div className="invalid-feedback fs-6">010으로 시작하는 11자리 휴대전화번호를 입력하세요</div>
                        </div>
                        <div className="">
                            {/* 취소 버튼 */}
                            <FaXmark className="ms-4" onClick={cancelMemberContact} />
                            {/* 수정 버튼 */}
                            <FaCheck className="ms-2" onClick={saveMemberContact} />
                        </div>
                    </div>

                </>) : (<>
                    {/* 일반화면 */}
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column">
                            <div className={`${memberClass.memberContact}`}>
                                {member?.memberContact}
                            </div>
                            <div className="valid-feedback fs-6">멋진 닉네임이네요!</div>
                            {/* <div className="invalid-feedback fs-6">{memberContectFeedback}</div> */}
                        </div>
                        <div className="">
                            <FaEdit className="ms-4" onClick={e => {
                                //setEditable({...editable, pokemonName: true});
                                changeMemberContactEditable(true);
                            }} />
                        </div>
                    </div>

                </>)}
            </div>
        </div>

        {/* 이메일 */}
        <div className="row mt-4 fs-2">
            <div className="col-sm-3 text-primary">이메일</div>
            <div className="col-sm-9">
                {editable.memberEmail ? (<>
                    <div className="d-flex flex-column">
                        <div className="d-flex align-items-center">
                            {/* 수정화면 */}
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
                            {/* 취소 버튼 */}
                            <FaXmark className="ms-2" onClick={cancelMemberEmail} />
                        </div>
                        {memberClass.memberEmail === "is-invalid" && (
                            <div className="invalid-feedback">{memberEmailFeedback}</div>
                        )}
                        {memberClass.memberEmail === "is-valid" && (

                            <div className="valid-feedback d-flex justify-content-between align-items-center mt-1 mb-2">
                                이메일 인증이 완료되었습니다
                                <div className="d-flex">

                                    {/* 수정 버튼 */}
                                    <FaCheck className="ms-2" onClick={saveMemberEmail} />
                                </div>
                            </div>
                        )}

                        {/* 인증번호 입력 화면 */}
                        {/* sending만으로 모두 해결이 안됨 */}
                        {sending === false && (
                            <div className="mt-2 d-flex align-item-center">
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

                </>) : (<>
                    {/* 일반화면 */}
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column">
                            <div className={`${memberClass.memberEmail}`}>
                                {member?.memberEmail}
                            </div>
                            {/* <div className="valid-feedback fs-6">멋진 닉네임이네요!</div> */}
                            <div className="invalid-feedback">이메일 형식으로(중간에 @를 써서)적어주세요</div>
                        </div>
                        <div className="">
                            <FaEdit className="ms-4" onClick={e => {
                                //setEditable({...editable, pokemonName: true});
                                changeMemberEmailEditable(true);
                            }} />
                        </div>
                    </div>

                </>)}
            </div>
        </div>


        {/* 주소 우편번호 기본주소 상세주소 */}
        <div className="row mt-4 fs-2">
            <div className="col-sm-3 text-primary">주소</div>
            <div className="col-sm-9">
                {editable.memberPost ? (<>
                    <div className="d-flex flex-column">
                        <div className="d-flex align-items-center">
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
                        <div className="mt-2">
                            <input type="text" name="memberAddress1" className={`form-control ${memberClass.memberAddress1}`}
                                placeholder="기본주소" value={member.memberAddress1}
                                onChange={changeStrValue}
                                readOnly onClick={searchAddress} />
                        </div>
                        <div className="mt-2 w-auto">
                            <input type="text" name="memberAddress2" className={`form-control ${memberClass.memberAddress2}`}
                                placeholder="상세주소" value={member.memberAddress2}
                                onChange={changeStrValue} ref={memberAddress2Ref}
                                onBlur={checkMemberAddress} />
                            <div className="invalid-feedback">주소는 모두 작성하셔야 합니다</div>
                            <div className="valid-feedback">
                                <div className="">
                                    {/* 취소 버튼 */}
                                    <FaXmark className="ms-4" onClick={cancelMemberPost} />
                                    {/* 수정 버튼 */}
                                    <FaCheck className="ms-2" onClick={saveMemberPost} />
                                </div>
                            </div>
                        </div>
                    </div>

                </>) : (<>
                    {/* 일반화면 */}
                    <div className="d-flex flex-row">
                        <div className="d-flex flex-column">
                            <div className={`${memberClass.memberPost}`}>
                                {member?.memberPost}
                            </div>
                            <div className={`${memberClass.memberAddress1}`}>
                                {member?.memberAddress1}
                            </div>
                            <div className={`${memberClass.memberAddress2}`}>
                                {member?.memberAddress2}
                            </div>
                            {/* <div className="valid-feedback fs-6">멋진 닉네임이네요!</div> */}
                            {/* <div className="invalid-feedback fs-6">{memberContectFeedback}</div> */}
                        </div>
                        <div className="">
                            <FaEdit className="ms-4" onClick={e => {
                                //setEditable({...editable, pokemonName: true});
                                changeMemberPostEditable(true);
                            }} />
                        </div>
                    </div>

                </>)}
            </div>
        </div>

        {/* 회원 탈퇴 버튼 */}
        <div className="row mt-4">
            <div className="col d-flex align-item-center">
                <button className="btn btn-danger" type="button" onClick={memberWithdraw}>
                    회원 탈퇴
                </button>
            </div>
        </div>

    </>)
}