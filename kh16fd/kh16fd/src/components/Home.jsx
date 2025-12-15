import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "./banner.css";
import "./home.css";

export default function Home() {

    const navigate = useNavigate();

    const [bannerList, setBannerList] = useState([]);

    const [depth1List, setDepth1List] = useState([]);
    const [depth2List, setDepth2List] = useState([]);
    const [selectedDepth1, setSelectedDepth1] = useState(null);

    const [categoryList, setCategoryList] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/banner/list")
            .then(res => setBannerList(res.data));
    }, []);

    useEffect(() => {
        axios.get("http://localhost:8080/place/upper")
            .then(res => setDepth1List(res.data));
    }, []);

    useEffect(() => {
        axios.get("http://localhost:8080/category/parent")
            .then(res => setCategoryList(res.data));
    }, []);

    const clickDepth1 = async (depth1) => {
        if (selectedDepth1 === depth1) {
            setSelectedDepth1(null);
            setDepth2List([]);
            return;
        }

        setSelectedDepth1(depth1);

        const res = await axios.get(
            `http://localhost:8080/place/lower/${encodeURIComponent(depth1)}`
        );
        setDepth2List(res.data);
    };

    const goSearch = (keyword) => {
        navigate("/restaurant/search", {
            state: { keyword }
        });
    };

    return (
        <>
            <div className="row mt-4">
                <div className="col d-flex justify-content-center">
                    {bannerList.length === 0 ? (
                        <img
                            src="https://www.dummyimage.com/430x280/000/fff&text=Banner"
                            className="border rounded"
                        />
                    ) : (
                        <Swiper
                            modules={[Navigation, Autoplay]}
                            navigation
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            loop
                            className="swiper"
                        >
                            {bannerList.map(banner => (
                                <SwiperSlide key={banner.bannerNo}>
                                    <img
                                        src={`http://localhost:8080/attachment/${banner.bannerAttachmentNo}`}
                                        alt=""
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <h3 className="mb-3 text-center">지역</h3>

                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        {depth1List.map(depth1 => (
                            <button key={depth1} className={selectedDepth1 === depth1 ? "place-btn active" : "place-btn"} onClick={() => clickDepth1(depth1)}>
                                {depth1}
                            </button>
                        ))}

                    </div>

                    {selectedDepth1 && depth2List.length > 0 && (
                        <div className="d-flex justify-content-center gap-2 flex-wrap mt-3">
                            {depth2List.map(depth2 => (
                                <button key={depth2} className="place-sub-btn" onClick={() => goSearch(`${selectedDepth1} ${depth2}`)}>
                                    {depth2}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <h3 className="mb-3 text-center">카테고리</h3>

                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        {categoryList.map(category => (
                            <button key={category.categoryNo} className="place-btn" onClick={() => goSearch(category.categoryName)}>
                                {category.categoryName}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
