import {Navigate} from "react-router-dom";
import {useCookies} from "react-cookie";

// 在router中使用，检查是否登录
const IsLogin = ({children}: any) => {

    const [cookies] = useCookies(['Authorization']);

    // 检查是否存在Authorization token
    if (!cookies.Authorization) {
        // 如果没有token，重定向到登录页面
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default IsLogin
