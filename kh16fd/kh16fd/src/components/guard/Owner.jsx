import { useAtom, useAtomValue } from "jotai"
import { Navigate } from "react-router-dom"
import { loginCompleteState, loginState, ownerState } from "../../utils/jotai"
import { ClimbingBoxLoader } from "react-spinners";


export default function Owner ( { children } ) {
    const loginComplete = useAtomValue(loginCompleteState);
    //const isLogin = useAtomValue(loginState);
    const isOwner = useAtomValue(ownerState);

    if(loginComplete === false) {
        return <ClimbingBoxLoader/>
    }

    return isOwner === true ? children : <Navigate to={"/error/403"}/>
}