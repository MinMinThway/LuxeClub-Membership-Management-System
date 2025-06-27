import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DashboardData, Tier } from '../../types';
import { getDashboardData } from '../../services/mockApi';
import { TIER_DATA, translations } from '../../constants';
import { DocumentDownloadIcon } from '../common/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface AdminDashboardProps {
  language: 'en' | 'my';
  theme: 'light' | 'dark';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, theme }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const t = translations[language];

    const salesChartRef = useRef<HTMLDivElement>(null);
    const tierChartRef = useRef<HTMLDivElement>(null);
    const redeemedItemsRef = useRef<HTMLDivElement>(null);
    const pointsTrendRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const dashboardData = await getDashboardData();
            setData(dashboardData);
            setLoading(false);
        };
        fetchData();
    }, []);
    
    const handleExportExcel = () => {
        if (!data) return;
        const wb = XLSX.utils.book_new();
        
        const summaryData = [
            {"Metric": t.totalMembers, "Value": data.totalMembers},
            {"Metric": t.activePromotions, "Value": data.activePromotions},
            {"Metric": t.pointsRedeemed, "Value": data.totalPointsRedeemed},
        ];
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Dashboard Summary");

        const tierWs = XLSX.utils.json_to_sheet(data.tierDistribution);
        XLSX.utils.book_append_sheet(wb, tierWs, "Tier Distribution");

        const salesWs = XLSX.utils.json_to_sheet(data.salesVsRedemption);
        XLSX.utils.book_append_sheet(wb, salesWs, "Sales vs Redemption");

        const itemsWs = XLSX.utils.json_to_sheet(data.mostRedeemedItems);
        XLSX.utils.book_append_sheet(wb, itemsWs, "Most Redeemed Items");

        const trendsWs = XLSX.utils.json_to_sheet(data.pointsUsageTrends);
        XLSX.utils.book_append_sheet(wb, trendsWs, "Points Usage Trends");
        
        XLSX.writeFile(wb, "LuxeClub_Dashboard_Report.xlsx");
    };

    const handleExportPDF = async () => {
        if (!salesChartRef.current || !tierChartRef.current || !pointsTrendRef.current || !redeemedItemsRef.current) {
            console.error("Chart refs are not available");
            alert("Could not export to PDF, chart elements not ready.");
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfMargin = 15;
        const contentWidth = pdfWidth - (pdfMargin * 2);
        
        doc.setFontSize(22);
        doc.setTextColor(theme === 'dark' ? '#FFFFFF' : '#1a202c');
        doc.text("LuxeClub Dashboard Report", pdfWidth / 2, 20, { align: 'center' });

        let currentY = 30;

        const addChartToPdf = async (element: HTMLElement, y: number): Promise<number> => {
            const canvas = await html2canvas(element, { 
                backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff', 
                scale: 2,
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

            if (y + imgHeight > doc.internal.pageSize.getHeight() - pdfMargin) {
                doc.addPage();
                y = pdfMargin;
            }

            doc.addImage(imgData, 'PNG', pdfMargin, y, contentWidth, imgHeight);
            return y + imgHeight + 10;
        }

        currentY = await addChartToPdf(salesChartRef.current, currentY);
        currentY = await addChartToPdf(tierChartRef.current, currentY);
        currentY = await addChartToPdf(pointsTrendRef.current, currentY);
        await addChartToPdf(redeemedItemsRef.current, currentY);

        doc.save("LuxeClub_Dashboard_Report.pdf");
    };
    
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
        const tierName = payload.name as Tier;
        const labelColor = (tierName === Tier.Platinum || tierName === Tier.Diamond) ? '#1a202c' : '#ffffff';

        return (
            <text x={x} y={y} fill={labelColor} textAnchor="middle" dominantBaseline="central" fontSize="11px" fontWeight="bold">
                {`${payload.name} (${(percent * 100).toFixed(0)}%)`}
            </text>
        );
    };

    if (loading) {
        return <div className="p-8 text-gray-700 dark:text-white">Loading Dashboard...</div>;
    }

    if (!data) {
        return <div className="p-8 text-gray-700 dark:text-white">Could not load dashboard data.</div>;
    }
    
    const axisColor = theme === 'dark' ? '#a0aec0' : '#6b7280';
    const gridColor = theme === 'dark' ? '#4a5568' : '#e5e7eb';
    const tooltipBg = theme === 'dark' ? '#2d3748' : '#ffffff';
    const tooltipColor = theme === 'dark' ? '#ffffff' : '#1a202c';
    const tooltipCursor = theme === 'dark' ? '#4a5568' : '#f3f4f6';

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                 <div className="flex items-center gap-2 flex-wrap">
                     <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 text-sm">
                         <DocumentDownloadIcon className="w-5 h-5" />
                         Export Excel
                     </button>
                     <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 text-sm">
                          <DocumentDownloadIcon className="w-5 h-5" />
                         Export PDF
                     </button>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.totalMembers}</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data.totalMembers.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.activePromotions}</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data.activePromotions}</p>
                </div>
                <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.pointsRedeemed}</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data.totalPointsRedeemed.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div ref={salesChartRef} className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-900 dark:text-white font-bold mb-4">{t.salesVsRedemption}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.salesVsRedemption}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="month" stroke={axisColor} />
                            <YAxis stroke={axisColor} />
                            <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: 'none', color: tooltipColor }} cursor={{fill: tooltipCursor}}/>
                            <Legend wrapperStyle={{ color: axisColor }}/>
                            <Bar dataKey="sales" fill="#8884d8" name="Sales (in millions MMK)" />
                            <Bar dataKey="redemptions" fill="#82ca9d" name="Redemptions (in 100k points)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div ref={tierChartRef} className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-900 dark:text-white font-bold mb-4">{t.customerTiers}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.tierDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.tierDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={TIER_DATA[entry.name as Tier].hex} />
                                ))}
                            </Pie>
                             <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: 'none', color: tooltipColor }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div ref={pointsTrendRef} className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                <h3 className="text-gray-900 dark:text-white font-bold mb-4">Points Usage Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.pointsUsageTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="date" stroke={axisColor} />
                        <YAxis stroke={axisColor} />
                        <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: 'none', color: tooltipColor }} cursor={{stroke: tooltipCursor, strokeWidth: 2}}/>
                        <Legend wrapperStyle={{ color: axisColor }}/>
                        <Line type="monotone" dataKey="points" stroke="#e5b847" strokeWidth={2} activeDot={{ r: 8 }} name="Points Redeemed" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
             <div ref={redeemedItemsRef} className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg">
                <h3 className="text-gray-900 dark:text-white font-bold mb-4">Most Redeemed Items</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                    {data.mostRedeemedItems.map((item, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-100 dark:bg-brand-light p-3 rounded">
                           <span>{item.name}</span>
                           <span className="font-bold text-gray-800 dark:text-white">{item.count.toLocaleString()} redemptions</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;
