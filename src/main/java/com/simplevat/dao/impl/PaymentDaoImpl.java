/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao.impl;

import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.PaymentFilterEnum;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.PaymentDao;
import com.simplevat.entity.Payment;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Ashish
 */
@Repository(value = "paymentDao")
public class PaymentDaoImpl extends AbstractDao<Integer, Payment> implements PaymentDao {

    @Override
    public List<Payment> getPayments(Map<PaymentFilterEnum, Object> filterMap) {
        List<DbFilter> dbFilters = new ArrayList();
        filterMap.forEach((productFilter, value) -> dbFilters.add(DbFilter.builder()
                .dbCoulmnName(productFilter.getDbColumnName())
                .condition(productFilter.getCondition())
                .value(value).build()));
        List<Payment> payments = this.executeQuery(dbFilters);
        return payments;
    }

    @Override
    @Transactional
    public void deleteByIds(List<Integer> ids) {
        if (ids != null && !ids.isEmpty()) {
            for (Integer id : ids) {
                Payment payment = findByPK(id);
                payment.setDeleteFlag(Boolean.TRUE);
                update(payment);
            }
        }
    }

}
