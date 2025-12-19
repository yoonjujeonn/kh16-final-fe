import axios from "axios";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { accessTokenState } from "../../utils/jotai";
import { useNavigate } from "react-router-dom";
import { FaStore, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa";

export default function MyRestaurantList() {
  const [list, setList] = useState([]);
  const [accessToken] = useAtom(accessTokenState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) return;

    axios.get("/owner/list", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then(res => setList(res.data));
  }, [accessToken]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">나의 식당</h2>

      {list.map(r => (
        <div
          key={r.restaurantId}
          className="card mb-3 shadow-sm"
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigate(`/owner/my-restaurant/${r.restaurantId}`)
          }
        >
          <div className="card-body">
            <h5 className="mb-2">
              <FaStore className="me-2 text-primary" />
              {r.restaurantName}
            </h5>

            <div className="mb-1 text-muted">
              <FaMapMarkerAlt className="me-2" />
              {r.restaurantAddress}
            </div>

            <div className="mb-1">
              <FaPhone className="me-2" />
              {r.restaurantContact}
            </div>

            <div className="mb-1">
              <FaClock className="me-2" />
              {r.restaurantOpen} ~ {r.restaurantClose}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
