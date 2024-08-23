import React, { useState } from 'react';
import * as comp from '../components/auth';
import config from '../config';




function Auth() {
  const [respond, setRespond] = useState({ success: true, message: null });
  const [login, setLogin] = useState(true);

  return (
    <div id='auth' className="absolute w-full h-full flex justify-center overflow-auto bg-white sm:bg-spill-100" 
    style={{ 
      backgroundImage: `url('assets/images/bg1.png')`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center' }}>

     
      <div className="p-6 w-[460px]">
        <h1 className="font-bold text-2xl sm:text-center">
          {config.brandName}
        </h1>
        {/* body */}
        <div className="my-6 sm:p-6 rounded-md bg-white">
          {/* header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-center">
              {login ? 'Đăng Nhập' : 'Đăng Ký'}
            </h1>
            {respond.message && (
              <p
                className={`${
                  !respond.success && 'text-rose-800'
                } text-sm mt-1`}
              >
                {respond.message}
              </p>
            )}
          </div>
          {login ? (
            <comp.login setRespond={setRespond} />
          ) : (
            <comp.register setRespond={setRespond} />
          )}
        </div>
        <div className="pb-6">
          <p className="sm:text-center">
            <span>
              {login ? "Chưa tạo tài khoản ? " : 'Đã có tài khoản ? '}
            </span>
            <button
              type="button"
              className="font-bold inline-block hover:underline"
              onClick={() => {
                setRespond({ success: true, message: null });
                setLogin((prev) => !prev);
              }}
            >
              {login ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

export default Auth;
