import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
    _id: string;
    name: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME';
    date: string;
    category?: {
        name: string;
        color: string;
        icon: string;
    };
}

interface PDFExportOptions {
    title: string;
    subtitle?: string;
    dateRange?: string;
}

// Helper functions
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Export transactions to PDF with professional formatting
 */
export function exportTransactionsToPDF(
    transactions: Transaction[],
    options: PDFExportOptions,
    customFilename?: string
) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text(options.title, 14, 20);

    if (options.subtitle) {
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(options.subtitle, 14, 28);
    }

    if (options.dateRange) {
        doc.setFontSize(10);
        doc.text(options.dateRange, 14, options.subtitle ? 34 : 28);
    }

    // Calculate totals
    const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Summary section
    const startY = options.dateRange ? 42 : (options.subtitle ? 36 : 32);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Résumé', 14, startY);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Dépenses: ${formatCurrency(totalExpenses)}`, 14, startY + 7);
    doc.text(`Total Revenus: ${formatCurrency(totalIncome)}`, 14, startY + 14);

    // Balance with color
    if (balance >= 0) {
        doc.setTextColor(34, 197, 94);
    } else {
        doc.setTextColor(239, 68, 68);
    }
    doc.text(`Solde: ${formatCurrency(balance)}`, 14, startY + 21);

    // Transactions table
    const tableData = transactions.map(t => [
        formatDate(t.date),
        t.name,
        t.category?.name || '-',
        t.type === 'INCOME' ? 'Revenu' : 'Dépense',
        formatCurrency(t.amount),
    ]);

    autoTable(doc, {
        startY: startY + 28,
        head: [['Date', 'Description', 'Catégorie', 'Type', 'Montant']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [99, 102, 241],
            textColor: 255,
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 35 },
            3: { cellWidth: 25 },
            4: { cellWidth: 30, halign: 'right' },
        },
        didParseCell: function (data) {
            if (data.column.index === 3 && data.cell.section === 'body') {
                const type = data.cell.raw as string;
                if (type === 'Revenu') {
                    data.cell.styles.textColor = [34, 197, 94];
                } else {
                    data.cell.styles.textColor = [239, 68, 68];
                }
            }
        },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageText = `Page ${i} sur ${pageCount}`;
        const pageWidth = doc.internal.pageSize.width;
        const textWidth = doc.getTextWidth(pageText);
        doc.text(pageText, (pageWidth - textWidth) / 2, doc.internal.pageSize.height - 10);
        doc.text(
            `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
            14,
            doc.internal.pageSize.height - 10
        );
    }

    // Save file with custom name using Blob API
    let filename = customFilename || `Masrouf_Transactions_${new Date().toISOString().split('T')[0]}`;
    if (filename.toLowerCase().endsWith('.pdf')) {
        filename = filename.slice(0, -4);
    }

    // Use Blob API for better filename control
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export monthly statistics to PDF
 */
export function exportStatsToPDF(
    stats: {
        totalExpenses: number;
        totalIncome: number;
        byCategory: Array<{ name: string; value: number; color: string }>;
        transactions: Transaction[];
    },
    month: string,
    customFilename?: string
) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('Rapport Statistiques Mensuel', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(month, 14, 28);

    // Summary cards
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    const cardY = 40;

    // Total Expenses
    doc.setFillColor(254, 242, 242);
    doc.rect(14, cardY, 60, 25, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Total Dépenses', 17, cardY + 8);
    doc.setFontSize(14);
    doc.setTextColor(239, 68, 68);
    doc.text(formatCurrency(stats.totalExpenses), 17, cardY + 18);

    // Total Income
    doc.setFillColor(240, 253, 244);
    doc.rect(78, cardY, 60, 25, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Total Revenus', 81, cardY + 8);
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94);
    doc.text(formatCurrency(stats.totalIncome), 81, cardY + 18);

    // Balance
    const balance = stats.totalIncome - stats.totalExpenses;
    doc.setFillColor(239, 246, 255);
    doc.rect(142, cardY, 60, 25, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Solde', 145, cardY + 8);
    doc.setFontSize(14);
    if (balance >= 0) {
        doc.setTextColor(34, 197, 94);
    } else {
        doc.setTextColor(239, 68, 68);
    }
    doc.text(formatCurrency(balance), 145, cardY + 18);

    // Top categories table
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Top Catégories', 14, cardY + 38);

    const categoryData = stats.byCategory
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .map(cat => [
            cat.name,
            formatCurrency(cat.value),
            `${((cat.value / stats.totalExpenses) * 100).toFixed(1)}%`,
        ]);

    autoTable(doc, {
        startY: cardY + 42,
        head: [['Catégorie', 'Montant', '% du Total']],
        body: categoryData,
        theme: 'striped',
        headStyles: {
            fillColor: [99, 102, 241],
            textColor: 255,
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 50, halign: 'right' },
            2: { cellWidth: 40, halign: 'right' },
        },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageText = `Page ${i} sur ${pageCount}`;
        const pageWidth = doc.internal.pageSize.width;
        const textWidth = doc.getTextWidth(pageText);
        doc.text(pageText, (pageWidth - textWidth) / 2, doc.internal.pageSize.height - 10);
        doc.text(
            `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
            14,
            doc.internal.pageSize.height - 10
        );
    }

    // Save with Blob API
    let filename = customFilename || `Masrouf_Stats_${month.replace(/\s+/g, '_')}`;
    if (filename.toLowerCase().endsWith('.pdf')) {
        filename = filename.slice(0, -4);
    }

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
