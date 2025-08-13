
import { ParsedData, PriceData, CalculationDetails, CalculationInputSet } from '../types';

function parseGeneralCpiData(csvString: string): Map<string, number> {
    const generalCpiMap = new Map<string, number>();
    const lines = csvString.trim().replace(/^\uFEFF/, '').split(/\r?\n/);
    lines.shift(); // remove header
    for (const line of lines) {
        if (!line) continue;
        const [dateStr, valueStr] = line.split(',');
        if (!dateStr || !valueStr) continue;
        const dateParts = dateStr.trim().replace(/"/g, '').split('/');
        if (dateParts.length !== 3) continue;
        const year = parseInt(dateParts[2], 10);
        const month = parseInt(dateParts[1], 10);
        const dateKey = `${year}-${String(month).padStart(2, '0')}`;
        generalCpiMap.set(dateKey, parseFloat(valueStr));
    }
    return generalCpiMap;
}

// A simple CSV line parser that handles quoted fields.
const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"') {
                if (i < line.length - 1 && line[i + 1] === '"') {
                    // Escaped quote ""
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(field);
                field = '';
            } else {
                field += char;
            }
        }
    }
    result.push(field);
    return result;
};


export function parseData(productCsvString: string, generalCsvString: string): ParsedData {
  const generalCpiMap = parseGeneralCpiData(generalCsvString);
  const monthlyDataMap = new Map<string, PriceData>();
  
  const lines = productCsvString.trim().replace(/^\uFEFF/, '').split(/\r?\n/);
  const headerLine = lines.shift();
  if (!headerLine) {
      return { products: [], monthlyData: new Map() };
  }
  const headers = parseCsvLine(headerLine).map(h => h.trim());

  const productNamesSet = new Set<string>();

  for (const line of lines) {
    if (!line) continue;
    const values = parseCsvLine(line).map(v => v.trim());
    if (values.length < headers.length) continue;

    const dateStr = values[0].replace(/^"|"$/g, '');
    const dateParts = dateStr.split('/');
    if(dateParts.length !== 3) continue;

    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    const dateKey = `${year}-${String(month).padStart(2, '0')}`;

    const prices: PriceData = {};
    for (let j = 1; j < headers.length; j++) {
       const productName = headers[j];
       if (productName) {
         prices[productName] = parseFloat(values[j]) || 0;
         productNamesSet.add(productName);
       }
    }
    
    prices['Genel Endeks'] = generalCpiMap.get(dateKey) || 0;
    monthlyDataMap.set(dateKey, prices);
  }
  
  // Add remaining general CPI data for future months not in product data
  generalCpiMap.forEach((value, key) => {
    if (!monthlyDataMap.has(key)) {
        monthlyDataMap.set(key, { 'Genel Endeks': value });
    }
  });

  const productNames = Array.from(productNamesSet).sort();
  return { products: productNames, monthlyData: monthlyDataMap };
}


export function getHistoricalIndices(data: ParsedData, productName: string, targetDateStr: string) {
  const targetDate = new Date(targetDateStr);
  const targetYear = targetDate.getUTCFullYear();

  const prevMonthDate = new Date(targetDate);
  prevMonthDate.setUTCMonth(prevMonthDate.getUTCMonth() - 1);
  const prevMonthKey = `${prevMonthDate.getUTCFullYear()}-${String(prevMonthDate.getUTCMonth() + 1).padStart(2, '0')}`;
  
  const prevDecKey = `${targetYear - 1}-12`;

  const prevMonthData = data.monthlyData.get(prevMonthKey);
  const prevDecData = data.monthlyData.get(prevDecKey);
  
  if (!prevMonthData || !prevDecData || prevMonthData[productName] === undefined || prevDecData[productName] === undefined || !prevMonthData['Genel Endeks'] || !prevDecData['Genel Endeks']) {
      throw new Error(`Analiz için gerekli geçmiş veri bulunamadı. Eksik aylar: ${!prevDecData ? prevDecKey : ''} ${!prevMonthData ? prevMonthKey : ''}. Lütfen verilerin mevcut olduğu bir tarih deneyin.`);
  }
  
  const prevProductIndex = prevMonthData[productName];
  const prevGeneralIndex = prevMonthData['Genel Endeks'];
  const prevDecProductIndex = prevDecData[productName];
  const prevDecGeneralIndex = prevDecData['Genel Endeks'];
  
  if (isNaN(prevProductIndex) || isNaN(prevGeneralIndex) || isNaN(prevDecProductIndex) || isNaN(prevDecGeneralIndex)) {
      throw new Error(`Endeks değerleri geçersiz. Lütfen veri setini kontrol edin.`);
  }

  return {
    prevProductIndex,
    prevGeneralIndex,
    prevDecProductIndex,
    prevDecGeneralIndex,
  };
}


export function calculateContribution(inputs: CalculationInputSet): CalculationDetails {
  const {
    productName,
    changeRate,
    targetDate,
    weight,
    prevProductIndex,
    prevGeneralIndex,
    prevDecProductIndex,
    prevDecGeneralIndex,
    currProductIndex
  } = inputs;

  const rebasedPrevProductIndex = (prevProductIndex / prevDecProductIndex) * 100;
  const rebasedCurrProductIndex = (currProductIndex / prevDecProductIndex) * 100;
  const rebasedPrevGeneralIndex = (prevGeneralIndex / prevDecGeneralIndex) * 100;

  if (rebasedPrevGeneralIndex === 0) {
      throw new Error("Yeniden bazlanmış önceki ay genel endeksi sıfır olamaz.");
  }

  const wP_prev = rebasedPrevProductIndex * weight;
  const wP_curr = rebasedCurrProductIndex * weight;

  const contribution = ((wP_curr - wP_prev) / rebasedPrevGeneralIndex);

  return {
    productName,
    changeRate,
    targetDate,
    weight,
    prevProductIndex,
    prevGeneralIndex,
    prevDecProductIndex,
    prevDecGeneralIndex,
    rebasedPrevProductIndex,
    rebasedCurrProductIndex,
    rebasedPrevGeneralIndex,
    contribution,
  };
}