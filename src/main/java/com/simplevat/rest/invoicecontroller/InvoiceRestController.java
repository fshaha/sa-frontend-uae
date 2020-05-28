package com.simplevat.rest.invoicecontroller;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.simplevat.rest.DropdownModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.simplevat.bank.model.DeleteModel;
import com.simplevat.constant.ContactTypeEnum;
import com.simplevat.constant.FileTypeEnum;
import com.simplevat.constant.InvoiceStatusEnum;
import com.simplevat.constant.dbfilter.InvoiceFilterEnum;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.Journal;
import com.simplevat.model.OverDueAmountDetailsModel;
import com.simplevat.rest.AbstractDoubleEntryRestController;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.PostingRequestModel;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.ContactService;
import com.simplevat.service.InvoiceService;
import com.simplevat.utils.ChartUtil;
import com.simplevat.utils.FileHelper;

import io.swagger.annotations.ApiOperation;

import static com.simplevat.constant.ErrorConstant.ERROR;

/**
 *
 * @author ashish
 */
@RestController
@RequestMapping(value = "/rest/invoice")
public class InvoiceRestController extends AbstractDoubleEntryRestController {
	private final Logger logger = LoggerFactory.getLogger(InvoiceRestController.class);
	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private InvoiceRestHelper invoiceRestHelper;

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private ContactService contactService;

	@Autowired
	private FileHelper fileHelper;

	@Autowired
	private ChartUtil chartUtil;


