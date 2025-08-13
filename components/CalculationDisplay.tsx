import React, { useState } from 'react';
import { CalculationDetails } from '../types';

const CalculationDisplay: React.FC<{ details: CalculationDetails }> = ({ details }) => {
    const [showDetails, setShowDetails] = useState(false);
    const contributionPoints = details.contribution * 100;

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-[fadeIn_0.5s_ease-in-out]">
            <div className="text-center">
                 <p className="text-lg font-semibold my-2 text-gray-200">
                    Aylık TÜFE Değişim Oranına Doğrudan Katkısı
                </p>
                <p className={`text-5xl font-bold my-3 ${contributionPoints > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {contributionPoints > 0 ? '+' : ''}{contributionPoints.toFixed(4)}
                    <span className="text-3xl ml-2">Puan</span>
                </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="bg-gray-900/40 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-teal-400 text-lg">Bu ne anlama geliyor?</h4>
                    <p className="text-sm text-gray-300">
                        Hesaplanan <span className="font-semibold text-white">"{contributionPoints.toFixed(4)} Puan"</span> değeri, bu senaryonun gerçekleşmesi durumunda aylık enflasyon oranına eklenecek olan <span className="font-semibold text-white">doğrudan yüzde puan</span> etkisidir.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        Örneğin, diğer tüm ürünlerden kaynaklanan aylık enflasyonun <span className="font-semibold text-white">%0</span> olacağı varsayılırsa, sadece bu ürünün fiyat değişimiyle birlikte ilgili ayın enflasyonu <span className="font-semibold text-white">%{contributionPoints.toFixed(4)}</span> olarak gerçekleşecektir.
                    </p>
                </div>
            </div>

            <div className="text-center mt-6">
                 <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-teal-400 text-sm hover:underline focus:outline-none"
                    >
                    {showDetails ? 'Hesaplama Detaylarını Gizle' : 'Hesaplama Detaylarını Göster'}
                </button>
            </div>

            {showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="font-bold mb-2 text-teal-400 text-center">Hesaplama Detayları</h4>
                     <div className="mt-2 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <span className="text-gray-400">Ürün Ağırlığı (w):</span><span className="font-mono text-right">{details.weight.toFixed(4)}</span>
                            <span className="text-gray-400">Önceki Ay Genel Endeksi:</span><span className="font-mono text-right">{details.prevGeneralIndex.toFixed(4)}</span>
                            <span className="text-gray-400">Önceki Ay Ürün Endeksi:</span><span className="font-mono text-right">{details.prevProductIndex.toFixed(4)}</span>
                            <span className="text-gray-400">Aralık Genel Endeksi (Baz):</span><span className="font-mono text-right">{details.prevDecGeneralIndex.toFixed(4)}</span>
                            <span className="text-gray-400">Aralık Ürün Endeksi (Baz):</span><span className="font-mono text-right">{details.prevDecProductIndex.toFixed(4)}</span>
                             <span className="col-span-2 border-t border-gray-600 my-1"></span>
                             <span className="text-gray-400">Yeniden Baz. Önceki Ay Ürün Endeksi:</span><span className="font-mono text-right">{details.rebasedPrevProductIndex.toFixed(4)}</span>
                             <span className="text-gray-400">Yeniden Baz. Cari Ay Ürün Endeksi:</span><span className="font-mono text-right">{details.rebasedCurrProductIndex.toFixed(4)}</span>
                             <span className="text-gray-400">Yeniden Baz. Önceki Ay Genel Endeksi:</span><span className="font-mono text-right">{details.rebasedPrevGeneralIndex.toFixed(4)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalculationDisplay;