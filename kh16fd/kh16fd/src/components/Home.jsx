import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {

    // 배너 목록
    const [bannerList, setBannerList] = useState([]);
    
    useEffect(() => {
        axios.get("http://localhost:8080/banner/list")
            .then(res => {
                setBannerList(res.data);
            })
            .catch(err => console.error("배너 조회 실패", err));
    }, []);

    return (
        <>
            <div className="row">
                <div className="col d-flex justify-content-center">

                    {/* 배너 */}
                    {bannerList.length === 0 ? (
                        <img
                            src="https://www.dummyimage.com/430x280/000/fff&text=Banner"
                            className="border rounded"
                        />
                    ) : (
                        bannerList.map(b => (
                            <img
                                key={b.bannerNo}
                                src={`http://localhost:8080/attachment/${b.bannerAttachmentNo}`}
                                className="border rounded mx-2"
                                style={{ width: "430px", height: "280px" }}
                            />
                        ))
                    )}

                </div>
            </div>

            <div className="row my-4">
                <div className="col">
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
    );
}
