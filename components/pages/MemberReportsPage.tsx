import React, { useState, useEffect, useRef } from 'react';
import { Member, Tier } from '../../types';
import { getMembers } from '../../services/mockApi';
import { translations } from '../../constants';
import TierBadge from '../common/TierBadge';
import { DocumentDownloadIcon } from '../common/Icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface MemberReportsPageProps {
  language: 'en' | 'my';
}

type ReportType = 'list' | 'new' | 'expiration' | 'status' | 'tier';

const MemberReportsPage: React.FC<MemberReportsPageProps> = ({ language }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportType>('list');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const t = translations[language];

    const tableRefs = {
        list: useRef<HTMLTableElement>(null),
        new: useRef<HTMLTableElement>(null),
        expiration: useRef<HTMLTableElement>(null),
        status: useRef<HTMLTableElement>(null),
        tier: useRef<HTMLTableElement>(null),
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const memberData = await getMembers();
            setMembers(memberData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleExportExcel = (reportType: ReportType, data: any[], filename: string) => {
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
            headStyles: { fillColor: [229, 184, 71] }, // brand-accent
        });
        doc.save(`${filename}.pdf`);
    };

    const renderReportContent = () => {
        if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading reports...</div>;

        switch (activeTab) {
            case 'list': return <FullListReport />;
            case 'new': return <NewMembersReport />;
            case 'expiration': return <ExpirationReport />;
            case 'status': return <StatusReport />;
            case 'tier': return <TierReport />;
            default: return null;
        }
    };
    
    const ReportWrapper: React.FC<{ title: string; children: React.ReactNode; onExcelExport: () => void; onPdfExport: () => void; }> = ({ title, children, onExcelExport, onPdfExport }) => (
        <div className="bg-white dark:bg-brand-secondary p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={onExcelExport} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-green-700 transition duration-300 text-sm">
                        <DocumentDownloadIcon className="w-4 h-4" />
                        {t.exportExcel}
                    </button>
                    <button onClick={onPdfExport} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-700 transition duration-300 text-sm">
                        <DocumentDownloadIcon className="w-4 h-4" />
                        {t.exportPdf}
                    </button>
                </div>
            </div>
            {children}
        </div>
    );
    
    // Report Components
    const FullListReport = () => {
        const reportData = members.map(m => ({
            ID: m.id, Name: m.name, Tier: m.tier, Points: m.points, 
            JoinDate: m.joinDate, LastVisit: m.lastVisitDate, ExpiresOn: m.expirationDate,
            Email: m.email, Phone: m.phone, NRC: m.nrc
        }));
        return (
            <ReportWrapper 
                title={t.allMembers}
                onExcelExport={() => handleExportExcel('list', reportData, 'full_member_list')}
                onPdfExport={() => handleExportPdf(t.allMembers, tableRefs.list, 'full_member_list')}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" ref={tableRefs.list}>
                        <thead className="bg-gray-100 dark:bg-brand-light">
                            <tr>
                                <th className="p-2 text-left">{t.name}</th>
                                <th className="p-2 text-left">{t.tier}</th>
                                <th className="p-2 text-left">{t.points}</th>
                                <th className="p-2 text-left">{t.joinDate}</th>
                                <th className="p-2 text-left">{t.lastVisit}</th>
                                <th className="p-2 text-left">{t.expiresOn}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(m => (
                                <tr key={m.id} className="border-b dark:border-brand-light">
                                    <td className="p-2 font-medium dark:text-white">{m.name}</td>
                                    <td className="p-2"><TierBadge tier={m.tier} /></td>
                                    <td className="p-2">{m.points}</td>
                                    <td className="p-2">{m.joinDate}</td>
                                    <td className="p-2">{m.lastVisitDate}</td>
                                    <td className="p-2">{m.expirationDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };

    const NewMembersReport = () => {
        const filtered = members.filter(m => {
            if (!dateRange.start || !dateRange.end) return false;
            const joinDate = new Date(m.joinDate);
            return joinDate >= new Date(dateRange.start) && joinDate <= new Date(dateRange.end);
        });
        const reportData = filtered.map(m => ({ ID: m.id, Name: m.name, Tier: m.tier, JoinDate: m.joinDate, Email: m.email }));
        return (
            <ReportWrapper
                title={t.newMembersByDate}
                onExcelExport={() => handleExportExcel('new', reportData, 'new_members')}
                onPdfExport={() => handleExportPdf(t.newMembersByDate, tableRefs.new, 'new_members')}
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
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" ref={tableRefs.new}>
                        {/* Table structure similar to FullListReport */}
                        <thead>...</thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m.id} className="border-b dark:border-brand-light">
                                    <td className="p-2 font-medium dark:text-white">{m.name}</td>
                                    <td className="p-2"><TierBadge tier={m.tier} /></td>
                                    <td className="p-2">{m.joinDate}</td>
                                    <td className="p-2">{m.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };

    const ExpirationReport = () => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const today = new Date();
        
        const filtered = members.filter(m => {
            const expDate = new Date(m.expirationDate);
            return expDate <= thirtyDaysFromNow && expDate >= today;
        });
        const reportData = filtered.map(m => ({ Name: m.name, Tier: m.tier, ExpiresOn: m.expirationDate, Phone: m.phone }));
        return (
            <ReportWrapper
                title={t.expiringSoon}
                onExcelExport={() => handleExportExcel('expiration', reportData, 'expiring_members')}
                onPdfExport={() => handleExportPdf(t.expiringSoon, tableRefs.expiration, 'expiring_members')}
            >
                <div className="overflow-x-auto">
                     <table className="w-full text-sm" ref={tableRefs.expiration}>
                        <thead>
                            <tr>
                                <th className="p-2 text-left">{t.name}</th>
                                <th className="p-2 text-left">{t.tier}</th>
                                <th className="p-2 text-left">{t.expiresOn}</th>
                                <th className="p-2 text-left">{t.phoneNumber}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m.id} className="border-b dark:border-brand-light">
                                    <td className="p-2 font-medium dark:text-white">{m.name}</td>
                                    <td className="p-2"><TierBadge tier={m.tier} /></td>
                                    <td className="p-2 text-red-500 font-bold">{m.expirationDate}</td>
                                    <td className="p-2">{m.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };

    const StatusReport = () => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const activeMembers = members.filter(m => new Date(m.lastVisitDate) >= sixMonthsAgo);
        const inactiveMembers = members.filter(m => new Date(m.lastVisitDate) < sixMonthsAgo);
        const reportData = members.map(m => ({ Name: m.name, LastVisit: m.lastVisitDate, Status: new Date(m.lastVisitDate) >= sixMonthsAgo ? 'Active' : 'Inactive' }));

        return (
             <ReportWrapper
                title={t.memberStatus}
                onExcelExport={() => handleExportExcel('status', reportData, 'member_status')}
                onPdfExport={() => handleExportPdf(t.memberStatus, tableRefs.status, 'member_status')}
            >
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{activeMembers.length}</div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-300">{t.active}</div>
                    </div>
                     <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">{inactiveMembers.length}</div>
                        <div className="text-sm font-medium text-red-800 dark:text-red-300">{t.inactive}</div>
                    </div>
                </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm" ref={tableRefs.status}>
                        <thead>
                            <tr>
                                <th className="p-2 text-left">{t.name}</th>
                                <th className="p-2 text-left">{t.lastVisit}</th>
                                <th className="p-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(m => {
                                const isActive = new Date(m.lastVisitDate) >= sixMonthsAgo;
                                return (
                                <tr key={m.id} className="border-b dark:border-brand-light">
                                    <td className="p-2 font-medium dark:text-white">{m.name}</td>
                                    <td className="p-2">{m.lastVisitDate}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {isActive ? t.active : t.inactive}
                                        </span>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
    };
    
    const TierReport = () => {
        const tierCounts = members.reduce((acc, member) => {
            acc[member.tier] = (acc[member.tier] || 0) + 1;
            return acc;
        }, {} as Record<Tier, number>);
        
        const reportData = Object.entries(tierCounts).map(([tier, count]) => ({ Tier: tier, MemberCount: count }));
        
        return (
             <ReportWrapper
                title={t.memberTierDistribution}
                onExcelExport={() => handleExportExcel('tier', reportData, 'member_by_tier')}
                onPdfExport={() => handleExportPdf(t.memberTierDistribution, tableRefs.tier, 'member_by_tier')}
            >
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm" ref={tableRefs.tier}>
                        <thead>
                             <tr>
                                <th className="p-2 text-left">{t.tier}</th>
                                <th className="p-2 text-left">{t.memberCount}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Object.keys(tierCounts) as Tier[]).map(tier => (
                                <tr key={tier} className="border-b dark:border-brand-light">
                                    <td className="p-2"><TierBadge tier={tier}/></td>
                                    <td className="p-2 font-bold dark:text-white">{tierCounts[tier]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ReportWrapper>
        );
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.memberReports}</h1>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
                    <TabButton label={t.memberListReport} reportType="list" />
                    <TabButton label={t.newMemberReport} reportType="new" />
                    <TabButton label={t.expirationReport} reportType="expiration" />
                    <TabButton label={t.statusReport} reportType="status" />
                    <TabButton label={t.tierReport} reportType="tier" />
                </nav>
            </div>

            <div>
                {renderReportContent()}
            </div>
        </div>
    );
};

export default MemberReportsPage;