export default function Menu() {

    return (
        <>
            {/* 통합 검색 영역 --- 버튼으로 구현 */}
            <div className="bg-light search-bar d-flex p-3">
                <img src="https://www.dummyimage.com/50x50/000/fff" className="rounded navbar-brand" />
                {/* onClick 이벤트로 검색 페이지로 이동 */}
                <input className="form-control ms-3" placeholder="검색어를 입력하세요" readOnly />
            </div>
        </>
    )
}