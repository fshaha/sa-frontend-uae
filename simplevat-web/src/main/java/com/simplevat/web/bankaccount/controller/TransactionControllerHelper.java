package com.simplevat.web.bankaccount.controller;

import com.simplevat.entity.bankaccount.BankAccount;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import javax.activation.MimetypesFileTypeMap;

import org.apache.commons.io.FilenameUtils;
import org.primefaces.model.DefaultStreamedContent;
import org.primefaces.model.UploadedFile;

import com.simplevat.web.constant.BankAccountConstant;
import com.simplevat.web.bankaccount.model.TransactionModel;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.web.bankaccount.model.BankAccountModel;

public class TransactionControllerHelper {

    public Transaction getTransaction(TransactionModel model) {
        System.out.println("model :"+model);
        Transaction transaction = new Transaction();
        transaction.setTransactionId(model.getTransactionId());

        if (model.getTransactionDate() != null) {
            LocalDateTime transactionDate = Instant.ofEpochMilli(model.getTransactionDate().getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime();
            transaction.setTransactionDate(transactionDate);
        }

        transaction.setTransactionDescription(model.getTransactionDescription());
        transaction.setTransactionAmount(model.getTransactionAmount());
        transaction.setTransactionType(model.getTransactionType());
        transaction.setReceiptNumber(model.getReceiptNumber());
        transaction.setDebitCreditFlag(model.getDebitCreditFlag());
        transaction.setProject(model.getProject());
        transaction.setExplainedTransactionCategory(model.getExplainedTransactionCategory());
        transaction.setExplainedTransactionDescription(model.getExplainedTransactionDescription());
        transaction.setExplainedTransactionAttachementDescription(model.getExplainedTransactionAttachementDescription());
        transaction.setExplainedTransactionAttachementPath(model.getExplainedTransactionAttachementPath());
        transaction.setBankAccount(model.getBankAccount());
        transaction.setTransactionStatus(model.getTransactionStatus());
        transaction.setCurrentBalance(model.getCurrentBalance());
        transaction.setCreatedBy(model.getCreatedBy());
        transaction.setLastUpdatedBy(model.getLastUpdatedBy());
        transaction.setLastUpdateDate(model.getLastUpdateDate());
        transaction.setDeleteFlag(model.getDeleteFlag());
        transaction.setVersionNumber(model.getVersionNumber());
        return transaction;
    }

    public TransactionModel getTransactionModel(Transaction entity) {
        TransactionModel transactionModel = new TransactionModel();
        transactionModel.setTransactionId(entity.getTransactionId());

        if (entity.getTransactionDate() != null) {
            Date transactionDate = Date.from(entity.getTransactionDate().atZone(ZoneId.systemDefault()).toInstant());
            transactionModel.setTransactionDate(transactionDate);
        }

        transactionModel.setTransactionDescription(entity.getTransactionDescription());
        transactionModel.setTransactionAmount(entity.getTransactionAmount());
        transactionModel.setTransactionType(entity.getTransactionType());
        transactionModel.setReceiptNumber(entity.getReceiptNumber());
        transactionModel.setDebitCreditFlag(entity.getDebitCreditFlag());
        transactionModel.setProject(entity.getProject());
        transactionModel.setExplainedTransactionCategory(entity.getExplainedTransactionCategory());
        transactionModel.setExplainedTransactionDescription(entity.getExplainedTransactionDescription());
        transactionModel.setExplainedTransactionAttachementDescription(entity.getExplainedTransactionAttachementDescription());
        transactionModel.setExplainedTransactionAttachementPath(entity.getExplainedTransactionAttachementPath());
        transactionModel.setTransactionStatus(entity.getTransactionStatus());
        transactionModel.setBankAccount(entity.getBankAccount());
        transactionModel.setCurrentBalance(entity.getCurrentBalance());
        transactionModel.setCreatedBy(entity.getCreatedBy());
        transactionModel.setLastUpdatedBy(entity.getLastUpdatedBy());
        transactionModel.setLastUpdateDate(entity.getLastUpdateDate());
        transactionModel.setDeleteFlag(entity.getDeleteFlag());
        transactionModel.setVersionNumber(entity.getVersionNumber());

        String attachmentPath = entity.getExplainedTransactionAttachementPath();
        if (attachmentPath != null && !attachmentPath.isEmpty()) {
            String tomcatHome = System.getProperty("catalina.base");
            File transactionReceiptFile = new File(tomcatHome.concat(attachmentPath));
            try {
                InputStream inputStream = new FileInputStream(transactionReceiptFile);
                transactionModel.setAttachmentFileContent(new DefaultStreamedContent(inputStream, new MimetypesFileTypeMap().getContentType(transactionReceiptFile), transactionReceiptFile.getName()));
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
        }

        return transactionModel;
    }

    public BankAccount getBankAccount(BankAccountModel model) {
        BankAccount bankAccount = new BankAccount();
        bankAccount.setBankAccountId(model.getBankAccountId());
        bankAccount.setAccountNumber(model.getAccountNumber());
        bankAccount.setBankAccountCurrency(model.getBankAccountCurrency());
        bankAccount.setBankAccountName(model.getBankAccountName());
        bankAccount.setBankAccountStatus(model.getBankAccountStatus());
        bankAccount.setBankCountry(model.getBankCountry());
        bankAccount.setBankFeedStatusCode(model.getBankFeedStatusCode());
        bankAccount.setBankName(model.getBankName());
        bankAccount.setCreatedBy(model.getCreatedBy());
        bankAccount.setCreatedDate(model.getCreatedDate());
        bankAccount.setCurrentBalance(model.getCurrentBalance());
        bankAccount.setDeleteFlag(model.getDeleteFlag());
        bankAccount.setIbanNumber(model.getIbanNumber());
        bankAccount.setIsprimaryAccountFlag(model.getIsprimaryAccountFlag());
        bankAccount.setLastUpdateDate(model.getLastUpdateDate());
        bankAccount.setLastUpdatedBy(model.getLastUpdatedBy());
        bankAccount.setOpeningBalance(model.getOpeningBalance());
        bankAccount.setPersonalCorporateAccountInd(model.getPersonalCorporateAccountInd());
        bankAccount.setSwiftCode(model.getSwiftCode());
        bankAccount.setVersionNumber(model.getVersionNumber());
        return bankAccount;
    }

    public void storeUploadedFile(TransactionModel model, Transaction transaction, String fileLocation) {
        String tomcatHome = System.getProperty("catalina.base");

        String fileUploadAbsolutePath = tomcatHome.concat(fileLocation);
        File filePath = new File(fileUploadAbsolutePath);
        if (!filePath.exists()) {
            filePath.mkdir();
        }
        Path dataFolder = Paths.get(fileUploadAbsolutePath);

        UploadedFile uploadedFile = model.getAttachmentFile();

        String filename = FilenameUtils.getBaseName(uploadedFile.getFileName());
        String extension = FilenameUtils.getExtension(uploadedFile.getFileName());

        try {

            Path file = Files.createTempFile(dataFolder, BankAccountConstant.TRANSACTION + "_" + filename, "_" + System.currentTimeMillis() + "." + extension);
            InputStream in = uploadedFile.getInputstream();
            Files.copy(in, file, StandardCopyOption.REPLACE_EXISTING);

            transaction.setExplainedTransactionAttachementPath(fileLocation + "/" + file.getFileName());

        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

}
