/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.constant.dbfilter;

import lombok.Getter;

/**
 *
 * @author ashish
 */
public enum SupplierInvoiceFilterEnum {
//    CUSTOMER_NAME("customerName"," like CONCAT(:customerName,'%')"),
    INVOICE_NUMBER("referenceNumber", " like CONCAT(:referenceNumber,'%')"),
    INVOICE_DATE("invoiceDate", " = :invoiceDate "),
    INVOICE_DUE_DATE("invoiceDueDate", " = :invoiceDueDate "),
    INVOICE_AMOUNT("totalAmount", " = :totalAmount "),
    STATUS("status", " = :status "),
    USER_ID("createdBy", " = :createdBy "),
    DELETE_FLAG("deleteFlag", " = :deleteFlag ");

    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private SupplierInvoiceFilterEnum(String dbColumnName) {
        this.dbColumnName = dbColumnName;
    }

    private SupplierInvoiceFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }
}
