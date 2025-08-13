import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductSearch from './components/ProductSearch';
import CalculationDisplay from './components/CalculationDisplay';
import Spinner from './components/Spinner';
import { CalculatorIcon } from './components/Icons';
import { ParsedData, CalculationDetails, CalculationInputSet } from './types';
import { parseData, getHistoricalIndices, calculateContribution } from './services/dataService';
import { rawCpiData } from './data/cpiData';
import { rawGeneralCpiData } from './data/generalCpiData';
import { productWeights } from './data/productWeights';
import AssumptionsDisplay from './components/AssumptionsDisplay';

const App: React.FC = () => {
    const [productInput, setProductInput] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [rateInput, setRateInput] = useState('');
    
    const [calculationResult, setCalculationResult] = useState<CalculationDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<ParsedData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const parsed = parseData(rawCpiData, rawGeneralCpiData);
            setData(parsed);
        } catch (e: any) {
            console.error("Data parsing failed:", e);
            setError("Veri dosyası yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
        }
    }, []);

    const handleProductSelect = (product: string) => {
        setSelectedProduct(product);
        setProductInput(product);
        setCalculationResult(null); // Clear previous results
        setError(null);
    };
    
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
        setter(value);
        setCalculationResult(null);
        setError(null);
    };

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !rateInput || !data) {
            setError("Lütfen bir ürün seçin ve fiyat değişim oranını girin.");
            return;
        }
        
        setError(null);
        setIsLoading(true);
        setCalculationResult(null);

        try {
            const rate = parseFloat(rateInput);
            if (isNaN(rate)) {
                throw new Error("Lütfen geçerli bir değişim oranı girin.");
            }

            const weight = productWeights[selectedProduct];
            if (weight === undefined) {
                throw new Error(`"${selectedProduct}" için ağırlık verisi bulunamadı.`);
            }

            const targetDate = '2025-08-01';
            const indices = getHistoricalIndices(data, selectedProduct, targetDate);
            const currProductIndex = indices.prevProductIndex * (1 + rate / 100);

            const inputSet: CalculationInputSet = {
                productName: selectedProduct,
                changeRate: rate,
                targetDate: targetDate,
                weight,
                ...indices,
                currProductIndex,
            };
            
            const result = calculateContribution(inputSet);
            setCalculationResult(result);

        } catch (err: any) {
            console.error(err);
            setError(`Hesaplama hatası: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="flex-grow overflow-y-auto p-4 container mx-auto max-w-2xl w-full">
                <div className="space-y-6">
                    <form onSubmit={handleCalculate} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="product-search" className="block text-sm font-medium text-gray-300 mb-1">Ürün Adı</label>
                                <ProductSearch
                                    products={data?.products || []}
                                    onSelect={handleProductSelect}
                                    value={productInput}
                                    onChange={handleInputChange(setProductInput)}
                                />
                            </div>
                             <div>
                                <label htmlFor="rate-input" className="block text-sm font-medium text-gray-300 mb-1">Ürün Fiyat Değişimi (%)</label>
                                <input
                                    id="rate-input"
                                    type="number"
                                    step="any"
                                    value={rateInput}
                                    onChange={(e) => handleInputChange(setRateInput)(e.target.value)}
                                    placeholder="Ör: 10 (Ağustos 2025 için)"
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center h-12"
                            disabled={isLoading || !selectedProduct || !rateInput}
                        >
                            {isLoading ? <Spinner /> : <span className="flex items-center gap-2"><CalculatorIcon/> Hesapla</span>}
                        </button>
                    </form>

                    {error && (
                         <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>
                    )}
                                        
                    {calculationResult && selectedProduct && (
                       <>
                            <AssumptionsDisplay 
                                productName={selectedProduct}
                                changeRate={parseFloat(rateInput)}
                                targetDate={calculationResult.targetDate}
                            />
                            <CalculationDisplay details={calculationResult} />
                       </>
                    )}
                </div>
            </main>
             <footer className="text-center p-4 text-xs text-gray-600">
                Veri Seti: KKTC İstatistik Kurumu, 2015-2025.
            </footer>
        </div>
    );
};

export default App;