package com.simplevat.dao.invoice;

import com.simplevat.dao.AbstractDao;
import com.simplevat.entity.Event;
import com.simplevat.entity.invoice.Invoice;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.Query;
import javax.persistence.TemporalType;
import javax.persistence.TypedQuery;

import org.springframework.stereotype.Repository;

/**
 *
 * @author Hiren
 */
@Repository
public class InvoiceDaoImpl extends AbstractDao<Integer, Invoice> implements InvoiceDao {

    @Override
    public List<Object[]> getInvocePerMonth(Date startDate, Date endDate) {
        List<Object[]> invoices = new ArrayList<>(0);
        try {
            String queryString = "select "
                    + "sum(li.invoiceLineItemUnitPrice*li.invoiceLineItemQuantity) as invoiceTotal, "
                    + "CONCAT(MONTH(i.invoiceDate),'-', Year(i.invoiceDate)) as month "
                    + "from Invoice i JOIN i.invoiceLineItems li "
                    + "where i.deleteFlag = 'false' and li.deleteFlag= 'false' "
                    + "and i.invoiceDate BETWEEN :startDate AND :endDate "
                    + "group by CONCAT(MONTH(i.invoiceDate),'-' , Year(i.invoiceDate))";

            Query query = getEntityManager().createQuery(queryString)
                    .setParameter("startDate", startDate, TemporalType.DATE)
                    .setParameter("endDate", endDate, TemporalType.DATE);
            invoices = query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return invoices;
    }

    @Override
    public List<Object[]> getInvoices(Date startDate, Date endDate) {
        List<Object[]> invoices = new ArrayList<>(0);
        try {
            String queryString = "select "
                    + "sum(li.invoiceLineItemUnitPrice*li.invoiceLineItemQuantity) as invoiceTotal, "
                    + "i.invoiceDate as date, i.invoiceReferenceNumber as refNum,  "
                    + "i.invoiceId as invoiceId "
                    + "from Invoice i JOIN i.invoiceLineItems li "
                    + "where i.deleteFlag = 'false' and li.deleteFlag= 'false' "
                    + "and i.invoiceDate BETWEEN :startDate AND :endDate "
                    + "group by i.invoiceId";
            //+ "order by i.invoiceDate asc";

            Query query = getEntityManager().createQuery(queryString)
                    .setParameter("startDate", startDate, TemporalType.DATE)
                    .setParameter("endDate", endDate, TemporalType.DATE);
            invoices = query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return invoices;
    }

    @Override
    public List<Object[]> getVatInPerMonth(Date startDate, Date endDate) {
        List<Object[]> invoices = new ArrayList<>(0);
        try {
            String queryString = "select "
                    + "sum((li.invoiceLineItemUnitPrice*li.invoiceLineItemQuantity*li.invoiceLineItemVat)/100) as vatInTotal, "
                    + "CONCAT(MONTH(i.invoiceDate),'-' , Year(i.invoiceDate)) as month "
                    + "from Invoice i JOIN i.invoiceLineItems li "
                    + "where i.deleteFlag = 'false' and li.deleteFlag= 'false' "
                    + "and i.invoiceDate BETWEEN :startDate AND :endDate "
                    + "group by CONCAT(MONTH(i.invoiceDate),'-' , Year(i.invoiceDate))";

            Query query = getEntityManager().createQuery(queryString)
                    .setParameter("startDate", startDate, TemporalType.DATE)
                    .setParameter("endDate", endDate, TemporalType.DATE);
            invoices = query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return invoices;
    }

    @Override
    public List<Object[]> getInvoiceDue(Date startDate, Date endDate) {
        List<Object[]> invoices = new ArrayList<>(0);
        try {
            String queryString = "select "
                    + "invoiceReferenceNumber, invoiceText, invoiceDate, invoiceDueOn "
                    + "from Invoice i "
                    + "where i.deleteFlag = 'false' "
                    + "and i.invoiceDate BETWEEN :startDate AND :endDate ";
            Query query = getEntityManager().createQuery(queryString)
                    .setParameter("startDate", startDate, TemporalType.DATE)
                    .setParameter("endDate", endDate, TemporalType.DATE);
            invoices = query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return invoices;
    }

    @Override
    public List<Invoice> getInvoiceListByDueDate() {
        TypedQuery<Invoice> query = getEntityManager().createQuery("Select i from Invoice i where i.deleteFlag = false and i.invoiceDueDate =:invoiceDueDate", Invoice.class);
        query.setParameter("invoiceDueDate", LocalDateTime.now());
        if (query.getResultList() != null && !query.getResultList().isEmpty()) {
            return query.getResultList();
        }
        return null;
    }
}
