package com.simplevat.rest;

import javax.servlet.http.HttpServletRequest;

import com.simplevat.constant.PostingReferenceTypeEnum;
import com.simplevat.constant.InvoiceStatusEnum;
import com.simplevat.constant.ExpenseStatusEnum;
import com.simplevat.entity.*;
import com.simplevat.helper.ExpenseRestHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.simplevat.rest.invoicecontroller.InvoiceRestHelper;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.ExpenseService;
import com.simplevat.service.InvoiceService;
import com.simplevat.service.JournalService;
import com.simplevat.service.TransactionCategoryService;
import io.swagger.annotations.ApiOperation;

import java.lang.reflect.Array;
import java.util.Arrays;


/**
 *
 * @author uday
 */
public abstract class AbstractDoubleEntryRestController {

	@Autowired
	TransactionCategoryService abstractDoubleEntryTransactionCategoryService;

	@Autowired
	protected JournalService journalService;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private ExpenseService expenseService;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private InvoiceRestHelper invoiceRestHelper;

	@Autowired
	private ExpenseRestHelper expenseRestHelper;

	@ApiOperation(value = "Post Journal Entry")
	@PostMapping(value = "/posting")
	public ResponseEntity<String> posting(@RequestBody PostingRequestModel postingRequestModel, HttpServletRequest request) {

		Journal journal = null;

		Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);

		if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.INVOICE.name())) {
			journal = invoiceRestHelper.invoicePosting(postingRequestModel, userId);
		} else if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.EXPENSE.name())) {
			journal = expenseRestHelper.expensePosting(postingRequestModel, userId);
		}

		if (journal != null) {
			journalService.persist(journal);
		}

		if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.INVOICE.name())) {
			Invoice invoice = invoiceService.findByPK(postingRequestModel.getPostingRefId());
			invoice.setStatus(InvoiceStatusEnum.POST.getValue());
			invoiceRestHelper.send(invoice,userId);
			invoiceService.persist(invoice);
		} else if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.EXPENSE.name())) {
			Expense expense = expenseService.findByPK(postingRequestModel.getPostingRefId());
			expense.setStatus(ExpenseStatusEnum.POSTED.getValue());
			expenseService.persist(expense);
		}

	 return new ResponseEntity<>("Journal Entries created Successfully", HttpStatus.OK);
}

	@ApiOperation(value = "UndoPost Journal Entry")
	@PostMapping(value = "/undoPosting")
	public ResponseEntity<String> undoPosting(@RequestBody PostingRequestModel postingRequestModel, HttpServletRequest request) {

		Journal journal = journalService.getJournalByReferenceId(postingRequestModel.getPostingRefId());
		if (journal != null) {
			journalService.deleteByIds(Arrays.asList(journal.getId()));
		}

		if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.INVOICE.name())) {
			Invoice invoice = invoiceService.findByPK(postingRequestModel.getPostingRefId());
			invoice.setStatus(InvoiceStatusEnum.PENDING.getValue());
			if(postingRequestModel.getComment()!=null) {
			String notes = invoice.getNotes();
			if(notes!=null && !notes.isEmpty())
			{
				notes=notes+"\n"+postingRequestModel.getComment();
			}
			else
				notes = postingRequestModel.getComment();
				invoice.setNotes(notes);
			}
			invoiceService.update(invoice);
		} else if (postingRequestModel.getPostingRefType().equalsIgnoreCase(PostingReferenceTypeEnum.EXPENSE.name())) {
			Expense expense = expenseService.findByPK(postingRequestModel.getPostingRefId());
			expense.setStatus(ExpenseStatusEnum.DRAFT.getValue());
			expenseService.update(expense);
		}
		return new ResponseEntity<>("Journal Entries created Successfully", HttpStatus.OK);
	}
}
