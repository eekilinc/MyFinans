import type { ExpenseGroup } from '../types';

export function exportMonthlyTransactionsToCSV(
  year: number,
  month: number,
  groups: ExpenseGroup[],
  monthName: string
): void {
  const headers = [
    'Grup Adı',
    'Grup Türü',
    'Banka',
    'Açıklama',
    'Aylık Tutar (TL)',
    'Toplam Tutar (TL)',
    'Taksit No',
    'Toplam Taksit',
    'Kategori',
    'Firma',
    'İşlem Tarihi',
    'Ödeme Durumu',
    'Düzenli Tekrar'
  ];

  const rows: string[][] = [];

  groups.forEach(group => {
    group.transactions.forEach(tx => {
      rows.push([
        `"${group.name.replace(/"/g, '""')}"`,
        `"${group.type}"`,
        `"${(group.bank_name || '-').replace(/"/g, '""')}"`,
        `"${tx.description.replace(/"/g, '""')}"`,
        (tx.monthly_amount || 0).toFixed(2),
        (tx.amount || 0).toFixed(2),
        tx.is_installment ? `${tx.installment_no}` : '1',
        tx.is_installment ? `${tx.installment_count}` : '1',
        `"${(tx.category || 'other').replace(/"/g, '""')}"`,
        `"${(tx.company_name || '-').replace(/"/g, '""')}"`,
        `"${tx.date}"`,
        tx.is_paid ? 'Ödendi' : 'Ödenmedi',
        tx.is_recurring ? 'Evet' : 'Hayır'
      ]);
    });
  });

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MyFinans_${year}_${month}_${monthName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
