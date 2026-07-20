const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Helper function to calculate month difference between YYYY-MM-DD and YT-MT
function getMonthDiff(startDateStr, targetYear, targetMonth) {
  const startDate = new Date(startDateStr);
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1; // 1-12

  return (targetYear - startYear) * 12 + (targetMonth - startMonth);
}

// Calculate billing period month/year for a transaction under a group
function getBillingPeriod(dateStr, group) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if (group.type === 'credit_card' && group.statement_day) {
    const cutoff = group.statement_day;
    if (day > cutoff) {
      // Belongs to the next month's billing cycle
      let billingMonth = month + 1;
      let billingYear = year;
      if (billingMonth > 12) {
        billingMonth = 1;
        billingYear += 1;
      }
      return { year: billingYear, month: billingMonth };
    }
  }
  // Default: transaction calendar month
  return { year, month };
}

// Bank CRUD Endpoints
// GET /api/banks - Get all banks
app.get('/api/banks', async (req, res) => {
  try {
    const db = await getDb();
    const banks = await db.all('SELECT * FROM banks ORDER BY created_at DESC');
    res.json(banks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/banks - Create a bank
app.post('/api/banks', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const id = uuidv4();

  try {
    const db = await getDb();
    await db.run('INSERT INTO banks (id, name) VALUES (?, ?)', [id, name]);
    const bank = await db.get('SELECT * FROM banks WHERE id = ?', [id]);
    res.status(201).json(bank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/banks/:id - Delete a bank
app.delete('/api/banks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM banks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Bank not found' });
    }
    await db.run('DELETE FROM banks WHERE id = ?', [id]);
    res.json({ message: 'Bank deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. GET /api/groups - Get all expense groups
app.get('/api/groups', async (req, res) => {
  try {
    const db = await getDb();
    const groups = await db.all(
      `SELECT eg.*, b.name AS bank_name 
       FROM expense_groups eg 
       LEFT JOIN banks b ON eg.bank_id = b.id 
       ORDER BY eg.created_at DESC`
    );
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /api/groups - Create an expense group
app.post('/api/groups', async (req, res) => {
  const { name, type, due_day, statement_day, bank_id } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }
  const id = uuidv4();
  const dueDay = due_day ? parseInt(due_day, 10) : 15;
  const statementDay = (type === 'credit_card' && statement_day) ? parseInt(statement_day, 10) : null;
  const bankId = bank_id || null;

  try {
    const db = await getDb();
    await db.run(
      'INSERT INTO expense_groups (id, name, type, due_day, statement_day, bank_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, type, dueDay, statementDay, bankId]
    );
    const group = await db.get(
      `SELECT eg.*, b.name AS bank_name 
       FROM expense_groups eg 
       LEFT JOIN banks b ON eg.bank_id = b.id 
       WHERE eg.id = ?`,
      [id]
    );
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. PUT /api/groups/:id - Update an expense group
app.put('/api/groups/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, due_day, statement_day, bank_id } = req.body;

  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM expense_groups WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const updatedName = name !== undefined ? name : existing.name;
    const updatedType = type !== undefined ? type : existing.type;
    const updatedDueDay = due_day !== undefined ? parseInt(due_day, 10) : existing.due_day;
    
    // Evaluate updated statement day
    const activeType = type !== undefined ? type : existing.type;
    let updatedStatementDay = existing.statement_day;
    if (activeType === 'credit_card') {
      updatedStatementDay = statement_day !== undefined ? (statement_day ? parseInt(statement_day, 10) : null) : existing.statement_day;
    } else {
      updatedStatementDay = null;
    }

    const updatedBankId = bank_id !== undefined ? (bank_id || null) : existing.bank_id;

    await db.run(
      `UPDATE expense_groups 
       SET name = ?, type = ?, due_day = ?, statement_day = ?, bank_id = ? 
       WHERE id = ?`,
      [updatedName, updatedType, updatedDueDay, updatedStatementDay, updatedBankId, id]
    );
    const updatedGroup = await db.get(
      `SELECT eg.*, b.name AS bank_name 
       FROM expense_groups eg 
       LEFT JOIN banks b ON eg.bank_id = b.id 
       WHERE eg.id = ?`,
      [id]
    );
    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. DELETE /api/groups/:id - Delete an expense group
app.delete('/api/groups/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM expense_groups WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Group not found' });
    }
    await db.run('DELETE FROM expense_groups WHERE id = ?', [id]);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Company CRUD & Stats Endpoints
// GET /api/companies - Get all companies
app.get('/api/companies', async (req, res) => {
  try {
    const db = await getDb();
    const companies = await db.all('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/companies - Create a company
app.post('/api/companies', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const id = uuidv4();

  try {
    const db = await getDb();
    await db.run('INSERT INTO companies (id, name) VALUES (?, ?)', [id, name]);
    const company = await db.get('SELECT * FROM companies WHERE id = ?', [id]);
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/companies/:id - Delete a company
app.delete('/api/companies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM companies WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Company not found' });
    }
    await db.run('DELETE FROM companies WHERE id = ?', [id]);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/stats - Get statistics for all companies (total spent, count)
app.get('/api/companies/stats', async (req, res) => {
  try {
    const db = await getDb();
    const stats = await db.all(`
      SELECT c.id, c.name, c.created_at, 
             COUNT(t.id) AS tx_count, 
             COALESCE(SUM(t.amount), 0) AS total_amount 
      FROM companies c 
      LEFT JOIN transactions t ON c.id = t.company_id 
      GROUP BY c.id 
      ORDER BY total_amount DESC, c.name ASC
    `);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/companies/:id/transactions - Get all transactions for a company
app.get('/api/companies/:id/transactions', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const transactions = await db.all(`
      SELECT t.*, eg.name AS group_name 
      FROM transactions t 
      LEFT JOIN expense_groups eg ON t.group_id = eg.id 
      WHERE t.company_id = ? 
      ORDER BY t.date DESC
    `, [id]);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /api/transactions - Create a transaction
app.post('/api/transactions', async (req, res) => {
  const { group_id, description, amount, date, is_installment, installment_count, company_id } = req.body;

  if (!group_id || !description || amount === undefined || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = uuidv4();
  const isInstallment = is_installment ? 1 : 0;
  const count = isInstallment ? parseInt(installment_count, 10) || 1 : 1;
  const companyId = company_id || null;

  try {
    const db = await getDb();
    // Validate group exists
    const group = await db.get('SELECT * FROM expense_groups WHERE id = ?', [group_id]);
    if (!group) {
      return res.status(400).json({ error: 'Invalid group_id' });
    }

    await db.run(
      `INSERT INTO transactions (id, group_id, description, amount, date, is_installment, installment_count, company_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, group_id, description, parseFloat(amount), date, isInstallment, count, companyId]
    );

    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5b. PUT /api/transactions/:id - Update a transaction
app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { group_id, description, amount, date, is_installment, installment_count, company_id } = req.body;

  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updatedGroupId = group_id !== undefined ? group_id : existing.group_id;
    const updatedDescription = description !== undefined ? description : existing.description;
    const updatedAmount = amount !== undefined ? parseFloat(amount) : existing.amount;
    const updatedDate = date !== undefined ? date : existing.date;
    const updatedIsInstallment = is_installment !== undefined ? (is_installment ? 1 : 0) : existing.is_installment;
    const updatedInstallmentCount = is_installment !== undefined 
      ? (is_installment ? parseInt(installment_count, 10) || 1 : 1)
      : existing.installment_count;
    const updatedCompanyId = company_id !== undefined ? (company_id || null) : existing.company_id;

    if (group_id !== undefined) {
      const group = await db.get('SELECT * FROM expense_groups WHERE id = ?', [updatedGroupId]);
      if (!group) {
        return res.status(400).json({ error: 'Invalid group_id' });
      }
    }

    await db.run(
      `UPDATE transactions 
       SET group_id = ?, description = ?, amount = ?, date = ?, is_installment = ?, installment_count = ?, company_id = ? 
       WHERE id = ?`,
      [updatedGroupId, updatedDescription, updatedAmount, updatedDate, updatedIsInstallment, updatedInstallmentCount, updatedCompanyId, id]
    );

    const updatedTransaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. DELETE /api/transactions/:id - Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    await db.run('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET /api/monthly-summary - Compute active summary for a selected month/year
app.get('/api/monthly-summary', async (req, res) => {
  const now = new Date();
  const targetYear = parseInt(req.query.year, 10) || now.getFullYear();
  const targetMonth = parseInt(req.query.month, 10) || (now.getMonth() + 1); // 1-12

  try {
    const db = await getDb();
    const groups = await db.all(
      `SELECT eg.*, b.name AS bank_name 
       FROM expense_groups eg 
       LEFT JOIN banks b ON eg.bank_id = b.id 
       ORDER BY eg.created_at DESC`
    );
    const allTransactions = await db.all(`
      SELECT t.*, c.name AS company_name 
      FROM transactions t 
      LEFT JOIN companies c ON t.company_id = c.id
    `);
    
    // Fetch payments for this month
    const payments = await db.all(
      'SELECT transaction_id FROM transaction_payments WHERE year = ? AND month = ? AND is_paid = 1',
      [targetYear, targetMonth]
    );
    const paidTxIds = new Set(payments.map(p => p.transaction_id));

    let totalMonthAmount = 0;
    let totalMonthPaid = 0;
    const groupsSummary = [];

    for (const group of groups) {
      const groupTransactions = allTransactions.filter(t => t.group_id === group.id);
      const activeTransactions = [];
      let groupTotal = 0;
      let groupPaid = 0;

      for (const t of groupTransactions) {
        const isPaid = paidTxIds.has(t.id);
        const billingPeriod = getBillingPeriod(t.date, group);

        if (t.is_installment === 0) {
          // Regular transaction: belongs to the month computed by getBillingPeriod
          if (billingPeriod.year === targetYear && billingPeriod.month === targetMonth) {
            groupTotal += t.amount;
            if (isPaid) groupPaid += t.amount;

            activeTransactions.push({
              id: t.id,
              group_id: t.group_id,
              description: t.description,
              amount: t.amount,
              date: t.date,
              is_installment: false,
              installment_count: 1,
              installment_no: 1,
              monthly_amount: t.amount,
              is_paid: isPaid,
              company_id: t.company_id,
              company_name: t.company_name
            });
          }
        } else {
          // Installment transaction: first installment falls in billingPeriod
          const diff = (targetYear - billingPeriod.year) * 12 + (targetMonth - billingPeriod.month);
          if (diff >= 0 && diff < t.installment_count) {
            const monthlyAmount = Math.round((t.amount / t.installment_count) * 100) / 100;
            groupTotal += monthlyAmount;
            if (isPaid) groupPaid += monthlyAmount;

            activeTransactions.push({
              id: t.id,
              group_id: t.group_id,
              description: t.description,
              amount: t.amount, // Total loan/credit amount
              date: t.date, // Initial date
              is_installment: true,
              installment_count: t.installment_count,
              installment_no: diff + 1,
              monthly_amount: monthlyAmount,
              is_paid: isPaid,
              company_id: t.company_id,
              company_name: t.company_name
            });
          }
        }
      }

      // Add to overall total
      totalMonthAmount += groupTotal;
      totalMonthPaid += groupPaid;

      groupsSummary.push({
        ...group,
        total_amount: Math.round(groupTotal * 100) / 100,
        paid_amount: Math.round(groupPaid * 100) / 100,
        transactions: activeTransactions
      });
    }

    res.json({
      selected_year: targetYear,
      selected_month: targetMonth,
      total_amount: Math.round(totalMonthAmount * 100) / 100,
      paid_amount: Math.round(totalMonthPaid * 100) / 100,
      unpaid_amount: Math.round((totalMonthAmount - totalMonthPaid) * 100) / 100,
      groups: groupsSummary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. POST /api/transactions/:id/toggle-paid - Toggle paid status for a transaction in a month/year
app.post('/api/transactions/:id/toggle-paid', async (req, res) => {
  const { id } = req.params;
  const { year, month } = req.body;

  if (year === undefined || month === undefined) {
    return res.status(400).json({ error: 'Year and month are required' });
  }

  try {
    const db = await getDb();
    const existing = await db.get(
      'SELECT * FROM transaction_payments WHERE transaction_id = ? AND year = ? AND month = ?',
      [id, year, month]
    );

    if (existing) {
      await db.run(
        'DELETE FROM transaction_payments WHERE transaction_id = ? AND year = ? AND month = ?',
        [id, year, month]
      );
      res.json({ is_paid: false });
    } else {
      await db.run(
        'INSERT INTO transaction_payments (transaction_id, year, month, is_paid) VALUES (?, ?, ?, 1)',
        [id, year, month]
      );
      res.json({ is_paid: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. GET /api/history - Return history for the last 12 rolling months
app.get('/api/history', async (req, res) => {
  const now = new Date();
  const history = [];

  try {
    const db = await getDb();
    const groups = await db.all('SELECT * FROM expense_groups');
    const allTransactions = await db.all(`
      SELECT t.*, c.name AS company_name 
      FROM transactions t 
      LEFT JOIN companies c ON t.company_id = c.id
    `);

    const groupsMap = {};
    groups.forEach(g => {
      groupsMap[g.id] = g;
    });

    const monthsList = [];
    // Show 9 past months, current month, and 2 future months (total 12 months)
    for (let i = 9; i >= -2; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsList.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1
      });
    }

    for (const m of monthsList) {
      const targetYear = m.year;
      const targetMonth = m.month;

      const payments = await db.all(
        'SELECT transaction_id FROM transaction_payments WHERE year = ? AND month = ? AND is_paid = 1',
        [targetYear, targetMonth]
      );
      const paidTxIds = new Set(payments.map(p => p.transaction_id));

      let monthTotal = 0;
      let monthPaid = 0;

      for (const t of allTransactions) {
        const group = groupsMap[t.group_id];
        if (!group) continue;

        const billingPeriod = getBillingPeriod(t.date, group);

        if (t.is_installment === 0) {
          if (billingPeriod.year === targetYear && billingPeriod.month === targetMonth) {
            monthTotal += t.amount;
            if (paidTxIds.has(t.id)) {
              monthPaid += t.amount;
            }
          }
        } else {
          const diff = (targetYear - billingPeriod.year) * 12 + (targetMonth - billingPeriod.month);
          if (diff >= 0 && diff < t.installment_count) {
            const monthlyAmount = Math.round((t.amount / t.installment_count) * 100) / 100;
            monthTotal += monthlyAmount;
            if (paidTxIds.has(t.id)) {
              monthPaid += monthlyAmount;
            }
          }
        }
      }

      history.push({
        year: targetYear,
        month: targetMonth,
        total_amount: Math.round(monthTotal * 100) / 100,
        paid_amount: Math.round(monthPaid * 100) / 100,
        unpaid_amount: Math.round((monthTotal - monthPaid) * 100) / 100
      });
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup Export Endpoint
app.get('/api/backup/export', async (req, res) => {
  try {
    const db = await getDb();
    const banks = await db.all('SELECT * FROM banks');
    const companies = await db.all('SELECT * FROM companies');
    const expenseGroups = await db.all('SELECT * FROM expense_groups');
    const transactions = await db.all('SELECT * FROM transactions');
    const transactionPayments = await db.all('SELECT * FROM transaction_payments');

    res.json({
      version: '9.0',
      exported_at: new Date().toISOString(),
      data: {
        banks,
        companies,
        expense_groups: expenseGroups,
        transactions,
        transaction_payments: transactionPayments
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup Import Endpoint
app.post('/api/backup/import', async (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Missing data in backup payload' });
  }

  const db = await getDb();
  try {
    await db.run('BEGIN TRANSACTION');

    // Clear current tables
    await db.run('DELETE FROM transaction_payments');
    await db.run('DELETE FROM transactions');
    await db.run('DELETE FROM expense_groups');
    await db.run('DELETE FROM companies');
    await db.run('DELETE FROM banks');

    // Import banks
    if (Array.isArray(data.banks)) {
      for (const b of data.banks) {
        await db.run(
          'INSERT INTO banks (id, name, created_at) VALUES (?, ?, ?)',
          [b.id, b.name, b.created_at]
        );
      }
    }

    // Import companies
    if (Array.isArray(data.companies)) {
      for (const c of data.companies) {
        await db.run(
          'INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)',
          [c.id, c.name, c.created_at]
        );
      }
    }

    // Import expense groups
    if (Array.isArray(data.expense_groups)) {
      for (const eg of data.expense_groups) {
        await db.run(
          'INSERT INTO expense_groups (id, name, type, due_day, created_at, statement_day, bank_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [eg.id, eg.name, eg.type, eg.due_day, eg.created_at, eg.statement_day, eg.bank_id]
        );
      }
    }

    // Import transactions
    if (Array.isArray(data.transactions)) {
      for (const t of data.transactions) {
        await db.run(
          'INSERT INTO transactions (id, group_id, description, amount, date, is_installment, installment_count, created_at, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [t.id, t.group_id, t.description, t.amount, t.date, t.is_installment, t.installment_count, t.created_at, t.company_id]
        );
      }
    }

    // Import transaction payments
    if (Array.isArray(data.transaction_payments)) {
      for (const p of data.transaction_payments) {
        await db.run(
          'INSERT INTO transaction_payments (id, transaction_id, year, month, is_paid, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [p.id, p.transaction_id, p.year, p.month, p.is_paid, p.created_at]
        );
      }
    }

    await db.run('COMMIT');
    res.json({ message: 'Backup restored successfully' });
  } catch (error) {
    try {
      await db.run('ROLLBACK');
    } catch (e) {}
    res.status(500).json({ error: error.message });
  }
});

// Serve static assets in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start database:', err);
});

