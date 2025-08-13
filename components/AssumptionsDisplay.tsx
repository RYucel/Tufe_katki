import React from 'react';

interface AssumptionsDisplayProps {
    productName: string;
    changeRate: number;
    targetDate: string;
}

const AssumptionsDisplay: React.FC<AssumptionsDisplayProps> = ({ productName, changeRate, targetDate }) => {
    const formattedDate = new Date(targetDate).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-[fadeIn_0.5s_ease-in-out]">
             <h3 className="text-lg font-semibold text-center text-teal-400 mb-4 border-b border-gray-700 pb-2">Analiz Senaryosu</h3>
             <div className="space-y-3 text-gray-300">
                <div className="flex justify-between">
                    <span className="font-medium text-gray-400">Ürün:</span>
                    <span className="font-semibold text-white">{productName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-400">Varsayılan Fiyat Değişimi:</span>
                    <span className={`font-semibold ${changeRate >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        %{changeRate >= 0 ? '+' : ''}{changeRate.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-400">Analiz Dönemi:</span>
                    <span className="font-semibold text-white">{formattedDate}</span>
                </div>
                 <div className="flex justify-between text-sm pt-3 border-t border-gray-700/50 mt-3">
                    <span className="font-medium text-gray-500 italic">* Diğer tüm ürünlerin fiyatlarının sabit kaldığı varsayılmıştır (ceteris paribus).</span>
                </div>
             </div>
        </div>
    );
};

export default AssumptionsDisplay;