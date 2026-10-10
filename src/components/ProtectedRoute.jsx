import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  const location = useLocation();

  // 🔐 If user not logged in → redirect to login
  // 💡 Also store the page they were trying to visit
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // ✅ If logged in → allow access
  return children;
};

export default ProtectedRoute;