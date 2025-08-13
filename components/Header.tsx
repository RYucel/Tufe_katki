import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto">
        <h1 className="text-xl font-bold text-teal-400 text-center">TÜFE Katkı Analiz Aracı</h1>
        <p className="text-sm text-gray-400 text-center">Enflasyon Katkı Senaryo Analizi (Ağustos 2025 Etkisi)</p>
      </div>
    </header>
  );
};

export default Header;