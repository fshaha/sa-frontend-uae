package com.simplevat.dao.impl.bankaccount;

import com.simplevat.constants.TransactionStatusConstant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.Query;
import javax.persistence.TemporalType;

import org.springframework.stereotype.Repository;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.bankaccount.TransactionDao;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.entity.bankaccount.TransactionType;
import com.simplevat.entity.bankaccount.TransactionView;
import java.time.Instant;
import java.time.ZoneId;
import javax.persistence.TypedQuery;

@Repository
public class TransactionDaoImpl extends AbstractDao<Integer, Transaction> implements TransactionDao {

    @Override
    public Transaction updateOrCreateTransaction(Transaction transaction) {
        return this.update(transaction);
    }

    @Override
    public List<Object[]> getCashInData(Date startDate, Date endDate) {
        List<Object[]> cashInData = new ArrayList<>(0);
        try {
            String queryString = "select "
                    + "sum(transactionAmount) as total, CONCAT(MONTH(transactionDate),'-' , Year(transactionDate)) as month "
                    + "from Transaction "
                    + "where debitCreditFlag = 'c' and transactionDate BETWEEN :startDate AND :endDate "
                    + "group by CONCAT(MONTH(transactionDate),'-' , Year(transactionDate))";

            Query query = getEntityManager().createQuery(queryString)
                    .setParameter("startDate", startDate, TemporalType.DATE)
                    .setParameter("endDate", endDate, TemporalType.DATE);
            cashInData = query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return cashInData;
    }

    @Override
    public List<Object[]> getCashOutData(Date startDate, Date endDate) {
        List<Object[]> cashOutData = new ArrayList<>(0);
        try {
            String queryString = "select "
                    + "sum(transactionAmount) as total, CONCAT(MONTH(transactionDate),'-' , Year(transactionDate)) as month "
                    + "from Transaction "
                    + "where debitCreditFlag = 'd' and transactionDate BETWEEN :startDate AND :endDate "
                    + "group by CONCAT(MONTH(transactionDate),'-' , Year(transactionDate))";
            Query query = getEntityManager().createQuery(queryString)
                    .setParameter("startDate", startDate, TemporalType.DATE)
                    .setParameter("endDate", endDate, TemporalType.DATE);
            cashOutData = query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return cashOutData;
    }

    @Override
    public Transaction getBeforeTransaction(Transaction transaction) {
        TypedQuery<Transaction> query = getEntityManager().createQuery("SELECT t FROM Transaction t WHERE t.transactionDate <= :transactionDate and t.transactionId < :transactionId and t.deleteFlag = false and t.bankAccount.bankAccountId = :bankAccountId ORDER BY t.transactionDate DESC", Transaction.class);
        query.setParameter("transactionDate", transaction.getTransactionDate());
        query.setParameter("bankAccountId", transaction.getBankAccount().getBankAccountId());
        query.setParameter("transactionId", transaction.getTransactionId());
        List<Transaction> transactionList = query.getResultList();
        if (transactionList != null && !transactionList.isEmpty()) {
            return transactionList.get(transactionList.size() - 1);
        }
        return null;
    }

    @Override
    public List<Transaction> getAfterTransaction(Transaction transaction) {
        TypedQuery<Transaction> query = getEntityManager().createQuery("SELECT t FROM Transaction t WHERE t.transactionDate > :transactionDate and t.deleteFlag = false and t.bankAccount.bankAccountId = :bankAccountId ORDER BY t.transactionDate ASC", Transaction.class);
        query.setParameter("transactionDate", transaction.getTransactionDate());
        query.setParameter("bankAccountId", transaction.getBankAccount().getBankAccountId());
        query.setParameter("transactionId", transaction.getTransactionId());
        List<Transaction> transactionList = query.getResultList();
        if (transactionList != null && !transactionList.isEmpty()) {
            return transactionList;
        }
        return null;
    }

    @Override
    public List<Transaction> getTransactionsByDateRangeAndTranscationTypeAndTranscationCategory(TransactionType transactionType, TransactionCategory category, Date startDate, Date lastDate) {

        StringBuilder builder = new StringBuilder();
        if (transactionType != null) {
            builder.append("and t.transactionType.transactionTypeCode =:transactionTypeCode ");
        }
        if (category != null) {
            builder.append("and t.explainedTransactionCategory.transactionCategoryId =:transactionCategoryId ");
        }
        if (startDate != null && lastDate != null) {
            builder.append("and t.transactionDate BETWEEN :startDate AND :lastDate ");
        }
        TypedQuery<Transaction> query = getEntityManager().createQuery("SELECT t FROM Transaction t WHERE t.deleteFlag = false " + builder.toString() + "ORDER BY t.transactionDate ASC", Transaction.class);
        if (transactionType != null) {
            query.setParameter("transactionTypeCode", transactionType.getTransactionTypeCode());
        }
        if (category != null) {
            query.setParameter("transactionCategoryId", category.getTransactionCategoryId());
        }
        if (startDate != null && lastDate != null) {
            query.setParameter("startDate", Instant.ofEpochMilli(startDate.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime());
            query.setParameter("lastDate", Instant.ofEpochMilli(lastDate.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime());
        }

        List<Transaction> transactionList = query.getResultList();
        if (transactionList != null && !transactionList.isEmpty()) {
            return transactionList;
        }
        return null;
    }

    @Override
    public List<Transaction> getTransactionsByDateRangeAndBankAccountId(BankAccount bankAccount, Date startDate, Date lastDate) {
        TypedQuery<Transaction> query = getEntityManager().createQuery("SELECT t FROM Transaction t WHERE t.deleteFlag = false and t.bankAccount.bankAccountId = :bankAccountId and t.transactionDate BETWEEN :startDate AND :lastDate ORDER BY t.transactionDate ASC", Transaction.class);
        query.setParameter("bankAccountId", bankAccount.getBankAccountId());
        query.setParameter("startDate", Instant.ofEpochMilli(startDate.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime());
        query.setParameter("lastDate", Instant.ofEpochMilli(lastDate.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime());
        List<Transaction> transactionList = query.getResultList();
        if (transactionList != null && !transactionList.isEmpty()) {
            return transactionList;
        }
        return null;
    }

    @Override
    public List<Transaction> getChildTransactionListByParentId(int parentId) {
        TypedQuery<Transaction> query = getEntityManager().createQuery("SELECT t FROM Transaction t WHERE t.deleteFlag = false and t.parentTransaction.transactionId =:parentId ORDER BY t.transactionDate ASC", Transaction.class);
        query.setParameter("parentId", parentId);
        List<Transaction> transactionList = query.getResultList();
        if (transactionList != null && !transactionList.isEmpty()) {
            return transactionList;
        }
        return null;
    }

    @Override
    public List<Transaction> getAllParentTransactions(BankAccount bankAccount) {
        TypedQuery<Transaction> query = getEntityManager().createQuery("SELECT t FROM Transaction t WHERE t.deleteFlag = false and t.parentTransaction = null and t.bankAccount.bankAccountId = :bankAccountId ORDER BY t.transactionDate DESC", Transaction.class);
        query.setParameter("bankAccountId", bankAccount.getBankAccountId());
        List<Transaction> transactionList = query.getResultList();
        if (transactionList != null && !transactionList.isEmpty()) {
            return transactionList;
        }
        return null;
    }

    @Override
    public List<Transaction> getAllTransactionListByBankAccountId(Integer bankAccountId) {
        TypedQuery<Transaction> query = getEntityManager().createQuery("SELECT t FROM Transaction t WHERE t.deleteFlag = false AND t.bankAccount.bankAccountId =:bankAccountId ORDER BY t.transactionDate ASC", Transaction.class);
        query.setParameter("bankAccountId", bankAccountId);
        List<Transaction> transactionList = query.getResultList();
        if (transactionList != null && !transactionList.isEmpty()) {
            return transactionList;
        }
        return null;
    }

    @Override
    public List<Transaction> getAllTransactions() {
        TypedQuery<Transaction> query = getEntityManager().createQuery("SELECT t FROM Transaction t WHERE t.deleteFlag = false ORDER BY t.transactionDate ASC", Transaction.class);
        List<Transaction> transactionList = query.getResultList();
        if (transactionList != null && !transactionList.isEmpty()) {
            return transactionList;
        }
        return null;
    }

    @Override
    public List<TransactionView> getAllTransactionViewList(Integer bankAccountId) {
        TypedQuery<TransactionView> query = getEntityManager().createQuery("SELECT t FROM TransactionView t WHERE t.bankAccountId =:bankAccountId ORDER BY t.transactionDate DESC", TransactionView.class);
        query.setParameter("bankAccountId", bankAccountId);
        List<TransactionView> transactionViewList = query.getResultList();
        if (transactionViewList != null && !transactionViewList.isEmpty()) {
            return transactionViewList;
        }
        return null;
    }

    @Override
    public List<TransactionView> getChildTransactionViewListByParentId(Integer parentTransaction) {
        TypedQuery<TransactionView> query = getEntityManager().createQuery("SELECT t FROM TransactionView t WHERE t.parentTransaction =:parentTransaction ORDER BY t.transactionDate ASC", TransactionView.class);
        query.setParameter("parentTransaction", parentTransaction);
        List<TransactionView> transactionViewList = query.getResultList();
        if (transactionViewList != null && !transactionViewList.isEmpty()) {
            return transactionViewList;
        }
        return null;
    }

    @Override
    public List<TransactionView> getTransactionViewList(int pageSize, Integer bankAccountId, int rowCount) {
        TypedQuery<TransactionView> query = getEntityManager().createQuery("SELECT t FROM TransactionView t WHERE t.bankAccountId =:bankAccountId AND t.parentTransaction = null ORDER BY t.transactionDate DESC", TransactionView.class);
        query.setParameter("bankAccountId", bankAccountId);
        query.setFirstResult(pageSize);
        query.setMaxResults(rowCount);
        List<TransactionView> transactionViewList = query.getResultList();
        if (transactionViewList != null && !transactionViewList.isEmpty()) {
            return transactionViewList;
        }
        return null;
    }

    @Override
    public Integer getTotalTransactionCountByBankAccountId(Integer bankAccountId) {
        Query query = getEntityManager().createQuery("SELECT COUNT(t) FROM TransactionView t WHERE t.parentTransaction = null AND t.bankAccountId =:bankAccountId");
        query.setParameter("bankAccountId", bankAccountId);
        List<Object> countList = query.getResultList();
        if (countList != null && !countList.isEmpty()) {
            return ((Long) countList.get(0)).intValue();
        }
        return null;
    }

    @Override
    public Integer getTotalPartiallyExplainedTransactionCountByBankAccountId(Integer bankAccountId) {
        Query query = getEntityManager().createQuery("SELECT COUNT(t) FROM TransactionView t WHERE t.explanationStatusCode =:explanationStatusCode AND t.bankAccountId =:bankAccountId");
        query.setParameter("bankAccountId", bankAccountId);
        query.setParameter("explanationStatusCode", TransactionStatusConstant.PARTIALLYEXPLIANED);
        List<Object> countList = query.getResultList();
        if (countList != null && !countList.isEmpty()) {
            return ((Long) countList.get(0)).intValue();
        }
        return null;
    }

    @Override
    public Integer getTransactionCountByRangeAndBankAccountId(int pageSize, Integer bankAccountId, int rowCount) {
        TypedQuery<TransactionView> query = getEntityManager().createQuery("SELECT t FROM TransactionView t WHERE t.bankAccountId =:bankAccountId AND t.parentTransaction = null ORDER BY t.transactionDate DESC", TransactionView.class);
        query.setParameter("bankAccountId", bankAccountId);
        query.setFirstResult(pageSize);
        query.setMaxResults(rowCount);
        List<TransactionView> transactionViewList = query.getResultList();
        if (transactionViewList != null && !transactionViewList.isEmpty()) {
            return transactionViewList.size();
        }
        return null;
    }

}
