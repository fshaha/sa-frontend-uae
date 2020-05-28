package com.simplevat.rest.reconsilationcontroller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simplevat.constant.ChartOfAccountCategoryIdEnumConstant;
import com.simplevat.constant.ChartOfAccountConstant;
import com.simplevat.constant.InvoiceTypeConstant;
import com.simplevat.constant.PostingReferenceTypeEnum;
import com.simplevat.constant.ReconsileCategoriesEnumConstant;
import com.simplevat.constant.TransactionCategoryCodeEnum;
import com.simplevat.entity.Expense;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.Journal;
import com.simplevat.entity.JournalLineItem;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.rest.ReconsileRequestLineItemModel;
import com.simplevat.service.ExpenseService;
import com.simplevat.service.InvoiceService;
import com.simplevat.service.TransactionCategoryService;

@Component
public class ReconsilationRestHelper {

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	public List<ReconsilationListModel> getList(ReconsileCategoriesEnumConstant constant) {
		Map<String, Object> attribute = new HashMap<String, Object>();

		attribute.put("deleteFlag", Boolean.FALSE);

		List<ReconsilationListModel> modelList = new ArrayList<>();
		switch (constant) {
		case EXPENSE:
			List<Expense> expenseList = expenseService.findByAttributes(attribute);
			for (Expense expense : expenseList) {
				modelList.add(new ReconsilationListModel(expense.getExpenseId(), expense.getExpenseDate().toString(),
						expense.getPayee(), expense.getExpenseAmount(),
						expense.getCurrency() != null ? expense.getCurrency().getCurrencySymbol() : ""));
			}
			break;

		case SUPPLIER_INVOICE:

			attribute.put("type", 1);
			List<Invoice> invoices = invoiceService.findByAttributes(attribute);
			for (Invoice invoice : invoices) {
				modelList.add(new ReconsilationListModel(invoice.getId(), invoice.getInvoiceDate().toString(),
						invoice.getReferenceNumber(), invoice.getTotalAmount(), invoice.getInvoiceDueDate().toString(),
						invoice.getCurrency() != null ? invoice.getCurrency().getCurrencySymbol() : ""));
			}
			break;

		default:
			break;
		}
		return modelList;
	}

	public Journal get(ChartOfAccountCategoryIdEnumConstant chartOfAccountCategoryIdEnumConstant,
			Integer transactionCategoryCode, BigDecimal amount, int userId, Transaction transaction,
			List<ReconsileRequestLineItemModel> invoiceIdList) {

		Journal journal = null;
		switch (chartOfAccountCategoryIdEnumConstant) {
		default:
			journal = getByTransactionType(transactionCategoryCode, amount, userId, transaction);
			break;

		case SALES:
			journal = invoiceReconsile(invoiceIdList, userId, transactionCategoryCode, transaction.getTransactionId());
			break;
		}
		return journal;

	}

	private Journal getByTransactionType(Integer transactionCategoryCode, BigDecimal amount, int userId,
			Transaction transaction) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();

		TransactionCategory transactionCategory = transactionCategoryService.findByPK(transactionCategoryCode);

		ChartOfAccount transactionType = transactionCategory.getChartOfAccount();

		boolean isdebitFromBank = transactionType.getChartOfAccountId().equals(ChartOfAccountConstant.MONEY_IN)
				|| (transactionType.getParentChartOfAccount() != null
						&& transactionType.getParentChartOfAccount().getChartOfAccountId() != null
						&& transactionType.getParentChartOfAccount().getChartOfAccountId()
								.equals(ChartOfAccountConstant.MONEY_IN)) ? Boolean.TRUE : Boolean.FALSE;

		Journal journal = new Journal();
		JournalLineItem journalLineItem1 = new JournalLineItem();
		journalLineItem1.setTransactionCategory(transaction.getExplainedTransactionCategory());
		if (!isdebitFromBank) {
			journalLineItem1.setDebitAmount(amount);
		} else {
			journalLineItem1.setCreditAmount(amount);
		}
		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
		journalLineItem1.setReferenceId(transaction.getTransactionId());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(transaction.getBankAccount().getTransactionCategory());
		if (isdebitFromBank) {
			journalLineItem2.setDebitAmount(transaction.getTransactionAmount());
		} else {
			journalLineItem2.setCreditAmount(transaction.getTransactionAmount());
		}
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
		journalLineItem2.setReferenceId(transaction.getTransactionId());
		journalLineItem2.setCreatedBy(transaction.getCreatedBy());
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);

		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(transaction.getCreatedBy());
		journal.setPostingReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
		journal.setJournalDate(LocalDateTime.now());
		return journal;
	}

	private Journal invoiceReconsile(List<ReconsileRequestLineItemModel> invoiceIdList, Integer userId,
			Integer transactionId, Integer transactionCategoryCode) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();

		Journal journal = new Journal();
		BigDecimal totalAmount = BigDecimal.ZERO;
		// Considered invoice belongs to single type
		boolean isCustomerInvoice = false;
		for (ReconsileRequestLineItemModel model : invoiceIdList) {

			Invoice invoice = invoiceService.findByPK(model.getInvoiceId());

			isCustomerInvoice = InvoiceTypeConstant.isCustomerInvoice(invoice.getType());

			JournalLineItem journalLineItem1 = new JournalLineItem();
			TransactionCategory transactionCategory = transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(
							isCustomerInvoice ? TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode()
									: TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());
			journalLineItem1.setTransactionCategory(transactionCategory);
			// Reverse flow as invoice creation
			if (!isCustomerInvoice)
				journalLineItem1.setDebitAmount(invoice.getTotalAmount());
			else
				journalLineItem1.setCreditAmount(invoice.getTotalAmount());
			totalAmount = totalAmount.add(invoice.getTotalAmount());
			journalLineItem1.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
			journalLineItem1.setReferenceId(transactionId);
			journalLineItem1.setCreatedBy(userId);
			journalLineItem1.setJournal(journal);
			journalLineItemList.add(journalLineItem1);

		}

		TransactionCategory BankTransactionCategory = transactionCategoryService.findByPK(transactionCategoryCode);
		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(BankTransactionCategory);
		if (isCustomerInvoice)
			journalLineItem2.setDebitAmount(totalAmount);
		else
			journalLineItem2.setCreditAmount(totalAmount);
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journalLineItem2.setReferenceId(transactionId);
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);
		journal.setJournalLineItems(journalLineItemList);

		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journal.setJournalDate(LocalDateTime.now());
		return journal;
	}
}
