
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Member, ContentUsage } from '../../types';
import { getMembers, getContentUsage } from '../../services/mockApi';
import { translations } from '../../constants';
import TierBadge from '../common/TierBadge';
import { DocumentDownloadIcon } from '../common/Icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface EngagementActivityReportsPageProps {
  language: 'en' | 'my';
}

type ReportType = 'loginHistory' | 'topActive' | 'contentUsage';

const EngagementActivityReportsPage: React.FC<EngagementActivityReportsPageProps> = ({ language }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [contentUsage, setContentUsage] = useState<ContentUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportType>('loginHistory');
    const t = translations[language];

    const tableRefs = {
        loginHistory: useRef<HTMLTableElement>(null),
        topActive: useRef<HTMLTableElement>(null),
        contentUsage: useRef<HTMLTableElement>(null),
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [memberData, contentData] = await Promise.all([
                getMembers(),
                getContentUsage(),
            ]);
            setMembers(memberData);
            setContentUsage(contentData);
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

    const LoginHistoryReport = () => {
        const sortedMembers = useMemo(() => [...members].sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime()), [members]);
        const reportData = sortedMembers.map(m => ({ Name: m.name, Tier: m.tier, LoginCount: m.loginCount, LastLogin: new Date(m.lastLogin).toLocaleString(language) }));

        return (
            <ReportWrapper
                title={t.loginHistoryReport}
                onExcelExport={() => handleExportExcel(reportData, 'login_history')}
                onPdfExport={() => handleExportPdf(t.loginHistoryReport, tableRefs.loginHistory, 'login_history')}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" ref={tableRefs.loginHistory}>
                        <thead className="bg-gray-100 dark:bg-brand-light">
                            <tr>
                                <th className="p-2 text-left">{t.name}</th>
                                <th className="p-2 text-left">{t.tier}</th>
                                <th className="p-2 text-left">{t.loginCount}</th>
                                <th className="p-2 text-left">{t.lastLogin}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMembers.map(m => (
                                <tr key={m.id} className="border-b dark:border-brand-light">
                                    <td className="p-2 font-medium dark:text-white">{m.name}</td>
                                    <td className="p-2"><TierBadge tier={m.tier} /></td>
                                    <td className="p-2">{m.loginCount}</td>
                                    <td className="p-2">{new Date(m.lastLogin).toLocaleString(language)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };

    const TopActiveMembersReport = () => {
        const sortedMembers = useMemo(() => [...members].sort((a, b) => b.loginCount - a.loginCount).slice(0, 20), [members]);
        const reportData = sortedMembers.map((m, index) => ({ Rank: index + 1, Name: m.name, Tier: m.tier, LoginCount: m.loginCount, LastLogin: new Date(m.lastLogin).toLocaleString(language) }));
        
        return (
            <ReportWrapper
                title={t.topActiveMembersReport}
                onExcelExport={() => handleExportExcel(reportData, 'top_active_members')}
                onPdfExport={() => handleExportPdf(t.topActiveMembersReport, tableRefs.topActive, 'top_active_members')}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" ref={tableRefs.topActive}>
                        <thead className="bg-gray-100 dark:bg-brand-light">
                            <tr>
                                <th className="p-2 text-left">#</th>
                                <th className="p-2 text-left">{t.name}</th>
                                <th className="p-2 text-left">{t.tier}</th>
                                <th className="p-2 text-left">{t.loginCount}</th>
                                <th className="p-2 text-left">{t.lastLogin}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMembers.map((m, index) => (
                                <tr key={m.id} className="border-b dark:border-brand-light">
                                    <td className="p-2 font-bold">{index + 1}</td>
                                    <td className="p-2 font-medium dark:text-white">{m.name}</td>
                                    <td className="p-2"><TierBadge tier={m.tier} /></td>
                                    <td className="p-2 font-bold">{m.loginCount}</td>
                                    <td className="p-2">{new Date(m.lastLogin).toLocaleString(language)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };

    const ContentUsageReport = () => {
        const sortedContent = useMemo(() => [...contentUsage].sort((a, b) => b.views - a.views), [contentUsage]);
        const reportData = sortedContent.map(c => ({ Name: c.name, Type: c.type, Views: c.views }));
        
        return (
            <ReportWrapper
                title={t.contentUsageReport}
                onExcelExport={() => handleExportExcel(reportData, 'content_usage')}
                onPdfExport={() => handleExportPdf(t.contentUsageReport, tableRefs.contentUsage, 'content_usage')}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" ref={tableRefs.contentUsage}>
                         <thead className="bg-gray-100 dark:bg-brand-light">
                            <tr>
                                <th className="p-2 text-left">Content Name</th>
                                <th className="p-2 text-left">{t.contentType}</th>
                                <th className="p-2 text-left">{t.views}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedContent.map(c => (
                                <tr key={c.id} className="border-b dark:border-brand-light">
                                    <td className="p-2 font-medium dark:text-white">{c.name}</td>
                                    <td className="p-2">{c.type}</td>
                                    <td className="p-2 font-bold">{c.views.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };

    const renderReportContent = () => {
        if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading reports...</div>;

        switch (activeTab) {
            case 'loginHistory': return <LoginHistoryReport />;
            case 'topActive': return <TopActiveMembersReport />;
            case 'contentUsage': return <ContentUsageReport />;
            default: return null;
        }
    };
    
    const TabButton: React.FC<{ label: string; reportType: ReportType }> = ({ label, reportType }) => (
        <button
            onClick={() => setActiveTab(reportType)}
            className={`px-3 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2
                ${activeTab === reportType
                    ? 'border-brand-accent text-brand-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.engagementReports}</h1>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
                    <TabButton label={t.loginHistoryReport} reportType="loginHistory" />
                    <TabButton label={t.topActiveMembersReport} reportType="topActive" />
                    <TabButton label={t.contentUsageReport} reportType="contentUsage" />
                </nav>
            </div>
            <div>{renderReportContent()}</div>
        </div>
    );
};

export default EngagementActivityReportsPage;
