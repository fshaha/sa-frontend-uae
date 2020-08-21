package com.simplevat.rest.financialreport;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.*;

import com.simplevat.constant.ChartOfAccountCategoryCodeEnum;
import com.simplevat.entity.TransactionCategoryClosingBalance;
import com.simplevat.model.TrialBalanceResponseModel;
import com.simplevat.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simplevat.service.TransactionCategoryClosingBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
public class FinancialReportRestHelper {

	@Autowired
	TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	/**
	 *
	 * @param reportRequestModel
	 * @return
	 */
	public BalanceSheetResponseModel getBalanceSheetReport(FinancialReportRequestModel reportRequestModel){

		BalanceSheetResponseModel balanceSheetResponseModel= new BalanceSheetResponseModel();
		ReportRequestModel requestModel = new ReportRequestModel();
		requestModel.setStartDate(reportRequestModel.getStartDate());
		requestModel.setEndDate(reportRequestModel.getEndDate());
		String chartOfAccountCodes = getChartOfAccountCategoryCodes("BalanceSheet");
		requestModel.setChartOfAccountCodes(chartOfAccountCodes);
		List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService.getListByChartOfAccountIds(requestModel);

		if (closingBalanceList != null && !closingBalanceList.isEmpty()) {
			Map<Integer,TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = processTransactionCategoryClosingBalance(closingBalanceList);
			BigDecimal totalCurrentAssets = BigDecimal.ZERO;
			BigDecimal totalAccumulatedDepriciation = BigDecimal.ZERO;
			BigDecimal totalOtherCurrentAssets = BigDecimal.ZERO;
			BigDecimal totalFixedAssets = BigDecimal.ZERO;
			BigDecimal totalAccountReceivable =BigDecimal.ZERO;
			BigDecimal totalAccountPayable =BigDecimal.ZERO;
			BigDecimal totalOtherCurrentLiability = BigDecimal.ZERO;
			BigDecimal totalOtherLiability = BigDecimal.ZERO;
			BigDecimal totalEquities = BigDecimal.ZERO;
//Profit and Loss
			BigDecimal totalOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalCostOfGoodsSold = BigDecimal.ZERO;
			BigDecimal totalOperatingExpense = BigDecimal.ZERO;

			BigDecimal totalNonOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalNonOperatingExpense = BigDecimal.ZERO;

			BigDecimal totalBank = BigDecimal.ZERO;

			for (Map.Entry<Integer,TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet()) {
				TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
				String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory().getChartOfAccount().getChartOfAccountCode();
				String transactionCategoryName = transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryName();
				BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();
				if (closingBalance.longValue() < 0) {
					closingBalance = closingBalance.negate();
				}
				ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
				if (chartOfAccountCategoryCodeEnum == null)
					continue;
				switch (chartOfAccountCategoryCodeEnum) {
					case CASH:
						balanceSheetResponseModel.getCurrentAssets().put(transactionCategoryName,closingBalance);
						totalCurrentAssets = totalCurrentAssets.add(closingBalance);
						break;
					case BANK:
						balanceSheetResponseModel.getBank().put(transactionCategoryName,closingBalance);
						totalBank = totalBank.add(closingBalance);
						break;

					case CURRENT_ASSET:
						balanceSheetResponseModel.getCurrentAssets().put(transactionCategoryName,closingBalance);
						totalCurrentAssets = totalCurrentAssets.add(closingBalance);
						break;

					case ACCOUNTS_RECEIVABLE:
						totalAccountReceivable = totalAccountReceivable.add(closingBalance);
						break;

					case FIXED_ASSET:
						balanceSheetResponseModel.getFixedAssets().put(transactionCategoryName,closingBalance);
						if(transactionCategoryName.contains("Depreciation")){
							totalAccumulatedDepriciation= totalAccumulatedDepriciation.add(closingBalance);
						}
						totalFixedAssets = totalFixedAssets.add(closingBalance);
						break;

					case OTHER_CURRENT_ASSET:
						balanceSheetResponseModel.getOtherCurrentAssets().put(transactionCategoryName,closingBalance);
						totalOtherCurrentAssets = totalOtherCurrentAssets.add(closingBalance);
						break;

					case OTHER_LIABILITY:
						balanceSheetResponseModel.getOtherLiability().put(transactionCategoryName,closingBalance);
						totalOtherLiability = totalOtherLiability.add(closingBalance);
						break;

					case ACCOUNTS_PAYABLE:
						totalAccountPayable = totalAccountPayable.add(closingBalance);
						break;

					case OTHER_CURRENT_LIABILITIES:
						balanceSheetResponseModel.getOtherCurrentLiability().put(transactionCategoryName,closingBalance);
						totalOtherCurrentLiability = totalOtherCurrentLiability.add(closingBalance);
						break;

					case EQUITY:
						balanceSheetResponseModel.getEquities().put(transactionCategoryName,closingBalance);
						totalEquities = totalEquities.add(closingBalance);
						break;
					case INCOME:
						if (transactionCategoryName.equalsIgnoreCase("Sales") ||
								transactionCategoryName.equalsIgnoreCase("Other Charges")) {
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						} else {
							totalNonOperatingIncome = totalNonOperatingIncome.add(closingBalance);
						}
						break;
					case ADMIN_EXPENSE:
						totalOperatingExpense = totalOperatingExpense.add(closingBalance);
						break;
					case OTHER_EXPENSE:
						totalNonOperatingExpense = totalNonOperatingExpense.add(closingBalance);
						break;
					case COST_OF_GOODS_SOLD:
						totalCostOfGoodsSold = totalCostOfGoodsSold.add(closingBalance);
						break;
					default:
						break;
				}
			}
			balanceSheetResponseModel.setTotalBank(totalBank);
			totalCurrentAssets = totalCurrentAssets.add(totalAccountReceivable).add(totalOtherCurrentAssets).add(totalBank);
			balanceSheetResponseModel.setTotalCurrentAssets(totalCurrentAssets);
			balanceSheetResponseModel.setTotalAccountReceivable(totalAccountReceivable);
			balanceSheetResponseModel.setTotalOtherCurrentAssets(totalOtherCurrentAssets);
			totalFixedAssets=totalFixedAssets.subtract(totalAccumulatedDepriciation);
			balanceSheetResponseModel.setTotalFixedAssets(totalFixedAssets);
			BigDecimal totalAssets = totalCurrentAssets.add(totalFixedAssets);
			balanceSheetResponseModel.setTotalAssets(totalAssets);
			BigDecimal totalIncome = totalOperatingIncome.add(totalNonOperatingIncome);
			BigDecimal totalExpense = totalCostOfGoodsSold.add(totalOperatingExpense).add(totalNonOperatingExpense);
			BigDecimal netProfitLoss = totalIncome.subtract(totalExpense);
//			if(netProfitLoss.longValue()<0)
//				netProfitLoss = netProfitLoss.negate();
			balanceSheetResponseModel.getOtherLiability().put("Retained Earnings",netProfitLoss);
			balanceSheetResponseModel.setTotalOtherLiability(totalOtherLiability);
			balanceSheetResponseModel.setTotalOtherCurrentLiability(totalOtherCurrentLiability);
			BigDecimal totalLiabilities = totalOtherLiability.add(totalOtherCurrentLiability).add(totalAccountPayable).add(netProfitLoss);
			balanceSheetResponseModel.setTotalLiability(totalLiabilities);
			balanceSheetResponseModel.setTotalAccountPayable(totalAccountPayable);
			balanceSheetResponseModel.setTotalEquities(totalEquities);
			BigDecimal totalLiabilityEquities =totalLiabilities.add(totalEquities);
			balanceSheetResponseModel.setTotalLiabilityEquities(totalLiabilityEquities);

		}
	return balanceSheetResponseModel;
	}
	public ProfitAndLossResponseModel getProfitAndLossReport(FinancialReportRequestModel reportRequestModel) {

		ProfitAndLossResponseModel responseModel = new ProfitAndLossResponseModel();
		ReportRequestModel requestModel = new ReportRequestModel();
		requestModel.setStartDate(reportRequestModel.getStartDate());
		requestModel.setEndDate(reportRequestModel.getEndDate());
		String chartOfAccountCodes = getChartOfAccountCategoryCodes("ProfitLoss");
		requestModel.setChartOfAccountCodes(chartOfAccountCodes);
		List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService.getListByChartOfAccountIds(requestModel);

		if (closingBalanceList != null && !closingBalanceList.isEmpty()) {
			Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = processTransactionCategoryClosingBalance(closingBalanceList);
			BigDecimal totalOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalCostOfGoodsSold = BigDecimal.ZERO;
			BigDecimal totalOperatingExpense = BigDecimal.ZERO;

			BigDecimal totalNonOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalNonOperatingExpense = BigDecimal.ZERO;

			for (Map.Entry<Integer, TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet()) {
				TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
				String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory().getChartOfAccount().getChartOfAccountCode();
				String transactionCategoryName = transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryName();
				BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();
				ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.
						getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
				if (chartOfAccountCategoryCodeEnum == null)
					continue;
				if (closingBalance.longValue() < 0) {
					closingBalance = closingBalance.negate();
				}
				switch (chartOfAccountCategoryCodeEnum) {
					case INCOME:
						if (transactionCategoryName.equalsIgnoreCase("Sales") ||
								transactionCategoryName.equalsIgnoreCase("Other Charges")) {
							responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						} else {
							responseModel.getNonOperatingIncome().put(transactionCategoryName, closingBalance);
							totalNonOperatingIncome = totalNonOperatingIncome.add(closingBalance);
						}
						break;
					case ADMIN_EXPENSE:
						responseModel.getOperatingExpense().put(transactionCategoryName, closingBalance);
						totalOperatingExpense = totalOperatingExpense.add(closingBalance);
						break;

					case OTHER_EXPENSE:
						responseModel.getNonOperatingExpense().put(transactionCategoryName, closingBalance);
						totalNonOperatingExpense = totalNonOperatingExpense.add(closingBalance);
						break;
					case COST_OF_GOODS_SOLD:
						responseModel.getCostOfGoodsSold().put(transactionCategoryName, closingBalance);
						totalCostOfGoodsSold = totalCostOfGoodsSold.add(closingBalance);
						break;
					default:
						break;
				}
			}
				responseModel.setTotalOperatingIncome(totalOperatingIncome);
				responseModel.setTotalCostOfGoodsSold(totalCostOfGoodsSold);

				BigDecimal grossProfit = totalOperatingIncome.subtract(totalCostOfGoodsSold);
				responseModel.setGrossProfit(grossProfit);

				responseModel.setTotalOperatingExpense(totalOperatingExpense);

				BigDecimal operatingProfit = grossProfit.subtract(totalOperatingExpense);
				responseModel.setOperatingProfit(operatingProfit);

				responseModel.setTotalNonOperatingIncome(totalNonOperatingIncome);
				responseModel.setTotalNonOperatingExpense(totalNonOperatingExpense);
				BigDecimal totalNonOperatingIncomeLoss = totalNonOperatingIncome.subtract(totalNonOperatingExpense);
				responseModel.setNonOperatingIncomeExpense(totalNonOperatingIncomeLoss);

				BigDecimal netProfitLoss = operatingProfit.add(totalNonOperatingIncomeLoss);
				responseModel.setNetProfitLoss(netProfitLoss);
		}
		return responseModel;
	}

