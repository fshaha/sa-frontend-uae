/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.rest.expenses;

import com.simplevat.bank.model.DeleteModel;
import com.simplevat.constant.TransactionTypeConstant;
import com.simplevat.helper.ExpenseRestHelper;
import com.simplevat.entity.Expense;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.ExpenseService;
import com.simplevat.service.TransactionCategoryService;
import com.simplevat.service.UserServiceNew;
import io.swagger.annotations.ApiOperation;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author daynil
 */
@RestController
@RequestMapping("/rest/expense")
public class ExpenseRestController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private TransactionCategoryService transactionCategoryService;

    @Autowired
    private UserServiceNew userServiceNew;

    @Autowired
    private ExpenseRestHelper controllerHelper;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @ApiOperation(value = "Get Expense List")
    @RequestMapping(method = RequestMethod.GET, value = "/retrieveExpenseList")

    public ResponseEntity expenseList() {
        try {
            List<ExpenseRestModel> expenses = new ArrayList<>();
            System.out.println("expenseService=" + expenseService);
            System.out.println("transactionCategoryService=" + transactionCategoryService);
            List<Expense> expenseList = expenseService.getExpenses();
            for (Expense expense : expenseList) {
                ExpenseRestModel model = controllerHelper.getExpenseModel(expense);
                if (expense.getExpencyAmountCompanyCurrency() != null) {
                    model.setExpenseAmountCompanyCurrency(expense.getExpencyAmountCompanyCurrency());
                }
                expenses.add(model);
            }
            return new ResponseEntity(expenses, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @ApiOperation(value = "Add New Expense")
    @RequestMapping(method = RequestMethod.POST, value = "/save")
    public ResponseEntity saveExpense(@ModelAttribute ExpenseRestModel expenseRestModel, HttpServletRequest request) {
        try {
            Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
            expenseRestModel.setUserId(userId);
            controllerHelper.saveExpense(expenseRestModel);
            if (expenseRestModel.getAttachmentFile() != null) {
                System.out.println("===Expense===" + expenseRestModel.getAttachmentFile().getOriginalFilename());
            }
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @ApiOperation(value = "Get Expense Detail by Expanse Id")
    @RequestMapping(method = RequestMethod.GET, value = "/getExpenseById")
    public ResponseEntity viewExpense(@RequestParam("expenseId") Integer expenseId) {
        try {
            System.out.println("expenseId=" + expenseId);
            return new ResponseEntity(controllerHelper.getExpenseById(expenseId), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequestMapping(method = RequestMethod.DELETE, value = "/delete")
    public ResponseEntity deleteExpense(@RequestParam("expenseId") Integer expenseId) {
        try {
            System.out.println("expenseId=" + expenseId);
            controllerHelper.deleteExpense(expenseId);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequestMapping(method = RequestMethod.DELETE, value = "/deletes")
    public ResponseEntity deleteExpenses(@RequestBody DeleteModel expenseIds) {
        try {
            System.out.println("expenseId=" + expenseIds);
            controllerHelper.deleteExpenses(expenseIds);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/claimants")
    public ResponseEntity getClaimants() {
        try {
            return new ResponseEntity(controllerHelper.users(userServiceNew), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "/categories")
    public ResponseEntity getCategorys(@RequestParam("categoryName") String queryString) {
        try {
            System.out.println("queryString=" + queryString);
            List<TransactionCategory> transactionCategoryList = transactionCategoryService.findAllTransactionCategoryByTransactionType(TransactionTypeConstant.TRANSACTION_TYPE_EXPENSE, queryString);
            return new ResponseEntity(controllerHelper.completeCategory(transactionCategoryList), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
