package com.simplevat.web.bankaccount.controller;

import java.util.ArrayList;
import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import com.simplevat.web.bankaccount.model.TransactionModel;
import com.simplevat.criteria.bankaccount.TransactionCriteria;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.service.bankaccount.TransactionService;
import com.simplevat.web.bankaccount.model.BankAccountModel;
import com.simplevat.web.utils.FacesUtil;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.PostConstruct;
import javax.faces.context.FacesContext;
import lombok.Getter;
import org.springframework.context.annotation.Scope;
import org.springframework.web.context.annotation.SessionScope;

@Controller
@Scope("view")
public class TransactionListController extends TransactionControllerHelper {

    @Autowired
    private TransactionService transactionService;

    private List<TransactionModel> transactions;
    
    @Getter
    private BankAccountModel selectedBankAccountModel;

    @PostConstruct
    public void init(){
        try {
            selectedBankAccountModel = FacesUtil.getSelectedBankAccount();
            BankAccountHelper bankAccountHelper = new BankAccountHelper();
            TransactionCriteria transactionCriteria = new TransactionCriteria();
            transactionCriteria.setActive(Boolean.TRUE);
            transactionCriteria.setBankAccount(bankAccountHelper.getBankAccount(selectedBankAccountModel));
            List<Transaction> transactionList = transactionService.getTransactionsByCriteria(transactionCriteria);
            
            transactions = new ArrayList<TransactionModel>();
            
            for (Transaction transaction : transactionList) {
                TransactionModel model = this.getTransactionModel(transaction);
                transactions.add(model);
            }
        } catch (Exception ex) {
            Logger.getLogger(TransactionListController.class.getName()).log(Level.SEVERE, null, ex);
        }

    }
    
    public List<TransactionModel> getTransactions() throws Exception {
        return transactions;
    }

    public void setTransactions(List<TransactionModel> transactions) {
        this.transactions = transactions;
    }
}
