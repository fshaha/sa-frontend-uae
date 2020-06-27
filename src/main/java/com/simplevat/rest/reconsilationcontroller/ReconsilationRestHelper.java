package com.simplevat.rest.reconsilationcontroller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.simplevat.entity.*;
import com.simplevat.rest.transactioncontroller.TransactionPresistModel;
import com.simplevat.service.VatCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simplevat.constant.ChartOfAccountCategoryIdEnumConstant;
import com.simplevat.constant.ChartOfAccountConstant;
import com.simplevat.constant.PostingReferenceTypeEnum;
import com.simplevat.constant.ReconsileCategoriesEnumConstant;
import com.simplevat.constant.TransactionCategoryCodeEnum;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.service.ExpenseService;
import com.simplevat.service.InvoiceService;
import com.simplevat.service.TransactionCategoryService;
import org.springframework.web.bind.annotation.ModelAttribute;

@Component
public class ReconsilationRestHelper {

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private TransactionCategoryService transactionCategoryService;

	@Autowired
	private VatCategoryService vatCategoryService;

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
			Integer transactionCategoryCode, BigDecimal amount, int userId, Transaction transaction) {

		Journal journal = null;
		switch (chartOfAccountCategoryIdEnumConstant) {
		default:
			journal = getByTransactionType(transactionCategoryCode, amount, userId, transaction);
			break;

		case SALES:
			journal = invoiceReconsile(chartOfAccountCategoryIdEnumConstant, userId, transaction,
					transaction.getBankAccount().getTransactionCategory());
			break;
		case EXPENSE:
			journal = invoiceReconsile(chartOfAccountCategoryIdEnumConstant, userId, transaction,
					transaction.getBankAccount().getTransactionCategory());
			break;
		}
		return journal;

	}

	public Journal getByTransactionType(Integer transactionCategoryCode, BigDecimal amount, int userId,
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

	public Journal getByTransactionType(@ModelAttribute TransactionPresistModel transactionPresistModel,
										Integer transactionCategoryCode, int userId,
										Transaction transaction) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		BigDecimal amount = transactionPresistModel.getAmount();
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

		if (transactionPresistModel.getVatId()!=null) {
			VatCategory vatCategory = vatCategoryService.findByPK(transactionPresistModel.getVatId());
			BigDecimal vatPercent =  vatCategory.getVat();
			BigDecimal vatAmount = calculateActualVatAmount(vatPercent,amount);
			BigDecimal actualDebitAmount = BigDecimal.valueOf(amount.floatValue()-vatAmount.floatValue());
			journalLineItem1.setDebitAmount(actualDebitAmount);
			JournalLineItem journalLineItem = new JournalLineItem();
			TransactionCategory inputVatCategory = transactionCategoryService
					.findTransactionCategoryByTransactionCategoryCode(TransactionCategoryCodeEnum.INPUT_VAT.getCode());
			journalLineItem.setTransactionCategory(inputVatCategory);
			journalLineItem.setDebitAmount(vatAmount);
			journalLineItem.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
			journalLineItem.setReferenceId(transaction.getTransactionId());
			journalLineItem.setCreatedBy(userId);
			journalLineItem.setJournal(journal);
			journalLineItemList.add(journalLineItem);
		}
		journalLineItemList.add(journalLineItem2);
		journal.setJournalLineItems(journalLineItemList);
		journal.setCreatedBy(transaction.getCreatedBy());
		journal.setPostingReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE);
		journal.setJournalDate(LocalDateTime.now());
		return journal;
	}

	private BigDecimal calculateActualVatAmount(BigDecimal vatPercent, BigDecimal expenseAmount) {
		float vatPercentFloat = vatPercent.floatValue()+100;
		float expenseAmountFloat = expenseAmount.floatValue()/vatPercentFloat * 100;
		return BigDecimal.valueOf(expenseAmount.floatValue()-expenseAmountFloat);
	}
	public Journal invoiceReconsile(ChartOfAccountCategoryIdEnumConstant ChartOfAccountCategoryIdEnumConstant,
			Integer userId, Transaction transaction,TransactionCategory bankTransactionCategory ) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();

		Journal journal = new Journal();
		BigDecimal totalAmount = transaction.getTransactionAmount();
		// Considered invoice belongs to single type
		boolean isCustomerInvoice = false;

		isCustomerInvoice = ChartOfAccountCategoryIdEnumConstant.equals(ChartOfAccountCategoryIdEnumConstant.SALES);

		JournalLineItem journalLineItem1 = new JournalLineItem();
		TransactionCategory transactionCategory = transactionCategoryService
				.findTransactionCategoryByTransactionCategoryCode(
						isCustomerInvoice ? TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode()
								: TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());
		journalLineItem1.setTransactionCategory(transactionCategory);
		// Reverse flow as invoice creation
		if (!isCustomerInvoice)
			journalLineItem1.setDebitAmount(transaction.getTransactionAmount());
		else
			journalLineItem1.setCreditAmount(transaction.getTransactionAmount());

		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journalLineItem1.setReferenceId(transaction.getTransactionId());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(bankTransactionCategory);
		if (isCustomerInvoice)
			journalLineItem2.setDebitAmount(totalAmount);
		else
			journalLineItem2.setCreditAmount(totalAmount);
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journalLineItem2.setReferenceId(transaction.getTransactionId());
		journalLineItem2.setCreatedBy(userId);
		journalLineItem2.setJournal(journal);
		journalLineItemList.add(journalLineItem2);
		journal.setJournalLineItems(journalLineItemList);

		journal.setCreatedBy(userId);
		journal.setPostingReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journal.setJournalDate(LocalDateTime.now());
		return journal;
	}
	public Journal invoiceReconsile(Integer userId, Transaction transaction,boolean isCustomerInvoice ) {
		List<JournalLineItem> journalLineItemList = new ArrayList<>();
		Journal journal = new Journal();
		BigDecimal totalAmount = transaction.getTransactionAmount();

		JournalLineItem journalLineItem1 = new JournalLineItem();
		TransactionCategory transactionCategory = transactionCategoryService
				.findTransactionCategoryByTransactionCategoryCode(
						isCustomerInvoice ? TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode()
								: TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode());
		journalLineItem1.setTransactionCategory(transactionCategory);
		// Reverse flow as invoice creation
		if (!isCustomerInvoice)
			journalLineItem1.setDebitAmount(transaction.getTransactionAmount());
		else
			journalLineItem1.setCreditAmount(transaction.getTransactionAmount());

		journalLineItem1.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journalLineItem1.setReferenceId(transaction.getTransactionId());
		journalLineItem1.setCreatedBy(userId);
		journalLineItem1.setJournal(journal);
		journalLineItemList.add(journalLineItem1);

		JournalLineItem journalLineItem2 = new JournalLineItem();
		journalLineItem2.setTransactionCategory(transaction.getBankAccount().getTransactionCategory());
		if (isCustomerInvoice)
			journalLineItem2.setDebitAmount(totalAmount);
		else
			journalLineItem2.setCreditAmount(totalAmount);
		journalLineItem2.setReferenceType(PostingReferenceTypeEnum.TRANSACTION_RECONSILE_INVOICE);
		journalLineItem2.setReferenceId(transaction.getTransactionId());
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
