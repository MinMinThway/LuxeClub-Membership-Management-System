import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Transaction, Tier } from '../../types';
import { getTransactions } from '../../services/mockApi';
import { translations, TIER_DATA } from '../../constants';
import TierBadge from '../common/TierBadge';
import { DocumentDownloadIcon } from '../common/Icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FinancialReportsPageProps {
  language: 'en' | 'my';
  theme: 'light' | 'dark';
}

type ReportType = 'sales' | 'revenueByPlan' | 'transactions' | 'failed';

const FinancialReportsPage: React.FC<FinancialReportsPageProps> = ({ language, theme }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportType>('sales');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const t = translations[language];

    const tableRefs = {
        sales: useRef<HTMLTableElement>(null),
        revenueByPlan: useRef<HTMLTableElement>(null),
        transactions: useRef<HTMLTableElement>(null),
        failed: useRef<HTMLTableElement>(null),
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getTransactions();
            setTransactions(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleExportExcel = (data: any[], filename: string) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const handleExportPdf = (title: string, tableRef: React.RefObject<HTMLTableElement>, filename: string) => {
        if (!tableRef.current) return;
        const doc = new jsPDF();
        doc.text(title, 14, 15);
        autoTable(doc, {
            html: tableRef.current,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [229, 184, 71] },
        });
        doc.save(`${filename}.pdf`);
    };

    const renderReportContent = () => {
        if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading reports...</div>;

        switch (activeTab) {
            case 'sales': return <SalesRevenueReport />;
            case 'revenueByPlan': return <RevenueByPlanReport />;
            case 'transactions': return <TransactionReport />;
            case 'failed': return <FailedPaymentReport />;
            default: return null;
        }
    };
    
    const ReportWrapper: React.FC<{ title: string; children: React.ReactNode; onExcelExport: () => void; onPdfExport: () => void; }> = ({ title, children, onExcelExport, onPdfExport }) => (
        <div className="bg-white dark:bg-brand-secondary p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={onExcelExport} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-green-700 transition duration-300 text-sm">
                        <DocumentDownloadIcon className="w-4 h-4" /> {t.exportExcel}
                    </button>
                    <button onClick={onPdfExport} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-700 transition duration-300 text-sm">
                        <DocumentDownloadIcon className="w-4 h-4" /> {t.exportPdf}
                    </button>
                </div>
            </div>
            {children}
        </div>
    );
    
    // Report Components
    const SalesRevenueReport = () => {
        const filteredTransactions = useMemo(() => transactions.filter(tr => {
            if (tr.status !== 'Success') return false;
            if (!dateRange.start || !dateRange.end) return true;
            const trDate = new Date(tr.date);
            return trDate >= new Date(dateRange.start) && trDate <= new Date(dateRange.end);
        }), [transactions, dateRange]);

        const totalRevenue = filteredTransactions.reduce((sum, tr) => sum + tr.amount, 0);
        const reportData = filteredTransactions.map(tr => ({ Date: tr.date, Member: tr.memberName, Description: tr.description, Amount: tr.amount }));

        return (
            <ReportWrapper 
                title={t.salesRevenueReport}
                onExcelExport={() => handleExportExcel(reportData, 'sales_revenue_report')}
                onPdfExport={() => handleExportPdf(t.salesRevenueReport, tableRefs.sales, 'sales_revenue_report')}
            >
                <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-gray-50 dark:bg-brand-light rounded-lg">
                    <div>
                        <label className="text-sm font-medium block mb-1">{t.startDate}</label>
                        <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="p-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-1">{t.endDate}</label>
                        <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="p-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg text-center">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{t.totalRevenue}</div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalRevenue.toLocaleString()} MMK</div>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-4 rounded-lg text-center">
                        <div className="text-sm font-medium text-purple-800 dark:text-purple-300">{t.totalTransactions}</div>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{filteredTransactions.length}</div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" ref={tableRefs.sales}>
                        <thead className="bg-gray-100 dark:bg-brand-light"><tr><th className="p-2 text-left">{t.description}</th><th className="p-2 text-left">{t.amount} (MMK)</th></tr></thead>
                        <tbody>{filteredTransactions.map(tr => <tr key={tr.id}><td className="p-2">{tr.description}</td><td className="p-2">{tr.amount.toLocaleString()}</td></tr>)}</tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };

    const RevenueByPlanReport = () => {
        const revenueByTier = transactions
            .filter(t => t.status === 'Success')
            .reduce((acc, t) => {
                if (!acc[t.memberTier]) acc[t.memberTier] = { revenue: 0, count: 0 };
                acc[t.memberTier].revenue += t.amount;
                acc[t.memberTier].count += 1;
                return acc;
            }, {} as Record<Tier, { revenue: number, count: number }>);
        
        const chartData = Object.entries(revenueByTier).map(([tier, data]) => ({ name: tier, value: data.revenue }));
        const reportData = chartData.map(d => ({ Tier: d.name, Revenue: d.value }));

        return (
            <ReportWrapper title={t.revenueByPlanReport} onExcelExport={() => handleExportExcel(reportData, 'revenue_by_plan')} onPdfExport={() => handleExportPdf(t.revenueByPlanReport, tableRefs.revenueByPlan, 'revenue_by_plan')}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(props) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}>
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={TIER_DATA[entry.name as Tier].hex} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toLocaleString()} MMK`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm" ref={tableRefs.revenueByPlan}>
                            <thead className="bg-gray-100 dark:bg-brand-light"><tr><th className="p-2 text-left">{t.tier}</th><th className="p-2 text-right">{t.revenue} (MMK)</th></tr></thead>
                            <tbody>{Object.entries(revenueByTier).map(([tier, data]) => (<tr key={tier}><td className="p-2"><TierBadge tier={tier as Tier}/></td><td className="p-2 text-right font-semibold">{data.revenue.toLocaleString()}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            </ReportWrapper>
        );
    };
    
    const TransactionReport = () => {
        const reportData = transactions.map(tr => ({ Date: tr.date, Member: tr.memberName, Description: tr.description, Amount: tr.amount, Status: tr.status }));
        return (
            <ReportWrapper title={t.transactionReport} onExcelExport={() => handleExportExcel(reportData, 'all_transactions')} onPdfExport={() => handleExportPdf(t.transactionReport, tableRefs.transactions, 'all_transactions')}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" ref={tableRefs.transactions}>
                        <thead className="bg-gray-100 dark:bg-brand-light"><tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">{t.name}</th><th className="p-2 text-left">{t.description}</th><th className="p-2 text-right">{t.amount}</th><th className="p-2 text-center">{t.status}</th></tr></thead>
                        <tbody>{transactions.map(tr => <tr key={tr.id} className="border-b dark:border-brand-light"><td className="p-2">{tr.date}</td><td className="p-2 font-medium">{tr.memberName}</td><td className="p-2">{tr.description}</td><td className="p-2 text-right">{tr.amount.toLocaleString()}</td><td className="p-2 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${tr.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`}>{tr.status}</span></td></tr>)}</tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };

    const FailedPaymentReport = () => {
        const failed = transactions.filter(tr => tr.status === 'Failed');
        const reportData = failed.map(tr => ({ Date: tr.date, Member: tr.memberName, Description: tr.description, Amount: tr.amount }));
        return (
            <ReportWrapper title={t.failedPaymentReport} onExcelExport={() => handleExportExcel(reportData, 'failed_payments')} onPdfExport={() => handleExportPdf(t.failedPaymentReport, tableRefs.failed, 'failed_payments')}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" ref={tableRefs.failed}>
                        <thead className="bg-gray-100 dark:bg-brand-light"><tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">{t.name}</th><th className="p-2 text-left">{t.description}</th><th className="p-2 text-right">{t.amount}</th></tr></thead>
                        <tbody>{failed.map(tr => <tr key={tr.id} className="border-b dark:border-brand-light"><td className="p-2">{tr.date}</td><td className="p-2 font-medium">{tr.memberName}</td><td className="p-2">{tr.description}</td><td className="p-2 text-right">{tr.amount.toLocaleString()}</td></tr>)}</tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };


    const TabButton: React.FC<{ label: string; reportType: ReportType }> = ({ label, reportType }) => (
        <button onClick={() => setActiveTab(reportType)} className={`px-3 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${activeTab === reportType ? 'border-brand-accent text-brand-accent' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.financialReports}</h1>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
                    <TabButton label={t.salesRevenueReport} reportType="sales" />
                    <TabButton label={t.revenueByPlanReport} reportType="revenueByPlan" />
                    <TabButton label={t.transactionReport} reportType="transactions" />
                    <TabButton label={t.failedPaymentReport} reportType="failed" />
                </nav>
            </div>
            <div>{renderReportContent()}</div>
        </div>
    );
};

export default FinancialReportsPage;