	@ApiOperation(value = "Get Invoice List")
	@GetMapping(value = "/getList")
	public ResponseEntity<PaginationResponseModel> getInvoiceList(InvoiceRequestFilterModel filterModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Map<InvoiceFilterEnum, Object> filterDataMap = new EnumMap<>(InvoiceFilterEnum.class);
			if (filterModel.getContact() != null) {
				filterDataMap.put(InvoiceFilterEnum.CONTACT, contactService.findByPK(filterModel.getContact()));
			}
			filterDataMap.put(InvoiceFilterEnum.INVOICE_NUMBER, filterModel.getReferenceNumber());
			if (filterModel.getAmount() != null) {
				filterDataMap.put(InvoiceFilterEnum.INVOICE_AMOUNT, filterModel.getAmount());
			}
			if (filterModel.getInvoiceDate() != null && !filterModel.getInvoiceDate().isEmpty()) {
				SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
				LocalDateTime dateTime = Instant.ofEpochMilli(dateFormat.parse(filterModel.getInvoiceDate()).getTime())
						.atZone(ZoneId.systemDefault()).toLocalDateTime();
				filterDataMap.put(InvoiceFilterEnum.INVOICE_DATE, dateTime);
			}
			if (filterModel.getInvoiceDueDate() != null && !filterModel.getInvoiceDueDate().isEmpty()) {
				SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
				LocalDateTime dateTime = Instant
						.ofEpochMilli(dateFormat.parse(filterModel.getInvoiceDueDate()).getTime())
						.atZone(ZoneId.systemDefault()).toLocalDateTime();
				filterDataMap.put(InvoiceFilterEnum.INVOICE_DUE_DATE, dateTime);
			}
			filterDataMap.put(InvoiceFilterEnum.STATUS, filterModel.getStatus());
			filterDataMap.put(InvoiceFilterEnum.USER_ID, userId);
			filterDataMap.put(InvoiceFilterEnum.DELETE_FLAG, false);
			filterDataMap.put(InvoiceFilterEnum.TYPE, filterModel.getType());

			PaginationResponseModel responseModel = invoiceService.getInvoiceList(filterDataMap, filterModel);
			if (responseModel == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			responseModel.setData(invoiceRestHelper.getListModel(responseModel.getData()));
			return new ResponseEntity<>(responseModel, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping(value = "/getInvoicesForDropdown")
	public ResponseEntity< List<DropdownModel>> getInvoicesForDropdown() {
		return new ResponseEntity<>(invoiceService.getInvoicesForDropdown(), HttpStatus.OK);
	}

	@ApiOperation(value = "Delete Invoice By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity<String> delete(@RequestParam(value = "id") Integer id) {
		Invoice invoice = invoiceService.findByPK(id);
		if (invoice != null) {
			List<Integer> receiptList = new ArrayList<>();
			receiptList.add(id);
			invoiceService.deleteByIds(receiptList);
			invoiceService.deleteJournaForInvoice(invoice);
		}
		return new ResponseEntity<>("Deleted Successfully",HttpStatus.OK);

	}

	@ApiOperation(value = "Delete Invoices in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity<String> delete(@RequestBody DeleteModel ids) {
		try {
			invoiceService.deleteByIds(ids.getIds());
			return new ResponseEntity<>("Deleted Successfully",HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@ApiOperation(value = "Get Invoice By ID")
	@GetMapping(value = "/getInvoiceById")
	public ResponseEntity<InvoiceRequestModel> getInvoiceById(@RequestParam(value = "id") Integer id) {
		Invoice invoice = invoiceService.findByPK(id);
		if (invoice == null) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		} else {
			return new ResponseEntity<>(invoiceRestHelper.getRequestModel(invoice), HttpStatus.OK);
		}
	}

	@ApiOperation(value = "Add New Invoice")
	@PostMapping(value = "/save")
	public ResponseEntity<String> save(@ModelAttribute InvoiceRequestModel requestModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Invoice invoice = invoiceRestHelper.getEntity(requestModel, userId);
			invoice.setCreatedBy(userId);
			invoice.setCreatedDate(LocalDateTime.now());
			invoice.setDeleteFlag(Boolean.FALSE);
			if (requestModel.getAttachmentFile() != null && !requestModel.getAttachmentFile().isEmpty()) {
				String fileName = fileHelper.saveFile(requestModel.getAttachmentFile(),
						requestModel.getType().equals(ContactTypeEnum.SUPPLIER.getValue().toString())
								? FileTypeEnum.SUPPLIER_INVOICE
								: FileTypeEnum.CUSTOMER_INVOICE);
				invoice.setReceiptAttachmentFileName(requestModel.getAttachmentFile().getOriginalFilename());
				invoice.setReceiptAttachmentPath(fileName);
			}
			invoiceService.persist(invoice);
			return new ResponseEntity<>("Saved Successfully",HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@ApiOperation(value = "Update Invoice")
	@PostMapping(value = "/update")
	public ResponseEntity<String> update(@ModelAttribute InvoiceRequestModel requestModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Invoice invoice = invoiceRestHelper.getEntity(requestModel, userId);
			if (requestModel.getAttachmentFile() != null && !requestModel.getAttachmentFile().isEmpty()) {
				String fileName = fileHelper.saveFile(requestModel.getAttachmentFile(),
						requestModel.getType().equals(ContactTypeEnum.SUPPLIER.getValue().toString())
								? FileTypeEnum.SUPPLIER_INVOICE
								: FileTypeEnum.CUSTOMER_INVOICE);
				invoice.setReceiptAttachmentFileName(requestModel.getAttachmentFile().getOriginalFilename());
				invoice.setReceiptAttachmentPath(fileName);
			}
			invoice.setLastUpdateBy(userId);
			invoice.setLastUpdateDate(LocalDateTime.now());

			invoiceService.update(invoice, invoice.getId());
			invoiceService.deleteJournaForInvoice(invoice);
			if (invoice.getStatus() == InvoiceStatusEnum.POST.getValue()) {
				// persist updated journal
				Journal journal = invoiceRestHelper.invoicePosting(new PostingRequestModel(invoice.getId()), userId);
				journalService.persist(journal);
			}
			return new ResponseEntity<>("Updated Successfully",HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@ApiOperation(value = "Next invoice No")
	@GetMapping(value = "/getNextInvoiceNo")
	public ResponseEntity<Integer> getNextInvoiceNo() {
		try {
			Integer nxtInvoiceNo = invoiceService.getLastInvoiceNo();
			if (nxtInvoiceNo == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(nxtInvoiceNo, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@ApiOperation(value = "Get chart data")
	@GetMapping(value = "/getChartData")
	public ResponseEntity<Object> getChartData(@RequestParam int monthCount) {
		try {
			List<Invoice> invList = invoiceService.getInvoiceList(monthCount);
			if (invList == null) {
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
			return new ResponseEntity<>(chartUtil.getinvoiceData(invList, monthCount), HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @Deprecated
	 * @param id
	 * @param request
	 * @return
	 */
	@ApiOperation(value = "Send Invoice")
	@PostMapping(value = "/send")
	public ResponseEntity<String> update(@RequestParam("id") Integer id, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			invoiceRestHelper.send(invoiceService.findByPK(id), userId);
			return new ResponseEntity<>("Sent Successfully",HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * This method web service will retriever the OverDueAmountDetails To Be Paid
	 * for the the specific user
	 * 
	 * @param request HTTP servelet request
	 * @return Response entity
	 */
	@ApiOperation(value = "Get Overdue Amount Details")
	@GetMapping(value = "/getOverDueAmountDetails")
	public ResponseEntity<OverDueAmountDetailsModel> getOverDueAmountDetails(HttpServletRequest request) {
		try {
			Integer type = Integer.parseInt(request.getParameter("type"));
			OverDueAmountDetailsModel overDueAmountDetails = invoiceService.getOverDueAmountDetails(type);
			return new ResponseEntity<>(overDueAmountDetails, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}