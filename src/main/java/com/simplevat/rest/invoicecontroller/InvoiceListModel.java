package com.simplevat.rest.invoicecontroller;

import java.math.BigDecimal;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceListModel {

	private Integer id;
	private String status;
	private String name;
	private String referenceNumber;
	private String invoiceDate;
	private String invoiceDueDate;
	private BigDecimal totalAmount;
	private BigDecimal totalVatAmount;
	private String statusEnum;
	private Integer contactId;
	private BigDecimal dueAmount;
	private String currencyName;
	private String currencySymbol;
}
