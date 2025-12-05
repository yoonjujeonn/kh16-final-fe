import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

//bootstrap + bootswatch css
import "bootstrap/dist/css/bootstrap.min.css";
import "bootswatch/dist/minty/bootstrap.min.css";

//bootstrap js
//import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap";
//custom css
import './index.css'

//axios
//import "./utils/axios"

createRoot(document.getElementById('root')).render(
    <App />
)
