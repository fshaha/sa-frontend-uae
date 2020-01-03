/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.transactionimportcontroller;

import com.simplevat.utils.DateFormatUtil;

import io.swagger.annotations.ApiOperation;

import com.simplevat.contact.model.Transaction;
import com.simplevat.contact.model.FileModel;
import com.simplevat.constant.TransactionCreditDebitConstant;
import com.simplevat.constant.TransactionEntryTypeConstant;
import com.simplevat.constant.TransactionStatusConstant;
import com.simplevat.entity.User;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.service.UserService;
import com.simplevat.service.BankAccountService;
import com.simplevat.service.bankaccount.TransactionService;
import com.simplevat.service.bankaccount.TransactionStatusService;
import com.simplevat.service.bankaccount.TransactionTypeService;
import java.io.File;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Sonu
 */
@RestController
@RequestMapping(value = "/rest/transactionimport")
public class TransactionImportController implements Serializable {

    @Autowired
    private BankAccountService bankAccountService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionTypeService transactionTypeService;

    @Autowired
    private TransactionStatusService transactionStatusService;

    @Autowired
    private UserService userServiceNew;



    @ApiOperation(value = "Get Bank Account List")
    @GetMapping(value = "/getbankaccountlist")
    public ResponseEntity<List<BankAccount>> getBankAccount() {
        List<BankAccount> bankAccounts = bankAccountService.getBankAccounts();
        if (bankAccounts != null) {
            return new ResponseEntity<>(bankAccounts, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @ApiOperation(value = "Download csv of Tranaction")
    @GetMapping(value = "/downloadcsv")
    public ResponseEntity<FileModel> downloadSimpleFile() {
        ClassLoader classLoader = getClass().getClassLoader();
        File file = new File(classLoader.getResource("excel-file/SampleTransaction.csv").getFile());
        FileModel fileModel = new FileModel();
        if (file.exists()) {
            String filepath = file.getAbsolutePath();
            fileModel.setFilePath(filepath);
            fileModel.setName("fileName");
            return new ResponseEntity<>(fileModel, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }

    @ApiOperation(value = "Get List of Date format")
    @GetMapping(value = "/getformatdate")
    public ResponseEntity<List<String>> getDateFormatList() {
        List<String> dateFormatList = DateFormatUtil.dateFormatList();
        if (dateFormatList != null) {
            return new ResponseEntity<>(dateFormatList, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
  
@ApiOperation(value = "Save Import Transaction")
    @PostMapping(value = "/saveimporttransaction")
    public ResponseEntity<Integer> saveTransactions(@RequestBody List<Transaction> transactionList, @RequestParam(value = "id") Integer id, @RequestParam(value = "bankId") Integer bankId) {
        for (Transaction transaction : transactionList) {
            save(transaction, id, bankId);
        }
        return new ResponseEntity<>(bankId, HttpStatus.OK);
    }

     void save(Transaction transaction, Integer id, Integer bankId) {
        System.out.println("transaction===" + transaction);
        try {
            User loggedInUser = userServiceNew.findByPK(id);
            com.simplevat.entity.bankaccount.Transaction transaction1 = new com.simplevat.entity.bankaccount.Transaction();
            transaction1.setLastUpdateBy(loggedInUser.getUserId());
            transaction1.setCreatedBy(loggedInUser.getUserId());
            BankAccount bankAccount = bankAccountService.findByPK(bankId);
            transaction1.setBankAccount(bankAccount);
            transaction1.setEntryType(TransactionEntryTypeConstant.IMPORT);
            transaction1.setTransactionDescription(transaction.getDescription());
            LocalDate date = LocalDate.parse(transaction.getTransactionDate(), DateTimeFormatter.ofPattern("M/d/yyyy"));
            LocalTime time = LocalTime.now();
            transaction1.setTransactionDate(LocalDateTime.of(date, time));
            if (transaction.getDrAmount() != null && !transaction.getDrAmount().trim().isEmpty()) {
                transaction1.setTransactionAmount(BigDecimal.valueOf(Double.parseDouble(transaction.getDrAmount().replaceAll(",", ""))));
                transaction1.setDebitCreditFlag(TransactionCreditDebitConstant.DEBIT);
            }
            if (transaction.getCrAmount() != null && !transaction.getCrAmount().trim().isEmpty()) {
                transaction1.setTransactionAmount(BigDecimal.valueOf(Double.parseDouble(transaction.getCrAmount().replaceAll(",", ""))));
                transaction1.setDebitCreditFlag(TransactionCreditDebitConstant.CREDIT);
            }
            transaction1.setTransactionStatus(transactionStatusService.findByPK(TransactionStatusConstant.UNEXPLAINED));
            transactionService.persist(transaction1);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
