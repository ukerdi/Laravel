import React from 'react';
import { ClipLoader } from 'react-spinners';

const Spinner = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-black">
            <div className="flex flex-col items-center">
                <ClipLoader color="#ffffff" size={50} />
                <p className="text-white mt-4">Cargando...</p>
            </div>
        </div>
    );
};

export default Spinner;