	public String getChartOfAccountCategoryCodes(String chartOfAccountType) {
		StringBuilder builder = new StringBuilder();
		switch (chartOfAccountType) {
			case "ProfitLoss":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.INCOME.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode()).append("'");
				break;
			case "BalanceSheet":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_RECEIVABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.BANK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CASH.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.FIXED_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.STOCK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_PAYABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_LIABILITIES.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_LIABILITY.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.EQUITY.getCode()).append("',");
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.INCOME.getCode()).append("',")
					.append("'").append(ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode()).append("',")
					.append("'").append(ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()).append("',")
					.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode()).append("'");
				break;
			case "TrailBalance":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.INCOME.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_RECEIVABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.BANK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CASH.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.FIXED_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.STOCK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_PAYABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_LIABILITIES.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_LIABILITY.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.EQUITY.getCode()).append("'");
				break;
			case "VatReport":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_LIABILITIES.getCode()).append("'");
				break;
		}
		return builder.toString();
	}

	public TrialBalanceResponseModel getTrialBalanceReport(FinancialReportRequestModel reportRequestModel) {
		TrialBalanceResponseModel trialBalanceResponseModel = new TrialBalanceResponseModel();
		ReportRequestModel requestModel = new ReportRequestModel();
		requestModel.setStartDate(reportRequestModel.getStartDate());
		requestModel.setEndDate(reportRequestModel.getEndDate());
		String chartOfAccountCodes = getChartOfAccountCategoryCodes("TrailBalance");
		requestModel.setChartOfAccountCodes(chartOfAccountCodes);
		List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService.getListByChartOfAccountIds(requestModel);

		if (closingBalanceList != null && !closingBalanceList.isEmpty()) {
			Map<Integer,TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = processTransactionCategoryClosingBalance(closingBalanceList);
			BigDecimal totalDebitAmount = BigDecimal.ZERO;
			BigDecimal totalCreditAmount = BigDecimal.ZERO;

			for (Map.Entry<Integer,TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet())
			{
				TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
				String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory().getChartOfAccount().getChartOfAccountCode();
				String transactionCategoryName = transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryName();
				BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();
				Boolean isDebitFlag = true;
				if(closingBalance.longValue()<0)
				{	closingBalance = closingBalance.negate();
					isDebitFlag = false;

				}
				ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.
						getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
				if (chartOfAccountCategoryCodeEnum == null)
					continue;
				switch (chartOfAccountCategoryCodeEnum)
				{
					case ACCOUNTS_RECEIVABLE:
						trialBalanceResponseModel.getAccountReceivable().put(transactionCategoryName,
								closingBalance);
						if(isDebitFlag) {
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						}else
							{
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						}
						break;

					case BANK:
					case CASH:
						trialBalanceResponseModel.getBank().put(transactionCategoryName,
								closingBalance);
						if(isDebitFlag) {
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						}else
						{
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						}
						break;
					case OTHER_CURRENT_ASSET:
							trialBalanceResponseModel.getAssets().put(transactionCategoryName,
									closingBalance);
						if(isDebitFlag) {
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						}else
						{
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						}
						break;
					case FIXED_ASSET:
						trialBalanceResponseModel.getFixedAsset().put(transactionCategoryName,
								closingBalance);
						if(isDebitFlag) {
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						}else
						{
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						}
						break;

					case ACCOUNTS_PAYABLE:
						trialBalanceResponseModel.getAccountpayable().put(transactionCategoryName,
								closingBalance);
						if(isDebitFlag) {
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						}else
						{
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						}
						break;
					case OTHER_LIABILITY:
					case OTHER_CURRENT_LIABILITIES:
						trialBalanceResponseModel.getLiabilities().put(transactionCategoryName,
								closingBalance);
						if(isDebitFlag) {
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						}else
						{
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						}

						break;
					case EQUITY:
						trialBalanceResponseModel.getEquities().put(transactionCategoryName,closingBalance);
						if(isDebitFlag) {
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						}else
						{
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						}
						break;
					case INCOME:

						trialBalanceResponseModel.getIncome().put(transactionCategoryName,
								closingBalance);
						if(isDebitFlag) {
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						}else
						{
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						}
						break;
					case ADMIN_EXPENSE:
					case OTHER_EXPENSE:
					case COST_OF_GOODS_SOLD:
						trialBalanceResponseModel.getExpense().put(transactionCategoryName,
								closingBalance);
						if(isDebitFlag) {
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						}else
						{
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						}
						break;
					default:
						break;
				}
			}
			trialBalanceResponseModel.setTotalCreditAmount(totalCreditAmount);
			trialBalanceResponseModel.setTotalDebitAmount(totalDebitAmount);
		}
		return trialBalanceResponseModel;
	}

	public Map<Integer, TransactionCategoryClosingBalance> processTransactionCategoryClosingBalance(List<TransactionCategoryClosingBalance> closingBalanceList) {
		Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = new HashMap<>();
		for(TransactionCategoryClosingBalance transactionCategoryClosingBalance :closingBalanceList)
		{
			TransactionCategoryClosingBalance tempTransactionCategoryClosingBalance = transactionCategoryClosingBalanceMap.get(transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryId());

			if(tempTransactionCategoryClosingBalance==null)
			{
				tempTransactionCategoryClosingBalance = new TransactionCategoryClosingBalance();
				tempTransactionCategoryClosingBalance.setOpeningBalance(transactionCategoryClosingBalance.getOpeningBalance());
				tempTransactionCategoryClosingBalance.setClosingBalance(transactionCategoryClosingBalance.getClosingBalance());
				tempTransactionCategoryClosingBalance.setClosingBalanceDate(transactionCategoryClosingBalance.getClosingBalanceDate());
				tempTransactionCategoryClosingBalance.setTransactionCategory(transactionCategoryClosingBalance.getTransactionCategory());
				transactionCategoryClosingBalanceMap.put(transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryId(),tempTransactionCategoryClosingBalance);
			}
			else
				tempTransactionCategoryClosingBalance.setOpeningBalance(transactionCategoryClosingBalance.getOpeningBalance());
			tempTransactionCategoryClosingBalance.setCreatedDate(Date.from(transactionCategoryClosingBalance.getClosingBalanceDate().atZone(ZoneId.systemDefault()).toInstant()));
		}
		return transactionCategoryClosingBalanceMap;
	}
}
