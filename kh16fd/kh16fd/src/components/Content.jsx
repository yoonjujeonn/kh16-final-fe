import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import CategoryAdd from "./category/CategoryAdd";

export default function Content () {

    return (
        <>
            <div className="row">
                <div className="col-md-10 offset-md-1 col-sm-12">

                    {/* path=주소, element=화면 */}
                    <Routes>

                        {/* 메인페이지 */}
                        <Route path="/" element={<Home />} />

                        {/* 카테고리 등록 페이지 */}
                        <Route path="/category/add" element={<CategoryAdd />} />

                    </Routes>

                </div>
            </div>
        </>
    );
}
