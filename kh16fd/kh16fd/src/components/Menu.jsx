export default function Menu() {

    return (
        <>
            {/* 통합 검색 영역 --- 버튼으로 구현 */}
            <div className="bg-light search-bar d-flex p-3">
                <img src="https://www.dummyimage.com/50x50/000/fff" className="rounded navbar-brand" />
                {/* onClick 이벤트로 검색 페이지로 이동 */}
                <input className="form-control ms-3" placeholder="검색어를 입력하세요" readOnly />
            </div>
            <div className="row mt-4">
                <div className="col d-flex justify-content-center">
                    {/* 배너 영역 */}
                    <img src="https://www.dummyimage.com/430x280/000/fff&text=Banner" className="border rounded"></img>
                </div>
            </div>

            <div className="row my-4">
                <div className="col">
                    {/* 실제 메뉴 영역 */}
                    <div className="menu-container py-3">
                        <div className="gap-5 d-flex mt-4 flex-wrap justify-content-center">

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                        </div>

                        <div className="gap-5 d-flex mt-4 flex-wrap justify-content-center">

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                        </div>

                        <div className="gap-5 d-flex mt-4 flex-wrap justify-content-center">

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                        </div>

                        <div className="gap-5 d-flex mt-4 flex-wrap justify-content-center">

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                            <div className="menu-wrapper">
                                <img src="https://www.dummyimage.com/430x280/000/fff" className="menu-img border rounded" />
                                <span className="mt-2">메뉴</span>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}