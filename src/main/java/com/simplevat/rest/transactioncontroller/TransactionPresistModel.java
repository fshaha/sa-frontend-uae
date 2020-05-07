/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.transactioncontroller;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.simplevat.constant.TransactionExplinationStatusEnum;
import com.simplevat.rest.ReconsileRequestLineItemModel;

import lombok.Data;

/**
 *
 * @author sonu
 */
@Data
public class TransactionPresistModel implements Serializable {

	// TODO : REMOVE AFTER TESTING 4-5-2020

//	private Integer id;
//    private Date transactionDate;
//    private String transactionDescription;
//    private BigDecimal transactionAmount;
//    @NotNull
//    private Integer chartOfAccountId;
//    private Integer transactionCategoryId;
//    @NotNull
//    private Integer bankAccountId;
//    private Integer projectId;
//    private String receiptNumber;
//    private String attachementDescription;
//    private MultipartFile attachment;
//    private String receiptAttachmentPath;
//    private String receiptAttachmentFileName;

	private String DATE_FORMAT = "dd/MM/yyyy";

	private Integer bankId;
	private Integer transactionId;
	private Integer coaCategoryId;;
	private Integer transactionCategoryId;
	private BigDecimal amount;
	private String date;
	private String description;
	private MultipartFile attachmentFile;
	private String reference;

	// EXPENSE
	private Integer vatId;
	private Integer vendorId;
	private Integer customerId;

	// MONEY PAID TO USER
	// MONEY RECEIVED FROM OTHER
	private Integer employeeId;

	// Transafer To
	private Integer reconsileBankId;

	// SALES
	private List<ReconsileRequestLineItemModel> invoiceIdList;

	private TransactionExplinationStatusEnum explinationStatusEnum;

}
