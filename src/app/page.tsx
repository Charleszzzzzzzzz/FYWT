'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface MarketData {
  '代码': string;
  '简称': string;
  '时间': string;
  '收盘价(元)': number;
  '涨跌幅(%)': number;
}

const DashboardPage = () => {
  const [data, setData] = useState<MarketData[]>([]);
  const [stockName, setStockName] = useState<string>('');
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [latestChange, setLatestChange] = useState<number | null>(null);
  const [periodHigh, setPeriodHigh] = useState<number | null>(null);
  const [periodLow, setPeriodLow] = useState<number | null>(null);
  const [averagePrice, setAveragePrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/market_data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData: MarketData[] = await response.json();
        setData(jsonData);
        if (jsonData.length > 0) {
          setStockName(jsonData[0]['简称']);
          const latestDataPoint = jsonData[jsonData.length - 1];
          setLatestPrice(latestDataPoint['收盘价(元)']);
          setLatestChange(latestDataPoint['涨跌幅(%)']);

          const prices = jsonData.map(item => item['收盘价(元)']);
          setPeriodHigh(Math.max(...prices));
          setPeriodLow(Math.min(...prices));
          setAveragePrice(prices.reduce((sum, price) => sum + price, 0) / prices.length);
        }
      } catch (error) {
        console.error("Failed to fetch market data:", error);
        // Optionally, set an error state here to display to the user
      }
    };
    fetchData();
  }, []);

  const formatYAxisTick = (value: number) => {
    return value.toFixed(2); // Format to 2 decimal places
  };
  
  const formatTooltipValue = (value: number) => {
    return value.toFixed(2); // Format to 2 decimal places for tooltip
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <Head>
        <title>{stockName ? `${stockName} - ` : ''}行情数据看板</title>
        <meta name="description" content={`${stockName}行情数据分析与可视化`} />
      </Head>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 text-center">
          {stockName ? `${stockName} ` : ''}行情数据看板
        </h1>
      </header>

      {/* Core Metrics Section */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-sm text-gray-400">最新收盘价</h3>
          <p className="text-2xl font-bold text-cyan-500">{latestPrice !== null ? `¥${latestPrice.toFixed(2)}` : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-sm text-gray-400">最新涨跌幅</h3>
          <p className={`text-2xl font-bold ${latestChange !== null ? (latestChange >= 0 ? 'text-red-500' : 'text-green-500') : 'text-gray-300'}`}>
            {latestChange !== null ? `${latestChange.toFixed(2)}%` : 'N/A'}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-sm text-gray-400">本周期最高价</h3>
          <p className="text-2xl font-bold text-cyan-500">{periodHigh !== null ? `¥${periodHigh.toFixed(2)}` : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-sm text-gray-400">本周期最低价</h3>
          <p className="text-2xl font-bold text-cyan-500">{periodLow !== null ? `¥${periodLow.toFixed(2)}` : 'N/A'}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center col-span-2 md:col-span-1 lg:col-span-1">
          <h3 className="text-sm text-gray-400">平均收盘价</h3>
          <p className="text-2xl font-bold text-cyan-500">{averagePrice !== null ? `¥${averagePrice.toFixed(2)}` : 'N/A'}</p>
        </div>
      </section>

      {/* Main Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">收盘价趋势 (元)</h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="时间" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" tickFormatter={formatYAxisTick} domain={['dataMin - 1', 'dataMax + 1']}/>
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.5rem' }} 
                  labelStyle={{ color: '#E2E8F0' }} 
                />
                <Legend wrapperStyle={{ color: '#E2E8F0' }}/>
                <Line type="monotone" dataKey="收盘价(元)" stroke="#4FD1C5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="收盘价" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400">加载数据中或无数据...</p>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">涨跌幅 (%)</h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="时间" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" tickFormatter={formatPercentage} />
                <Tooltip 
                  formatter={formatPercentage}
                  contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.5rem' }} 
                  labelStyle={{ color: '#E2E8F0' }}
                />
                <Legend wrapperStyle={{ color: '#E2E8F0' }}/>
                <Bar dataKey="涨跌幅(%)" name="涨跌幅">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry['涨跌幅(%)'] >= 0 ? '#F56565' : '#48BB78'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400">加载数据中或无数据...</p>
          )}
        </div>
      </section>

      {/* Auxiliary Charts / Data Table Section - Placeholder for now */}
      <section className="grid grid-cols-1 gap-8">
         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">涨跌幅分布</h2>
            {/* Placeholder for Histogram */}
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.map(d => ({ name: d['时间'], value: d['涨跌幅(%)'] }))} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                  <XAxis dataKey="name" stroke="#A0AEC0" name="时间" tick={false} />
                  <YAxis stroke="#A0AEC0" tickFormatter={formatPercentage} allowDataOverflow={true} domain={['auto', 'auto']}/>
                  <Tooltip 
                    formatter={(value: number, name: string, props: FormatterProps) => [formatPercentage(value), `涨跌幅 (${props.payload.name})`]}
                    contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.5rem' }} 
                    labelStyle={{ color: '#E2E8F0' }}
                  />
                  <Bar dataKey="value" name="涨跌幅">
                    {data.map((entry, index) => (
                      <Cell key={`cell-dist-${index}`} fill={entry['涨跌幅(%)'] >= 0 ? '#F56565' : '#48BB78'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400">加载数据中或无数据...</p>
            )}
          </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">原始数据</h2>
          {data.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  {Object.keys(data[0] || {}).map(key => (
                    <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-700 transition-colors duration-150">
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {typeof value === 'number' ? value.toFixed(typeof value === 'string' && value.includes('%') ? 2 : (value % 1 === 0 ? 0 : 4) ) : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-400">加载数据中或无数据...</p>
          )}
        </div>
      </section>

      <footer className="text-center mt-12 py-4 border-t border-gray-700">
        <p className="text-sm text-gray-500">行情数据看板 &copy; {new Date().getFullYear()} - 由 Manus AI 生成</p>
      </footer>
    </div>
  );
};

export default DashboardPage;

