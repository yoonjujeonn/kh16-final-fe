import Jumbotron from "../templates/Jumbotron";


export default function NeedPermission() {

    return (<>
        <Jumbotron subject="접근 금지" detail="해당 기능을 이용하기 위해 필요한 권한이 부족합니다"/>
    </>)
}