import { Route, Routes } from "react-router-dom";
import Home from "./Home";

export default function Content () {

    return (
    <>
      {/* 전체 화면의 폭을 통제하기 위한 추가 코드*/}
            <div className="row">
                <div className="col-md-10 offset-md-1 col-sm-12">

                    {/* 분할된 화면의 주소를 지정하는 영역 (path=주소, element=화면) */}
                    <Routes>
                        <Route path="/" element={<Home />}></Route>

                    </Routes>

                </div>
                </div>

    </>
)
}