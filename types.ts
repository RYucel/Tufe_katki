
export interface PriceData {
  [productName: string]: number;
}

export interface ParsedData {
  products: string[];
  monthlyData: Map<string, PriceData>;
}

export interface CalculationInputSet {
    productName: string;
    changeRate: number;
    targetDate: string;
    weight: number;
    prevProductIndex: number;
    prevGeneralIndex: number;
    prevDecProductIndex: number;
    prevDecGeneralIndex: number;
    currProductIndex: number;
}

export interface CalculationDetails {
  productName: string;
  changeRate: number;
  targetDate: string;
  weight: number;
  prevProductIndex: number;
  prevGeneralIndex: number;
  prevDecProductIndex: number;
  prevDecGeneralIndex: number;
  rebasedPrevProductIndex: number;
  rebasedCurrProductIndex: number;
  rebasedPrevGeneralIndex: number;
  contribution: number;
}
