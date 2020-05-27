package com.simplevat.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.simplevat.entity.converter.DateConverter;

import lombok.Data;

/**
 * @author S@urabh : Middle table between Supplier invoice and Payment to
 *         provide Many to Many mapping
 */

@NamedQueries({
		@NamedQuery(name = "findForSupplierInvoice", query = "SELECT s FROM SupplierInvoicePayment  s where  s.supplierInvoice.id = :id and  s.deleteFlag=false ORDER BY s.id DESC"),
		@NamedQuery(name = "findForPayment", query = "SELECT s FROM SupplierInvoicePayment  s where  s.payment.paymentId = :id and  s.deleteFlag=false ORDER BY s.id DESC") })
@Entity
@Table(name = "SUPPLIER_INVOICE_PAYMENT")
@Data
public class SupplierInvoicePayment {

	@Id
	@Column(name = "ID")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne
	@JoinColumn(name = "SUPPLIER_INVOICE_ID")
	private Invoice supplierInvoice;

	@ManyToOne
	@JoinColumn(name = "PAYMENT_ID")
	private Payment payment;

	@Basic(optional = false)
	@Column(name = "PAID_AMOUNT")
	private BigDecimal paidAmount;

	@Basic(optional = false)
	@Column(name = "DUE_AMOUNT")
	private BigDecimal dueAmount;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "0")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@CreationTimestamp
	@Convert(converter = DateConverter.class)
	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")
	@UpdateTimestamp
	@Convert(converter = DateConverter.class)
	private LocalDateTime lastUpdateDate;

}
