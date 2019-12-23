package com.simplevat.service.impl;

import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.simplevat.criteria.TransactionCategoryFilterNew;
import com.simplevat.criteria.bankaccount.TransactionCategoryCriteria;
import com.simplevat.dao.bankaccount.TransactionCategoryDaoNew;
import com.simplevat.entity.Activity;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.service.TransactionCategoryService;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service("transactionCategoryService")
@Transactional
public class TransactionCategoryServiceImpl extends TransactionCategoryService {

    private static final String TRANSACTION_CATEGORY = "TRANSACTION_CATEGORY";

    @Autowired
    @Qualifier(value = "transactionCategoryDao")
    private TransactionCategoryDaoNew dao;

    @Override
    public TransactionCategoryDaoNew getDao() {
        return dao;
    }

    @Override
    public List<TransactionCategory> findAllTransactionCategory() {
        return getDao().executeNamedQuery("findAllTransactionCategory");
    }

    @Override
    public List<TransactionCategory> findAllTransactionCategoryByUserId(Integer userId) {
        Map<String, Object> parameterDataMap = new HashMap();
        parameterDataMap.put("createdBy", userId);
        return getDao().executeQuery(parameterDataMap);
    }

    @Override
    public TransactionCategory getDefaultTransactionCategory() {
        List<TransactionCategory> transactionCategories = findAllTransactionCategory();

        if (CollectionUtils.isNotEmpty(transactionCategories)) {
            return transactionCategories.get(0);
        }
        return null;
    }

    @Override
    public List<TransactionCategory> getCategoriesByComplexCriteria(TransactionCategoryCriteria criteria) {
        TransactionCategoryFilterNew filter = new TransactionCategoryFilterNew(criteria);
        return this.filter(filter);

    }

    @Override
    public List<TransactionCategory> findAllTransactionCategoryByTransactionType(Integer transactionTypeCode, String name) {
        return dao.findAllTransactionCategoryByTransactionType(transactionTypeCode, name);
    }

    @Override
    public List<TransactionCategory> findTransactionCategoryListByParentCategory(Integer parentCategoryId) {
        return dao.findTransactionCategoryListByParentCategory(parentCategoryId);
    }

    @Override
    public TransactionCategory getDefaultTransactionCategoryByTransactionCategoryId(Integer transactionCategoryId) {
        return dao.getDefaultTransactionCategoryByTransactionCategoryId(transactionCategoryId);
    }

    public void persist(TransactionCategory transactionCategory) {
        super.persist(transactionCategory, null, getActivity(transactionCategory, "CREATED"));
    }

    public TransactionCategory update(TransactionCategory transactionCategory) {
        return super.update(transactionCategory, null, getActivity(transactionCategory, "UPDATED"));
    }

    private Activity getActivity(TransactionCategory transactionCategory, String activityCode) {
        Activity activity = new Activity();
        activity.setActivityCode(activityCode);
        activity.setModuleCode(TRANSACTION_CATEGORY);
        activity.setField3("Transaction Category " + activityCode.charAt(0) + activityCode.substring(1, activityCode.length()).toLowerCase());
        activity.setField1(transactionCategory.getTransactionCategoryCode());
        activity.setField2(transactionCategory.getTransactionCategoryName());
        activity.setLastUpdateDate(LocalDateTime.now());
        activity.setLoggingRequired(true);
        return activity;
    }

    @Override
    public void deleteByIds(List<Integer> ids) {
        dao.deleteByIds(ids);
    }
}
