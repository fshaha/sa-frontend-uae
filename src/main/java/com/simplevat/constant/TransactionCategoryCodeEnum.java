/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.constant;

import lombok.Getter;

/**
 *
 * @author uday
 */
public enum TransactionCategoryCodeEnum {
    ACCOUNT_PAYABLE("02-01-001"),
    ACCOUNT_RECEIVABLE("01-01-001"),
    ACCOUNTANCY_FEE("04-01-002"),
    SALE("3106"),
    BANK("04-01-007"),
	EXPENSE("04");
	
    @Getter
    private final String code;

    private TransactionCategoryCodeEnum(String  code) {
        this.code = code;
    }
}
