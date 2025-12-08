import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// export const loginIdState = atom({ key : "loginIdState", default : null }); --- recoil
// export const loginIdState = atom(null); //jotai
// export const loginIdState = atomWithStorage(저장소 key 이름, 초기값, 저장소 종류);
export const loginIdState = atomWithStorage("loginIdState", "", sessionStorage);

// export const loginLevelState = atom({ key : "loginLevelState", default : null }); --- recoil
// export const loginLevelState = atom(null); //jotai
export const loginLevelState = atomWithStorage("loginLevelState", "", sessionStorage); //jotai + persist

//accessToken
export const accessTokenState = atomWithStorage("accessTokenState", "", sessionStorage);

//refreshToken
export const refreshTokenState = atomWithStorage("refreshTokenState", "", sessionStorage);
// export const loginState = selector({
//     key : "loginState",
//     get: (state) => {
//         const loginId = state.get(loginIdState);
//         const loginLevel = state.get(loginLevelState);
//         return loginId !== null && loginLevel !== null;
//     }
// }); --- recoil
const restaurantInfo = {
        ownerId: "",
        restaurantName: "",
        restaurantContact: "",
        restaurantAddress: "",
        restaurantAddressX: "",
        restaurantAddressY: "",
        address1 : "",
        address2 : "", 
        restaurantOpen: "",
        restaurantClose: "",
        restaurantBreakStart: "",
        restaurantBreakEnd: "",
        reservationInterval: "",
        restaurantOpeningDays: [],
        restaurantLastOrder: "",
        restaurantReservationPrice: "",
        restaurantDescription: ""
};

export const restaurantInfoState = atomWithStorage(
    "restaurantInfoState", restaurantInfo, sessionStorage);

export const loginState = atom(get => {
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);

    //값이 존재하면 정상적으로 반환, 없으면 undefined
    //if(loginId !== undefined) return loginId.length > 0;
    //if(loginLevel !== undefined) retrun loginLevel.length > 0;
    return loginId?.length > 0 && loginLevel?.length > 0;
}); //jotai

export const adminState = atom(get => {
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    return loginId?.length > 0 && loginLevel === "관리자";
});

//로그인 판정이 완료되었는지 확인하기 위한 데이터
export const loginCompleteState = atom(false);

//로그인 관련 state를 초기화하는 함수 (쓰기 함수)
//문법 - const 변수명 = atom(null, 변경함수);
export const clearLoginState = atom(
    null, //읽는 건 필요없고 
    (get, set) => { //변경만 하겠다
        set(loginIdState, "");
        set(loginLevelState, "");
        set(accessTokenState, "");
        set(refreshTokenState, "");
    });

//DevTools에서 확인하기 위한 이름 설정
loginIdState.debugLabel = "loginIdState";
loginLevelState.debugLabel = "loginLevelState";
loginState.debugLabel = "loginState";
adminState.debugLabel = "adminState";
accessTokenState.debugLabel = "accessTokenState";
refreshTokenState.debugLabel = "refreshTokenState";
loginCompleteState.debugLabel = "loginCompleteState";
restaurantInfoState.debugLabel = "restaurantInfoState";
