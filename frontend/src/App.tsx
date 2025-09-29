import React from 'react';
import './App.css'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import IsLogin from "./components/isLogin.tsx";
import {CookiesProvider} from "react-cookie";


const AppContent = () => {
    const Login = React.lazy(() => import('./pages/Login.tsx'));
    const Register = React.lazy(() => import('./pages/Register.tsx'));
    const Homepage = React.lazy(() => import('./pages/Homepage.tsx'));

    return (
        <Routes>
            <Route path={"/login"}
                   element={<React.Suspense><Login /></React.Suspense>} />
            <Route path={"/register"}
                   element={<React.Suspense><Register /></React.Suspense>} />
            <Route path={"/"}
                   element={<IsLogin><React.Suspense><Homepage /></React.Suspense></IsLogin>} />
        </Routes>
    );
}


const App = () => {
  return (
      <CookiesProvider>
          <BrowserRouter>
              <AppContent />
          </BrowserRouter>
      </CookiesProvider>
  )
}

export default App
