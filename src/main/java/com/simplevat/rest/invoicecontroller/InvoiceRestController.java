/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.invoicecontroller;

import com.simplevat.bank.model.DeleteModel;
import com.simplevat.constant.FileTypeEnum;
import com.simplevat.constant.dbfilter.InvoiceFilterEnum;
import com.simplevat.entity.Invoice;
import com.simplevat.rest.AbstractDoubleEntryRestController;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.ContactService;
import com.simplevat.service.InvoiceService;
import com.simplevat.utils.FileHelper;
import io.swagger.annotations.ApiOperation;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author ashish
 */
@RestController
@RequestMapping(value = "/rest/invoice")
public class InvoiceRestController extends AbstractDoubleEntryRestController implements Serializable {

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

	@ApiOperation(value = "Get Invoice List")
	@GetMapping(value = "/getList")
	public ResponseEntity getInvoiceList(InvoiceRequestFilterModel filterModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Map<InvoiceFilterEnum, Object> filterDataMap = new HashMap();
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
			filterDataMap.put(InvoiceFilterEnum.ORDER_BY, "DESC");

			PaginationResponseModel responseModel = invoiceService.getInvoiceList(filterDataMap, filterModel);
			if (responseModel == null) {
				return new ResponseEntity(HttpStatus.NOT_FOUND);
			}
			responseModel.setData(invoiceRestHelper.getListModel(responseModel.getData()));
			return new ResponseEntity(responseModel,HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping(value = "/getInvoicesForDropdown")
	public ResponseEntity getInvoicesForDropdown() throws IOException {
		List<DropdownModel> dropdownModels = invoiceService.getInvoicesForDropdown();
		return new ResponseEntity<>(dropdownModels, HttpStatus.OK);
	}

	@ApiOperation(value = "Delete Invoice By ID")
	@DeleteMapping(value = "/delete")
	public ResponseEntity delete(@RequestParam(value = "id") Integer id) {
		Invoice invoice = invoiceService.findByPK(id);
		if (invoice != null) {
			invoice.setDeleteFlag(Boolean.TRUE);
			invoiceService.update(invoice, invoice.getId());
		}
		return new ResponseEntity(HttpStatus.OK);

	}

	@ApiOperation(value = "Delete Invoices in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity delete(@RequestBody DeleteModel ids) {
		try {
			invoiceService.deleteByIds(ids.getIds());
			return new ResponseEntity(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@ApiOperation(value = "Get Invoice By ID")
	@GetMapping(value = "/getInvoiceById")
	public ResponseEntity getInvoiceById(@RequestParam(value = "id") Integer id) {
		Invoice invoice = invoiceService.findByPK(id);
		if (invoice == null) {
			return new ResponseEntity(HttpStatus.NOT_FOUND);
		} else {
			return new ResponseEntity<>(invoiceRestHelper.getRequestModel(invoice), HttpStatus.OK);
		}
	}

	@ApiOperation(value = "Add New Invoice")
	@PostMapping(value = "/save")
	public ResponseEntity save(@ModelAttribute InvoiceRequestModel requestModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Invoice invoice = invoiceRestHelper.getEntity(requestModel, userId);
			invoice.setCreatedBy(userId);
			invoice.setCreatedDate(LocalDateTime.now());
			invoice.setDeleteFlag(Boolean.FALSE);
			if (requestModel.getAttachmentFile() != null && !requestModel.getAttachmentFile().isEmpty()) {
				String fileName = fileHelper.saveFile(requestModel.getAttachmentFile(), FileTypeEnum.SUPPLIER_INVOICE);
				invoice.setReceiptAttachmentFileName(requestModel.getAttachmentFile().getOriginalFilename());
				invoice.setReceiptAttachmentPath(fileName);
			}
			invoiceService.persist(invoice);
			return new ResponseEntity(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@ApiOperation(value = "Update Invoice")
	@PostMapping(value = "/update")
	public ResponseEntity update(@ModelAttribute InvoiceRequestModel requestModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Invoice invoice = invoiceRestHelper.getEntity(requestModel, userId);
			if (requestModel.getAttachmentFile() != null && !requestModel.getAttachmentFile().isEmpty()) {
				String fileName = fileHelper.saveFile(requestModel.getAttachmentFile(), FileTypeEnum.SUPPLIER_INVOICE);
				invoice.setReceiptAttachmentFileName(requestModel.getAttachmentFile().getOriginalFilename());
				invoice.setReceiptAttachmentPath(fileName);
			}
			invoice.setLastUpdateBy(userId);
			invoice.setLastUpdateDate(LocalDateTime.now());
			invoiceService.update(invoice);
			return new ResponseEntity(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}

	}
}
